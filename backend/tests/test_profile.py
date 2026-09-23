import pytest
from fastapi.testclient import TestClient

from tests.test_looks import DONO, LOOK, PECA, token

IMAGEM = "https://cdn.exemplo.com/look.jpg"


@pytest.fixture
def dono(client: TestClient) -> TestClient:
    client.headers["Authorization"] = f"Bearer {token(client, DONO)}"
    client.patch("/users/me", json={"username": "mariana", "bio": "Curadoria urbana"})
    return client


def publicar(c: TestClient, titulo: str = LOOK["title"]) -> str:
    look = c.post("/looks", json={**LOOK, "title": titulo}).json()["id"]
    c.post(f"/looks/{look}/pieces", json=PECA)
    c.patch(f"/looks/{look}", json={"image_url": IMAGEM, "category": "work"})
    c.post(f"/looks/{look}/publish")
    return look


def sem_sessao(c: TestClient) -> TestClient:
    c.headers.pop("Authorization", None)
    return c


# RN03: o feed é público, e o perfil é um recorte dele por pessoa. Exigir conta para
# ver quem montou fecharia a porta que o feed abre.
def test_rn03_visitante_abre_o_perfil(dono: TestClient) -> None:
    publicar(dono)

    resposta = sem_sessao(dono).get("/profiles/mariana")

    assert resposta.status_code == 200
    assert resposta.json()["name"] == DONO["name"]
    assert resposta.json()["bio"] == "Curadoria urbana"


def test_o_perfil_traz_os_looks_publicados(dono: TestClient) -> None:
    publicar(dono, "Publicado")
    dono.post("/looks", json={**LOOK, "title": "Rascunho"})

    looks = sem_sessao(dono).get("/profiles/mariana").json()["looks"]

    assert [item["title"] for item in looks] == ["Publicado"]


def test_o_perfil_nao_entrega_o_email(dono: TestClient) -> None:
    publicar(dono)

    perfil = sem_sessao(dono).get("/profiles/mariana").json()

    # O handle é endereço público; o e-mail não é.
    assert "email" not in perfil


def test_handle_inexistente_da_404(client: TestClient) -> None:
    assert client.get("/profiles/ninguem").status_code == 404


# O handle é guardado em minúscula justamente para `Mariana` e `mariana` não virarem
# dois perfis. Quem digita na URL não sabe disso.
def test_handle_em_maiuscula_acha_o_mesmo_perfil(dono: TestClient) -> None:
    publicar(dono)

    assert sem_sessao(dono).get("/profiles/MARIANA").status_code == 200


# O perfil é o feed recortado por pessoa, e o feed pagina. Sem isto, a resposta cresce
# com a coleção de quem publica muito — e quem publica muito é justamente o creator que
# a plataforma quer.
def test_o_perfil_pagina_como_o_feed(dono: TestClient) -> None:
    publicar(dono, "Primeiro")
    publicar(dono, "Segundo")

    pagina = sem_sessao(dono).get("/profiles/mariana", params={"per_page": 1}).json()

    assert len(pagina["looks"]) == 1
    assert pagina["next_page"] == 2


def test_a_ultima_pagina_do_perfil_nao_aponta_proxima(dono: TestClient) -> None:
    publicar(dono)

    assert sem_sessao(dono).get("/profiles/mariana").json()["next_page"] is None


# Reusar LookNotFound fazia a API dizer LOOK_NOT_FOUND quando quem não existe é a
# pessoa. O código de erro é contrato: ele tem de dizer o que de fato faltou.
def test_perfil_inexistente_tem_codigo_proprio(client: TestClient) -> None:
    resposta = client.get("/profiles/ninguem")

    assert resposta.status_code == 404
    assert resposta.json()["code"] == "PROFILE_NOT_FOUND"


def test_perfil_sem_look_publicado_existe_e_vem_vazio(dono: TestClient) -> None:
    assert sem_sessao(dono).get("/profiles/mariana").json()["looks"] == []
