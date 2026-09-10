import pytest
from fastapi.testclient import TestClient

from app.core.exceptions import EmailDeliveryFailed

PEDIDO = {
    "email": "titular@exemplo.com",
    "message": "Quero saber quais dados vocês guardam sobre mim.",
}


@pytest.fixture
def enviados(monkeypatch: pytest.MonkeyPatch) -> list[tuple[str, str, str]]:
    registro: list[tuple[str, str, str]] = []
    monkeypatch.setattr(
        "app.services.contact_service.send_email",
        lambda to, subject, html, text: registro.append((to, subject, html)),
    )
    return registro


def test_envia_para_o_destino_configurado(client: TestClient, enviados: list) -> None:
    resposta = client.post("/contact", json=PEDIDO)

    assert resposta.status_code == 202
    assert len(enviados) == 1
    # Nunca para quem preencheu: o destino é do controlador, e sai de variável de
    # ambiente para o endereço não ficar publicado em lugar nenhum.
    assert enviados[0][0] != PEDIDO["email"]


def test_a_mensagem_e_o_remetente_chegam_no_corpo(client: TestClient, enviados: list) -> None:
    client.post("/contact", json=PEDIDO)
    html = enviados[0][2]

    assert PEDIDO["email"] in html
    assert "quais dados vocês guardam" in html


# Mesma classe do e-mail de boas-vindas: texto de terceiro entrando cru num HTML
# que sai assinado pelo domínio da plataforma.
def test_a_mensagem_nao_injeta_html(client: TestClient, enviados: list) -> None:
    client.post(
        "/contact",
        json={"email": "a@exemplo.com", "message": '<a href="https://phishing.exemplo">clique</a>'},
    )

    assert "&lt;a href=" in enviados[0][2]
    assert '<a href="https://phishing.exemplo"' not in enviados[0][2]


# O destino nunca pode vir da entrada: assunto e destinatário montados com dado de
# terceiro é como se injeta cabeçalho e se transforma o formulário num relay.
def test_o_destino_vem_da_configuracao_e_nao_do_pedido(
    client: TestClient, enviados: list
) -> None:
    from app.config import get_settings

    client.post("/contact", json=PEDIDO)

    assert enviados[0][0] == get_settings().contact_destination


@pytest.mark.parametrize(
    "invalido",
    [
        {"email": "nao-e-email", "message": "texto suficiente"},
        {"email": "a@exemplo.com", "message": "curto"},
        {"email": "a@exemplo.com", "message": "x" * 5001},
        {"message": "sem email nenhum aqui"},
        {"email": "a@exemplo.com"},
    ],
)
def test_recusa_entrada_invalida(client: TestClient, invalido: dict) -> None:
    assert client.post("/contact", json=invalido).status_code == 422


# Formulário público sem freio é máquina de spam, e ainda queima a cota diária de
# e-mail da conta do Brevo, derrubando a recuperação de senha junto.
def test_tem_freio_de_requisicao(client: TestClient, enviados: list) -> None:
    ultimo = 0
    for _ in range(100):
        ultimo = client.post("/contact", json=PEDIDO).status_code
        if ultimo == 429:
            break

    assert ultimo == 429, "não bloqueou em 100 tentativas: o formulário está sem freio"


# Um padrão plausível como `privacidade@vesteai.site` faria o formulário aceitar o
# pedido e mandar para um endereço sem MX: o pedido some e o prazo legal corre.
def test_sem_destino_configurado_falha_alto(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, enviados: list
) -> None:
    from app.config import get_settings

    monkeypatch.setattr(get_settings(), "contact_destination", "")

    assert client.post("/contact", json=PEDIDO).status_code == 502
    assert enviados == []


# Quem preencheu não tem o que fazer com falha de infraestrutura de e-mail, mas
# também não pode receber "enviado" quando nada saiu.
def test_falha_no_envio_vira_erro_visivel(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    def explode(*_a: object, **_k: object) -> None:
        raise EmailDeliveryFailed()

    monkeypatch.setattr("app.services.contact_service.send_email", explode)

    assert client.post("/contact", json=PEDIDO).status_code == 502
