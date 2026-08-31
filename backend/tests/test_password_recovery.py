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
