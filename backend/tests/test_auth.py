from datetime import timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session

CREDENTIALS = {"name": "Mariana", "email": "mariana@exemplo.com", "password": "senha-bem-longa"}


@pytest.fixture
def registered(client: TestClient) -> dict[str, str]:
    client.post("/auth/register", json=CREDENTIALS)
    return CREDENTIALS


def test_register_cria_usuario_e_retorna_201(client: TestClient) -> None:
    response = client.post("/auth/register", json=CREDENTIALS)

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == CREDENTIALS["email"]
    assert body["plan"] == "free"
    assert "password" not in body


def test_senha_nunca_persiste_em_texto_claro(client: TestClient, db: Session) -> None:
    client.post("/auth/register", json=CREDENTIALS)

    stored = db.execute(
        text("select password from users where email = :email"),
        {"email": CREDENTIALS["email"]},
    ).scalar_one()

    assert CREDENTIALS["password"] not in stored
    assert stored.startswith("$2b$")


def test_email_duplicado_retorna_409(client: TestClient, registered: dict[str, str]) -> None:
    response = client.post("/auth/register", json=registered)

    assert response.status_code == 409
    assert response.json()["code"] == "EMAIL_ALREADY_REGISTERED"


def test_register_com_email_invalido_retorna_422(client: TestClient) -> None:
    response = client.post("/auth/register", json={**CREDENTIALS, "email": "nao-e-email"})

    assert response.status_code == 422


def test_login_retorna_token(client: TestClient, registered: dict[str, str]) -> None:
    response = client.post(
        "/auth/login",
        json={"email": registered["email"], "password": registered["password"]},
    )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"  # noqa: S105
    assert response.json()["access_token"]


def test_login_com_senha_errada_retorna_401(client: TestClient, registered: dict[str, str]) -> None:
    response = client.post(
        "/auth/login",
        json={"email": registered["email"], "password": "senha-errada"},
    )

    assert response.status_code == 401
    assert response.json()["code"] == "INVALID_CREDENTIALS"


# A resposta não distingue e-mail inexistente de senha errada: contar qual dos dois
# falhou entregaria ao atacante quais e-mails existem.
def test_login_de_email_inexistente_responde_igual_a_senha_errada(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        json={"email": "ninguem@exemplo.com", "password": "qualquer-coisa"},
    )

    assert response.status_code == 401
    assert response.json()["code"] == "INVALID_CREDENTIALS"


def test_users_me_sem_token_retorna_401(client: TestClient) -> None:
    assert client.get("/users/me").status_code == 401


def test_users_me_com_token_retorna_o_usuario(
    client: TestClient, registered: dict[str, str]
) -> None:
    token = client.post(
        "/auth/login",
        json={"email": registered["email"], "password": registered["password"]},
    ).json()["access_token"]

    response = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["email"] == registered["email"]


def test_token_expirado_retorna_401(client: TestClient, registered: dict[str, str]) -> None:
    from app.core.security import create_access_token

    expired = create_access_token("00000000-0000-0000-0000-000000000000", timedelta(minutes=-1))

    response = client.get("/users/me", headers={"Authorization": f"Bearer {expired}"})

    assert response.status_code == 401


# Falha de infraestrutura não pode virar 401: quem vê "faça login" tenta de novo
# para sempre, enquanto o problema real é outro e some do monitoramento.
def test_falha_interna_nao_vira_401(client: TestClient, registered: dict[str, str]) -> None:
    from app.core.dependencies import get_auth_service
    from app.main import app

    token = client.post(
        "/auth/login",
        json={"email": registered["email"], "password": registered["password"]},
    ).json()["access_token"]

    class BancoIndisponivel:
        def get_authenticated(self, _user_id: object) -> None:
            raise RuntimeError("conexão com o banco caiu")

    app.dependency_overrides[get_auth_service] = BancoIndisponivel

    try:
        with pytest.raises(RuntimeError):
            client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    finally:
        app.dependency_overrides.pop(get_auth_service, None)
