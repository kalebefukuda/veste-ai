from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session

CREDENTIALS = {"name": "Mariana", "email": "mariana@exemplo.com", "password": "senha-antiga-1"}
NOVA_SENHA = "senha-nova-bem-longa"


@pytest.fixture
def registered(client: TestClient) -> dict[str, str]:
    client.post("/auth/register", json=CREDENTIALS)
    return CREDENTIALS


@pytest.fixture
def token(client: TestClient, registered: dict[str, str], monkeypatch: pytest.MonkeyPatch) -> str:
    enviados: list[tuple[str, str]] = []
    monkeypatch.setattr(
        "app.services.password_reset_service.send_reset_email",
        lambda email, token: enviados.append((email, token)),
    )

    client.post("/auth/forgot-password", json={"email": registered["email"]})

    return enviados[0][1]


# Responder diferente para e-mail inexistente transforma o endpoint num verificador
# de quais contas existem.
def test_forgot_password_responde_igual_para_email_inexistente(client: TestClient) -> None:
    existente = client.post("/auth/forgot-password", json={"email": CREDENTIALS["email"]})
    inexistente = client.post("/auth/forgot-password", json={"email": "ninguem@exemplo.com"})

    assert existente.status_code == inexistente.status_code == 202
    assert existente.json() == inexistente.json()


def test_token_de_reset_nunca_persiste_em_texto_claro(
    client: TestClient, db: Session, token: str
) -> None:
    guardado = db.execute(text("select token_hash from password_resets")).scalar_one()

    assert token not in guardado
    assert len(guardado) == 64


def test_reset_troca_a_senha_e_permite_login(client: TestClient, token: str) -> None:
    resposta = client.post("/auth/reset-password", json={"token": token, "password": NOVA_SENHA})
    assert resposta.status_code == 204

    antiga = client.post(
        "/auth/login", json={"email": CREDENTIALS["email"], "password": CREDENTIALS["password"]}
    )
    nova = client.post(
        "/auth/login", json={"email": CREDENTIALS["email"], "password": NOVA_SENHA}
    )

    assert antiga.status_code == 401
    assert nova.status_code == 200


def test_reset_token_de_uso_unico_nao_reutiliza(client: TestClient, token: str) -> None:
    primeira = client.post("/auth/reset-password", json={"token": token, "password": NOVA_SENHA})
    segunda = client.post(
        "/auth/reset-password", json={"token": token, "password": "outra-senha-1"}
    )

    assert primeira.status_code == 204
    assert segunda.status_code == 400
    assert segunda.json()["code"] == "INVALID_RESET_TOKEN"


def test_reset_com_token_expirado_retorna_400(
    client: TestClient, db: Session, token: str
) -> None:
    db.execute(
        text("update password_resets set expires_at = :passado"),
        {"passado": datetime.now(UTC) - timedelta(minutes=1)},
    )

    resposta = client.post("/auth/reset-password", json={"token": token, "password": NOVA_SENHA})

    assert resposta.status_code == 400
    assert resposta.json()["code"] == "INVALID_RESET_TOKEN"


def test_reset_com_token_inexistente_retorna_400(client: TestClient) -> None:
    resposta = client.post(
        "/auth/reset-password", json={"token": "nao-existe", "password": NOVA_SENHA}
    )

    assert resposta.status_code == 400


# Pedir um reset novo invalida o anterior: dois links válidos ao mesmo tempo dobram
# a janela de quem interceptar um e-mail.
def test_pedido_novo_invalida_o_token_anterior(
    client: TestClient, registered: dict[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    enviados: list[tuple[str, str]] = []
    monkeypatch.setattr(
        "app.services.password_reset_service.send_reset_email",
        lambda email, token: enviados.append((email, token)),
    )

    client.post("/auth/forgot-password", json={"email": registered["email"]})
    client.post("/auth/forgot-password", json={"email": registered["email"]})

    primeiro, segundo = enviados[0][1], enviados[1][1]

    assert client.post(
        "/auth/reset-password", json={"token": primeiro, "password": NOVA_SENHA}
    ).status_code == 400
    assert client.post(
        "/auth/reset-password", json={"token": segundo, "password": NOVA_SENHA}
    ).status_code == 204


# Token que ninguém recebeu não serve a ninguém: deixá-lo válido é só resíduo.
def test_token_e_invalidado_quando_o_email_nao_sai(
    client: TestClient, registered: dict[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    from app.core.exceptions import EmailDeliveryFailed

    capturados: list[str] = []

    def falha_ao_enviar(email: str, token: str) -> None:
        capturados.append(token)
        raise EmailDeliveryFailed()

    monkeypatch.setattr(
        "app.services.password_reset_service.send_reset_email", falha_ao_enviar
    )

    pedido = client.post("/auth/forgot-password", json={"email": registered["email"]})

    # A resposta não muda: revelar a falha diria ao atacante que o e-mail existe.
    assert pedido.status_code == 202

    resposta = client.post(
        "/auth/reset-password", json={"token": capturados[0], "password": NOVA_SENHA}
    )
    assert resposta.status_code == 400


# Consumir o token em duas etapas — ler, depois marcar — deixa duas requisições
# simultâneas passarem pela mesma janela.
def test_token_e_consumido_de_forma_atomica(client: TestClient, db: Session, token: str) -> None:
    from app.repositories.password_reset_repository import PasswordResetRepository
    from app.services.password_reset_service import fingerprint

    repositorio = PasswordResetRepository(db)

    primeira = repositorio.consume(fingerprint(token))
    segunda = repositorio.consume(fingerprint(token))

    assert primeira is not None
    assert segunda is None, "o mesmo token foi consumido duas vezes"
