import httpx
import pytest

from app.clients import brevo
from app.core.exceptions import EmailDeliveryFailed


@pytest.fixture(autouse=True)
def _com_chave(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("BREVO_API_KEY", "chave-de-teste")
    brevo.get_settings.cache_clear()


def test_envia_com_o_payload_que_a_brevo_espera(monkeypatch: pytest.MonkeyPatch) -> None:
    capturado: dict[str, object] = {}

    def fake_post(url: str, **kwargs: object) -> httpx.Response:
        capturado["url"] = url
        capturado.update(kwargs)
        return httpx.Response(201, request=httpx.Request("POST", url))

    monkeypatch.setattr(brevo.httpx, "post", fake_post)

    brevo.send_email("mariana@exemplo.com", "Assunto", "<p>corpo</p>", "corpo")

    assert capturado["url"] == brevo.ENDPOINT
    assert capturado["headers"]["api-key"] == "chave-de-teste"
    assert capturado["json"]["to"] == [{"email": "mariana@exemplo.com"}]
    # Sem timeout, uma Brevo lenta seguraria a requisição do usuário indefinidamente.
    assert capturado["timeout"] == brevo.TIMEOUT


# A fronteira de camada exige que erro de biblioteca não vaze para cima.
@pytest.mark.parametrize(
    "falha",
    [
        httpx.ConnectError("sem rede"),
        httpx.ReadTimeout("demorou"),
    ],
)
def test_falha_de_rede_vira_excecao_de_dominio(
    monkeypatch: pytest.MonkeyPatch, falha: Exception
) -> None:
    def fake_post(*_args: object, **_kwargs: object) -> httpx.Response:
        raise falha

    monkeypatch.setattr(brevo.httpx, "post", fake_post)

    with pytest.raises(EmailDeliveryFailed):
        brevo.send_email("mariana@exemplo.com", "Assunto", "<p>corpo</p>", "corpo")


def test_status_de_erro_vira_excecao_de_dominio(monkeypatch: pytest.MonkeyPatch) -> None:
    def fake_post(url: str, **_kwargs: object) -> httpx.Response:
        return httpx.Response(401, request=httpx.Request("POST", url))

    monkeypatch.setattr(brevo.httpx, "post", fake_post)

    with pytest.raises(EmailDeliveryFailed):
        brevo.send_email("mariana@exemplo.com", "Assunto", "<p>corpo</p>", "corpo")


def test_sem_chave_configurada_falha_sem_chamar_a_brevo(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("BREVO_API_KEY", "")
    brevo.get_settings.cache_clear()

    def nao_deveria_chamar(*_args: object, **_kwargs: object) -> None:
        raise AssertionError("não pode tentar enviar sem chave")

    monkeypatch.setattr(brevo.httpx, "post", nao_deveria_chamar)

    with pytest.raises(EmailDeliveryFailed):
        brevo.send_email("mariana@exemplo.com", "Assunto", "<p>corpo</p>", "corpo")


# Log com e-mail inteiro é dado pessoal em texto claro — o Padrão de logs proíbe.
def test_o_log_nao_expoe_o_email_inteiro(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    monkeypatch.setattr(
        brevo.httpx, "post", lambda *a, **k: (_ for _ in ()).throw(httpx.ConnectError("x"))
    )

    with caplog.at_level("WARNING"), pytest.raises(EmailDeliveryFailed):
        brevo.send_email("mariana@exemplo.com", "Assunto", "<p>corpo</p>", "corpo")

    assert "mariana@exemplo.com" not in caplog.text
    assert "ma***@exemplo.com" in caplog.text


# E-mail sem alternativa em texto entrega pior e é inacessível a leitor de tela.
def test_manda_texto_puro_junto_do_html(monkeypatch: pytest.MonkeyPatch) -> None:
    capturado: dict[str, object] = {}

    def fake_post(url: str, **kwargs: object) -> httpx.Response:
        capturado.update(kwargs)
        return httpx.Response(201, request=httpx.Request("POST", url))

    monkeypatch.setattr(brevo.httpx, "post", fake_post)

    brevo.send_email("mariana@exemplo.com", "Assunto", "<p>corpo</p>", "corpo")

    assert capturado["json"]["htmlContent"] == "<p>corpo</p>"
    assert capturado["json"]["textContent"] == "corpo"
