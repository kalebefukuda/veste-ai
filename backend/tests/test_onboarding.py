from datetime import datetime

import pytest
from fastapi.testclient import TestClient

CREDENCIAIS = {"name": "Mariana", "email": "onb@exemplo.com", "password": "senha-bem-longa"}


@pytest.fixture
def auth_client(client: TestClient) -> TestClient:
    client.post("/auth/register", json=CREDENCIAIS)
    token = client.post(
        "/auth/login",
        json={"email": CREDENCIAIS["email"], "password": CREDENCIAIS["password"]},
    ).json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    return client


# Conta nova não passou pelo funil: é isso que o frontend lê para decidir se manda
# a pessoa configurar ou direto para as boas-vindas.
def test_conta_nova_nao_passou_pelo_onboarding(auth_client: TestClient) -> None:
    corpo = auth_client.get("/users/me").json()

    assert corpo["onboarded_at"] is None
    assert corpo["intent"] is None


def test_marcar_onboarding_grava_a_data(auth_client: TestClient) -> None:
    resposta = auth_client.post("/users/me/onboarding")

    assert resposta.status_code == 200
    assert resposta.json()["onboarded_at"] is not None


# Pular também marca: senão a pessoa que pulou levaria o funil de novo em cada
# login, e "pular por agora" viraria "pular até recarregar".
def test_marcar_e_idempotente(auth_client: TestClient) -> None:
    primeira = auth_client.post("/users/me/onboarding").json()["onboarded_at"]
    segunda = auth_client.post("/users/me/onboarding").json()["onboarded_at"]

    # Instante, não texto: a primeira resposta vem do valor em memória e a segunda
    # do Postgres, que devolve no fuso da sessão. Mesmo momento, grafia diferente.
    assert datetime.fromisoformat(primeira) == datetime.fromisoformat(segunda)


# A segunda metade da liberdade: poder rever depois. Limpar a data é o que faz o
# funil aparecer de novo por escolha da pessoa.
def test_limpar_faz_o_funil_voltar(auth_client: TestClient) -> None:
    auth_client.post("/users/me/onboarding")
    resposta = auth_client.delete("/users/me/onboarding")

    assert resposta.status_code == 200
    assert resposta.json()["onboarded_at"] is None


def test_onboarding_sem_token_retorna_401(client: TestClient) -> None:
    assert client.post("/users/me/onboarding").status_code == 401
    assert client.delete("/users/me/onboarding").status_code == 401


def test_intent_aceita_os_dois_publicos(auth_client: TestClient) -> None:
    for valor in ("creator", "shopper"):
        resposta = auth_client.patch("/users/me", json={"intent": valor})

        assert resposta.status_code == 200
        assert resposta.json()["intent"] == valor


# Valor livre viraria lixo no banco e quebraria a ramificação do tour, que decide
# o que mostrar com base nesta coluna.
def test_intent_recusa_valor_fora_da_lista(auth_client: TestClient) -> None:
    assert auth_client.patch("/users/me", json={"intent": "outra-coisa"}).status_code == 422
