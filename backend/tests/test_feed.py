import uuid
from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.models.look import Look
from tests.test_looks import DONO, LOOK, OUTRA, PECA, token

IMAGEM = "https://cdn.exemplo.com/look.jpg"


@pytest.fixture
def dono(client: TestClient) -> TestClient:
    client.headers["Authorization"] = f"Bearer {token(client, DONO)}"
    return client


def publicar(c: TestClient, titulo: str = LOOK["title"], categoria: str = "casual") -> str:
    look = c.post("/looks", json={**LOOK, "title": titulo}).json()["id"]
    c.post(f"/looks/{look}/pieces", json=PECA)
    c.patch(f"/looks/{look}", json={"image_url": IMAGEM, "category": categoria})
    c.post(f"/looks/{look}/publish")
    return look


def datar(db: Session, look: str, quando: datetime) -> None:
    db.execute(update(Look).where(Look.id == uuid.UUID(look)).values(created_at=quando))


def sem_sessao(c: TestClient) -> TestClient:
    c.headers.pop("Authorization", None)
    return c


# RN03: o feed é público. Exigir conta para ver look seria fechar a porta da frente
# do produto — quem descobre pelo feed é quem compra pelo link.
def test_rn03_visitante_le_o_feed(dono: TestClient) -> None:
    publicar(dono)

    resposta = sem_sessao(dono).get("/feed")

    assert resposta.status_code == 200
    assert len(resposta.json()["items"]) == 1


def test_rn03_visitante_ve_o_link_de_compra(dono: TestClient) -> None:
    publicar(dono)

    peca = sem_sessao(dono).get("/feed").json()["items"][0]["pieces"][0]

    assert peca["purchase_url"] == PECA["purchase_url"]


def test_rn03_visitante_abre_o_look_publicado(dono: TestClient) -> None:
    look = publicar(dono)

    resposta = sem_sessao(dono).get(f"/feed/{look}")

    assert resposta.status_code == 200
    assert resposta.json()["title"] == LOOK["title"]


# Rascunho é trabalho em andamento: aparecer no feed publicaria por acidente o que a
# pessoa ainda não decidiu mostrar.
def test_o_feed_ignora_rascunho(dono: TestClient) -> None:
    dono.post("/looks", json=LOOK)

    assert sem_sessao(dono).get("/feed").json()["items"] == []


def test_o_detalhe_publico_ignora_rascunho(dono: TestClient) -> None:
    rascunho = dono.post("/looks", json=LOOK).json()["id"]

    assert sem_sessao(dono).get(f"/feed/{rascunho}").status_code == 404


def test_o_feed_diz_quem_montou_o_look(dono: TestClient) -> None:
    publicar(dono)

    criador = sem_sessao(dono).get("/feed").json()["items"][0]["creator"]

    assert criador["name"] == DONO["name"]
    # Nada de e-mail: o feed é público e o endereço não é dado de vitrine.
    assert "email" not in criador


def test_o_feed_reune_looks_de_pessoas_diferentes(client: TestClient) -> None:
    client.headers["Authorization"] = f"Bearer {token(client, DONO)}"
    publicar(client, "Da dona")

    client.headers["Authorization"] = f"Bearer {token(client, OUTRA)}"
    publicar(client, "Da outra")

    titulos = {item["title"] for item in sem_sessao(client).get("/feed").json()["items"]}

    assert titulos == {"Da dona", "Da outra"}


def test_o_feed_mostra_o_mais_novo_primeiro(dono: TestClient, db: Session) -> None:
    antigo = publicar(dono, "Primeiro")
    novo = publicar(dono, "Segundo")

    # `now()` do Postgres é o instante da transação, e o teste inteiro roda dentro de
    # uma: sem marcar as datas à mão, os dois looks nascem no mesmo microssegundo e a
    # ordem vira sorteio.
    datar(db, antigo, datetime(2026, 1, 1, tzinfo=UTC))
    datar(db, novo, datetime(2026, 6, 1, tzinfo=UTC))

    itens = sem_sessao(dono).get("/feed").json()["items"]

    assert [item["title"] for item in itens] == ["Segundo", "Primeiro"]


