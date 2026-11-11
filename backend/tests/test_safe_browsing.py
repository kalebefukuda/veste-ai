import httpx
import pytest
from fastapi.testclient import TestClient

from app.clients import safe_browsing
from tests.test_looks import DONO, LOOK, PECA, token

AMEACA = {
    "matches": [
        {"threatType": "SOCIAL_ENGINEERING", "threat": {"url": "https://phishing.exemplo"}}
    ]
}


# O `cache_clear` tem que valer nos dois lados: o monkeypatch desfaz a variável de
# ambiente, mas as settings já construídas continuam em cache — e a chave falsa seguia
# valendo nos testes seguintes, que passaram a consultar o Google de verdade.
@pytest.fixture
def com_chave(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("SAFE_BROWSING_API_KEY", "chave-de-teste")
    safe_browsing.get_settings.cache_clear()
    yield
    safe_browsing.get_settings.cache_clear()


def responder(monkeypatch: pytest.MonkeyPatch, corpo: dict) -> dict:
    capturado: dict[str, object] = {}

    def fake_post(url: str, **kwargs: object) -> httpx.Response:
        capturado["url"] = url
        capturado.update(kwargs)
        return httpx.Response(200, json=corpo, request=httpx.Request("POST", url))

    monkeypatch.setattr(safe_browsing.httpx, "post", fake_post)

    return capturado


def test_resposta_vazia_e_link_limpo(com_chave, monkeypatch: pytest.MonkeyPatch) -> None:
    capturado = responder(monkeypatch, {})

    assert safe_browsing.e_perigoso("https://loja.exemplo.com/x") is False
    # Sem timeout, um Google lento seguraria o cadastro da peça indefinidamente.
    assert capturado["timeout"] == safe_browsing.TIMEOUT


def test_correspondencia_marca_o_link_como_perigoso(
    com_chave, monkeypatch: pytest.MonkeyPatch
) -> None:
    responder(monkeypatch, AMEACA)

    assert safe_browsing.e_perigoso("https://phishing.exemplo") is True


# Sem chave o cliente não toca na rede — é o que mantém desenvolvimento e suíte
# rodando sem depender de credencial, igual ao cliente de e-mail.
def test_sem_chave_nao_chama_a_rede(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("SAFE_BROWSING_API_KEY", "")
    safe_browsing.get_settings.cache_clear()

    def explode(*_: object, **__: object) -> None:
        raise AssertionError("não devia ter chamado a rede")

    monkeypatch.setattr(safe_browsing.httpx, "post", explode)

    assert safe_browsing.e_perigoso("https://loja.exemplo.com/x") is False


# Falha aberta, e de propósito: se o Google cair, recusar todo cadastro de peça
# derrubaria o produto por um motivo que não é nosso nem do creator — ADR-0022.
@pytest.mark.parametrize(
    "falha",
    [httpx.ConnectError("sem rede"), httpx.ReadTimeout("demorou")],
)
def test_google_fora_do_ar_nao_bloqueia_o_cadastro(
    com_chave, monkeypatch: pytest.MonkeyPatch, falha: Exception
) -> None:
    def fake_post(*_: object, **__: object) -> httpx.Response:
        raise falha

    monkeypatch.setattr(safe_browsing.httpx, "post", fake_post)

    assert safe_browsing.e_perigoso("https://loja.exemplo.com/x") is False


def test_a_peca_com_link_marcado_e_recusada(
    client: TestClient, com_chave, monkeypatch: pytest.MonkeyPatch
) -> None:
    responder(monkeypatch, AMEACA)
    client.headers["Authorization"] = f"Bearer {token(client, DONO)}"
    look = client.post("/looks", json=LOOK).json()["id"]

    resposta = client.post(f"/looks/{look}/pieces", json=PECA)

    assert resposta.status_code == 422
    assert resposta.json()["code"] == "UNSAFE_LINK"


def test_a_peca_com_link_limpo_entra(
    client: TestClient, com_chave, monkeypatch: pytest.MonkeyPatch
) -> None:
    responder(monkeypatch, {})
    client.headers["Authorization"] = f"Bearer {token(client, DONO)}"
    look = client.post("/looks", json=LOOK).json()["id"]

    assert client.post(f"/looks/{look}/pieces", json=PECA).status_code == 201
