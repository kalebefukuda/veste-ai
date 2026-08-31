import pytest
from fastapi.testclient import TestClient

CREDENTIALS = {"name": "Mariana", "email": "mariana@exemplo.com", "password": "senha-bem-longa"}


@pytest.fixture
def auth_client(client: TestClient) -> TestClient:
    client.post("/auth/register", json=CREDENTIALS)
    token = client.post(
        "/auth/login",
        json={"email": CREDENTIALS["email"], "password": CREDENTIALS["password"]},
    ).json()["access_token"]

    client.headers["Authorization"] = f"Bearer {token}"
    return client


def test_patch_users_me_atualiza_o_perfil(auth_client: TestClient) -> None:
    resposta = auth_client.patch("/users/me", json={"name": "Mari", "bio": "Curadoria urbana"})

    assert resposta.status_code == 200
    assert resposta.json()["name"] == "Mari"
    assert resposta.json()["bio"] == "Curadoria urbana"


def test_patch_users_me_ignora_campo_ausente(auth_client: TestClient) -> None:
    auth_client.patch("/users/me", json={"bio": "Primeira bio"})
    resposta = auth_client.patch("/users/me", json={"name": "Mari"})

    assert resposta.json()["bio"] == "Primeira bio"


# Sem esta guarda, um PATCH trocaria plano ou senha por caminho que não os valida.
def test_patch_users_me_nao_deixa_trocar_plano_nem_senha(auth_client: TestClient) -> None:
    resposta = auth_client.patch(
        "/users/me", json={"name": "Mari", "plan": "pro", "password": "invadida"}
    )

    assert resposta.status_code == 422


def test_patch_users_me_sem_token_retorna_401(client: TestClient) -> None:
    assert client.patch("/users/me", json={"name": "Mari"}).status_code == 401
