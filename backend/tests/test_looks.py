import pytest
from fastapi.testclient import TestClient

DONO = {"name": "Mariana", "email": "dona@exemplo.com", "password": "senha-bem-longa"}
OUTRA = {"name": "Joana", "email": "outra@exemplo.com", "password": "senha-bem-longa"}
LOOK = {"title": "Inverno urbano", "description": "Camadas para o frio da cidade"}
PECA = {
    "name": "Sobretudo bordô",
    "purchase_url": "https://loja.exemplo.com/sobretudo",
    "store": "Loja Exemplo",
}


def token(client: TestClient, credenciais: dict) -> str:
    client.post("/auth/register", json=credenciais)
    return client.post(
        "/auth/login",
        json={"email": credenciais["email"], "password": credenciais["password"]},
    ).json()["access_token"]


@pytest.fixture
def dono(client: TestClient) -> TestClient:
    client.headers["Authorization"] = f"Bearer {token(client, DONO)}"
    return client


def criar_look(c: TestClient) -> str:
    return c.post("/looks", json=LOOK).json()["id"]


# RN01: só autenticado cria, edita ou remove look.
def test_rn01_visitante_nao_cria_look(client: TestClient) -> None:
    assert client.post("/looks", json=LOOK).status_code == 401


def test_rn01_autenticado_cria_look(dono: TestClient) -> None:
    resposta = dono.post("/looks", json=LOOK)

    assert resposta.status_code == 201
    assert resposta.json()["title"] == LOOK["title"]
    # Nasce rascunho: publicar é ato deliberado, não efeito de criar.
    assert resposta.json()["status"] == "draft"


def test_o_look_nasce_sem_imagem(dono: TestClient) -> None:
    assert dono.post("/looks", json=LOOK).json()["image_url"] is None


# RN07: creator só edita e remove os próprios looks.
def test_rn07_nao_edita_look_de_outra_pessoa(client: TestClient) -> None:
    do_dono = token(client, DONO)
    look = client.post(
        "/looks", json=LOOK, headers={"Authorization": f"Bearer {do_dono}"}
    ).json()["id"]

    invasor = {"Authorization": f"Bearer {token(client, OUTRA)}"}

    edicao = client.patch(f"/looks/{look}", json={"title": "Roubado"}, headers=invasor)

    assert edicao.status_code == 403
    assert client.delete(f"/looks/{look}", headers=invasor).status_code == 403


def test_rn07_o_dono_edita_e_remove(dono: TestClient) -> None:
    look = criar_look(dono)

    assert dono.patch(f"/looks/{look}", json={"title": "Outro titulo"}).status_code == 200
    assert dono.delete(f"/looks/{look}").status_code == 204
    assert dono.get(f"/looks/{look}").status_code == 404


def test_lista_apenas_os_meus_looks(client: TestClient) -> None:
    do_dono = {"Authorization": f"Bearer {token(client, DONO)}"}
    client.post("/looks", json=LOOK, headers=do_dono)

    da_outra = {"Authorization": f"Bearer {token(client, OUTRA)}"}
    client.post("/looks", json={**LOOK, "title": "Da outra"}, headers=da_outra)

    meus = client.get("/looks", headers=do_dono).json()

    assert len(meus) == 1
    assert meus[0]["title"] == LOOK["title"]


def test_look_inexistente_retorna_404(dono: TestClient) -> None:
    assert dono.get("/looks/7c45a3d4-7449-4bdc-8916-06173cdd2655").status_code == 404
