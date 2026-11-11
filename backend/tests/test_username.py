import pytest
from fastapi.testclient import TestClient

CREDENCIAIS = {"name": "Mariana", "email": "handle@exemplo.com", "password": "senha-bem-longa"}
OUTRA = {"name": "Joana", "email": "outra@exemplo.com", "password": "senha-bem-longa"}


def _logar(client: TestClient, credenciais: dict) -> str:
    client.post("/auth/register", json=credenciais)
    return client.post(
        "/auth/login",
        json={"email": credenciais["email"], "password": credenciais["password"]},
    ).json()["access_token"]


@pytest.fixture
def auth_client(client: TestClient) -> TestClient:
    client.headers["Authorization"] = f"Bearer {_logar(client, CREDENCIAIS)}"
    return client


def test_conta_nova_nao_tem_handle(auth_client: TestClient) -> None:
    assert auth_client.get("/users/me").json()["username"] is None


def test_escolher_handle(auth_client: TestClient) -> None:
    resposta = auth_client.patch("/users/me", json={"username": "mariana"})

    assert resposta.status_code == 200
    assert resposta.json()["username"] == "mariana"


# O handle vira endereço público. Aceitar maiúscula deixaria `Mariana` e `mariana`
# convivendo como pessoas diferentes, e ninguém sabe qual digitar.
def test_handle_e_guardado_em_minuscula(auth_client: TestClient) -> None:
    resposta = auth_client.patch("/users/me", json={"username": "MaRiAnA"})

    assert resposta.json()["username"] == "mariana"


# Sem unicidade dois perfis públicos apontariam para o mesmo endereço.
def test_handle_ja_usado_retorna_409(client: TestClient) -> None:
    token = _logar(client, CREDENCIAIS)
    cabecalho = {"Authorization": f"Bearer {token}"}
    client.patch("/users/me", json={"username": "mariana"}, headers=cabecalho)

    outro = _logar(client, OUTRA)
    resposta = client.patch(
        "/users/me", json={"username": "mariana"}, headers={"Authorization": f"Bearer {outro}"}
    )

    assert resposta.status_code == 409
    assert resposta.json()["code"] == "USERNAME_ALREADY_TAKEN"


def test_conflito_ignora_maiuscula(client: TestClient) -> None:
    token = _logar(client, CREDENCIAIS)
    cabecalho = {"Authorization": f"Bearer {token}"}
    client.patch("/users/me", json={"username": "mariana"}, headers=cabecalho)

    outro = _logar(client, OUTRA)
    resposta = client.patch(
        "/users/me", json={"username": "MARIANA"}, headers={"Authorization": f"Bearer {outro}"}
    )

    assert resposta.status_code == 409


@pytest.mark.parametrize(
    "invalido", ["ab", "a" * 31, "com espaco", "com-hifen", "acentuação", "ponto.final"]
)
def test_handle_recusa_formato_invalido(auth_client: TestClient, invalido: str) -> None:
    assert auth_client.patch("/users/me", json={"username": invalido}).status_code == 422


# O perfil público vai morar sob /perfil/<handle>. Sem reservar, alguém registra
# `configuracoes` e passa a ocupar um endereço que a aplicação precisa.
@pytest.mark.parametrize("reservado", ["admin", "api", "login", "configuracoes", "inicio"])
def test_handle_recusa_palavra_reservada(auth_client: TestClient, reservado: str) -> None:
    assert auth_client.patch("/users/me", json={"username": reservado}).status_code == 422


def test_trocar_para_o_proprio_handle_nao_conflita(auth_client: TestClient) -> None:
    auth_client.patch("/users/me", json={"username": "mariana"})

    assert auth_client.patch("/users/me", json={"username": "mariana"}).status_code == 200
