import pytest
from fastapi.testclient import TestClient

from app.core.exceptions import EmailDeliveryFailed

CREDENCIAIS = {"name": "Mariana", "email": "boas-vindas@exemplo.com", "password": "senha-bem-longa"}


@pytest.fixture
def enviados(monkeypatch: pytest.MonkeyPatch) -> list[tuple[str, str, str]]:
    registro: list[tuple[str, str, str]] = []
    monkeypatch.setattr(
        "app.services.welcome_service.send_email",
        lambda to, subject, html, text: registro.append((to, subject, html)),
    )
    return registro


def test_cadastro_dispara_boas_vindas(client: TestClient, enviados: list) -> None:
    client.post("/auth/register", json=CREDENCIAIS)

    assert len(enviados) == 1
    assert enviados[0][0] == CREDENCIAIS["email"]
    assert "VesteAí" in enviados[0][1]


def test_o_email_chama_a_pessoa_pelo_nome(client: TestClient, enviados: list) -> None:
    client.post("/auth/register", json=CREDENCIAIS)

    assert "Mariana" in enviados[0][2]


# O editor de looks ainda não existe: prometer "crie seu primeiro look" num botão
# levaria a pessoa a uma tela vazia — o mesmo erro que a política já contou.
def test_o_email_nao_promete_o_que_ainda_nao_existe(client: TestClient, enviados: list) -> None:
    corpo = enviados if client.post("/auth/register", json=CREDENCIAIS) else enviados
    html = corpo[0][2].lower()

    assert "em desenvolvimento" in html
    assert "crie seu primeiro look" not in html


# A conta já foi criada quando o e-mail sai. Brevo fora do ar não pode transformar um
# cadastro bem-sucedido em erro para quem acabou de se cadastrar.
def test_falha_no_envio_nao_derruba_o_cadastro(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    def explode(*_args: object, **_kwargs: object) -> None:
        raise EmailDeliveryFailed()

    monkeypatch.setattr("app.services.welcome_service.send_email", explode)

    resposta = client.post("/auth/register", json=CREDENCIAIS)

    assert resposta.status_code == 201
    assert client.post(
        "/auth/login",
        json={"email": CREDENCIAIS["email"], "password": CREDENCIAIS["password"]},
    ).status_code == 200