# `next_page` em vez de total: contar a tabela inteira a cada página custa caro e não
# muda nada na tela, que só precisa saber se ainda há o que carregar.
def test_o_feed_pagina_e_aponta_a_proxima(dono: TestClient) -> None:
    publicar(dono, "Primeiro")
    publicar(dono, "Segundo")

    primeira = sem_sessao(dono).get("/feed", params={"per_page": 1}).json()

    assert len(primeira["items"]) == 1
    assert primeira["next_page"] == 2


def test_a_ultima_pagina_nao_aponta_proxima(dono: TestClient) -> None:
    publicar(dono)

    pagina = sem_sessao(dono).get("/feed", params={"per_page": 1}).json()

    assert pagina["next_page"] is None


# Busca por título e por quem montou, que é o que a pessoa lembra na hora de procurar
# — ninguém guarda o id de um look.
def test_a_busca_acha_pelo_titulo(dono: TestClient) -> None:
    publicar(dono, "Alfaiataria clara")
    publicar(dono, "Inverno urbano")

    itens = sem_sessao(dono).get("/feed", params={"q": "alfaiataria"}).json()["items"]

    assert [item["title"] for item in itens] == ["Alfaiataria clara"]


def test_a_busca_acha_pelo_nome_de_quem_montou(client: TestClient) -> None:
    client.headers["Authorization"] = f"Bearer {token(client, DONO)}"
    publicar(client, "Da dona")

    client.headers["Authorization"] = f"Bearer {token(client, OUTRA)}"
    publicar(client, "Da outra")

    itens = sem_sessao(client).get("/feed", params={"q": OUTRA["name"]}).json()["items"]

    assert [item["title"] for item in itens] == ["Da outra"]


def test_a_busca_ignora_caixa_e_acento_parcial(dono: TestClient) -> None:
    publicar(dono, "Inverno Urbano")

    itens = sem_sessao(dono).get("/feed", params={"q": "URBANO"}).json()["items"]

    assert len(itens) == 1


def test_a_busca_sem_resultado_devolve_lista_vazia(dono: TestClient) -> None:
    publicar(dono)

    pagina = sem_sessao(dono).get("/feed", params={"q": "nao existe isso"}).json()

    assert pagina["items"] == []
    assert pagina["next_page"] is None


# O filtro por ocasião é o que a RFC desenha como pills na navegação do feed.
def test_o_feed_filtra_por_categoria(dono: TestClient) -> None:
    publicar(dono, "Para o escritório", "work")
    publicar(dono, "Para a areia", "beach")

    itens = sem_sessao(dono).get("/feed", params={"categoria": "beach"}).json()["items"]

    assert [item["title"] for item in itens] == ["Para a areia"]


def test_o_feed_sem_filtro_traz_todas_as_categorias(dono: TestClient) -> None:
    publicar(dono, "Para o escritório", "work")
    publicar(dono, "Para a areia", "beach")

    assert len(sem_sessao(dono).get("/feed").json()["items"]) == 2


def test_o_feed_recusa_categoria_fora_da_lista(dono: TestClient) -> None:
    resposta = sem_sessao(dono).get("/feed", params={"categoria": "inventada"})

    assert resposta.status_code == 422


def test_o_feed_entrega_a_categoria_do_look(dono: TestClient) -> None:
    publicar(dono, "Para a areia", "beach")

    assert sem_sessao(dono).get("/feed").json()["items"][0]["category"] == "beach"


def test_a_busca_e_o_filtro_se_combinam(dono: TestClient) -> None:
    publicar(dono, "Linho para o escritório", "work")
    publicar(dono, "Linho para a areia", "beach")

    itens = (
        sem_sessao(dono)
        .get("/feed", params={"q": "linho", "categoria": "work"})
        .json()["items"]
    )

    assert [item["title"] for item in itens] == ["Linho para o escritório"]


def test_o_feed_recusa_pagina_grande_demais(dono: TestClient) -> None:
    assert sem_sessao(dono).get("/feed", params={"per_page": 500}).status_code == 422
