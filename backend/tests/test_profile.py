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


def test_perfil_sem_look_publicado_existe_e_vem_vazio(dono: TestClient) -> None:
    assert sem_sessao(dono).get("/profiles/mariana").json()["looks"] == []
