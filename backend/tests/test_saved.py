import pytest
from fastapi.testclient import TestClient

from tests.test_looks import DONO, LOOK, OUTRA, PECA, token

IMAGEM = "https://cdn.exemplo.com/look.jpg"


@pytest.fixture
def dono(client: TestClient) -> TestClient:
    client.headers["Authorization"] = f"Bearer {token(client, DONO)}"
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


# RN02: só autenticado salva favorito.
def test_rn02_visitante_nao_salva(dono: TestClient) -> None:
    look = publicar(dono)

    assert sem_sessao(dono).post(f"/saved/{look}").status_code == 401


def test_rn02_visitante_nao_lista_salvos(client: TestClient) -> None:
    assert client.get("/saved").status_code == 401


def test_rn02_autenticado_salva_e_aparece_na_lista(dono: TestClient) -> None:
    look = publicar(dono)

    assert dono.post(f"/saved/{look}").status_code == 201

    salvos = dono.get("/saved").json()

    assert [item["title"] for item in salvos] == [LOOK["title"]]


def test_rn02_desfaz_o_favorito(dono: TestClient) -> None:
    look = publicar(dono)
    dono.post(f"/saved/{look}")

    assert dono.delete(f"/saved/{look}").status_code == 204
    assert dono.get("/saved").json() == []


# Salvar duas vezes é o mesmo estado: o coração é um interruptor, e um segundo toque
# não pode virar erro nem linha duplicada.
def test_salvar_duas_vezes_nao_duplica(dono: TestClient) -> None:
    look = publicar(dono)

    assert dono.post(f"/saved/{look}").status_code == 201
    assert dono.post(f"/saved/{look}").status_code == 201
    assert len(dono.get("/saved").json()) == 1


def test_desfazer_o_que_nao_estava_salvo_nao_e_erro(dono: TestClient) -> None:
    look = publicar(dono)

    assert dono.delete(f"/saved/{look}").status_code == 204


# Rascunho não está no feed e não é de ninguém além do dono: salvar o que não está
# publicado guardaria um endereço que a pessoa não consegue abrir.
def test_nao_salva_look_que_nao_esta_publicado(dono: TestClient) -> None:
    rascunho = dono.post("/looks", json=LOOK).json()["id"]

    assert dono.post(f"/saved/{rascunho}").status_code == 404


def test_o_favorito_e_de_quem_salvou(client: TestClient) -> None:
    do_dono = {"Authorization": f"Bearer {token(client, DONO)}"}
    client.headers.update(do_dono)
    look = publicar(client)
    client.post(f"/saved/{look}")

    client.headers["Authorization"] = f"Bearer {token(client, OUTRA)}"

    assert client.get("/saved").json() == []


# A tela precisa saber quais corações já estão preenchidos sem que o feed deixe de ser
# público: a lista de ids vem por fora, e só para quem tem sessão — ver ADR-0023.
def test_a_lista_de_ids_salvos_responde_sem_carregar_o_look(dono: TestClient) -> None:
    look = publicar(dono)
    dono.post(f"/saved/{look}")

    assert dono.get("/saved/ids").json() == [look]
