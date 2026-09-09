import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session

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


# O schema aceitava name nulo e a coluna é NOT NULL: o flush estourava 500 em vez
# de recusar a entrada.
def test_patch_users_me_recusa_name_nulo(auth_client: TestClient) -> None:
    resposta = auth_client.patch("/users/me", json={"name": None})

    assert resposta.status_code == 422


# bio e avatar podem ser limpos de propósito — só o name é obrigatório.
def test_patch_users_me_permite_limpar_bio(auth_client: TestClient) -> None:
    auth_client.patch("/users/me", json={"bio": "algo"})
    resposta = auth_client.patch("/users/me", json={"bio": None})

    assert resposta.status_code == 200
    assert resposta.json()["bio"] is None


# LGPD art. 18, VI: a eliminação é direito do titular. Atender por e-mail seria
# legal, mas obriga alguém a executar à mão o que o sistema faz sozinho.
def test_delete_users_me_apaga_a_conta(auth_client: TestClient) -> None:
    resposta = auth_client.delete("/users/me")

    assert resposta.status_code == 204
    assert auth_client.get("/users/me").status_code == 401


def test_delete_users_me_sem_token_retorna_401(client: TestClient) -> None:
    assert client.delete("/users/me").status_code == 401


# Apagar só a linha de `users` deixaria o token de recuperação apontando para um
# titular que pediu para sumir. O CASCADE existe no schema; o teste prova que vale.
def test_delete_users_me_leva_junto_os_tokens_de_recuperacao(
    auth_client: TestClient, db: Session, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(
        "app.services.password_reset_service.send_reset_email",
        lambda email, token: None,
    )
    auth_client.post("/auth/forgot-password", json={"email": CREDENTIALS["email"]})

    antes = db.execute(text("SELECT count(*) FROM password_resets")).scalar_one()
    auth_client.delete("/users/me")
    depois = db.execute(text("SELECT count(*) FROM password_resets")).scalar_one()

    assert antes == 1
    assert depois == 0


# LGPD art. 18, II e V: acesso e portabilidade. Formato legível por máquina para
# o titular poder levar o dado, não só olhar.
def test_export_devolve_os_dados_do_titular(auth_client: TestClient) -> None:
    resposta = auth_client.get("/users/me/export")

    assert resposta.status_code == 200
    assert resposta.json()["email"] == CREDENTIALS["email"]
    assert resposta.json()["name"] == CREDENTIALS["name"]
    assert "created_at" in resposta.json()


# A senha é credencial, não dado a devolver: exportá-la transformaria o direito de
# acesso num vazamento com carimbo de conformidade.
def test_export_nao_inclui_a_senha(auth_client: TestClient) -> None:
    corpo = auth_client.get("/users/me/export").text

    assert "password" not in corpo
    assert CREDENTIALS["password"] not in corpo


def test_export_sem_token_retorna_401(client: TestClient) -> None:
    assert client.get("/users/me/export").status_code == 401
