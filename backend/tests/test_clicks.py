import pytest
from fastapi.testclient import TestClient

from tests.test_looks import DONO, LOOK, OUTRA, PECA, token

IMAGEM = "https://cdn.exemplo.com/look.jpg"


@pytest.fixture
def dono(client: TestClient) -> TestClient:
    client.headers["Authorization"] = f"Bearer {token(client, DONO)}"
    return client


@pytest.fixture
def publicado(dono: TestClient) -> tuple[str, str]:
    look = dono.post("/looks", json=LOOK).json()["id"]
    peca = dono.post(f"/looks/{look}/pieces", json=PECA).json()["id"]
    dono.patch(f"/looks/{look}", json={"image_url": IMAGEM, "category": "work"})
    dono.post(f"/looks/{look}/publish")
    return look, peca


def sem_sessao(c: TestClient) -> TestClient:
    c.headers.pop("Authorization", None)
    return c


# RN08: o clique só conta quando há redirecionamento efetivo. A rota devolve o destino
# justamente para que contar e redirecionar sejam o mesmo ato — contador que dispara
# sem levar a lugar nenhum mede intenção, não clique.
def test_rn08_o_clique_devolve_o_destino_da_peca(dono: TestClient, publicado) -> None:
    _, peca = publicado

    resposta = sem_sessao(dono).post(f"/clicks/{peca}")

    assert resposta.status_code == 201
    assert resposta.json()["purchase_url"] == PECA["purchase_url"]


def test_rn08_peca_inexistente_nao_conta_clique(dono: TestClient) -> None:
    resposta = sem_sessao(dono).post("/clicks/7c45a3d4-7449-4bdc-8916-06173cdd2655")

    assert resposta.status_code == 404


# RN03: comprar não exige conta, então contar o clique também não pode exigir.
def test_rn03_o_visitante_clica_sem_conta(dono: TestClient, publicado) -> None:
    _, peca = publicado

    assert sem_sessao(dono).post(f"/clicks/{peca}").status_code == 201


# RN09: métricas são do creator. Para outra pessoa é 403, não 404: o look existe, e
# esconder isso seria mentir sobre o estado do sistema para quem já está autenticado.
def test_rn09_so_o_dono_ve_as_metricas(client: TestClient) -> None:
    do_dono = {"Authorization": f"Bearer {token(client, DONO)}"}
    look = client.post("/looks", json=LOOK, headers=do_dono).json()["id"]

    invasor = {"Authorization": f"Bearer {token(client, OUTRA)}"}

    assert client.get(f"/looks/{look}/metrics", headers=invasor).status_code == 403


def test_rn09_visitante_nao_ve_metricas(client: TestClient) -> None:
    do_dono = {"Authorization": f"Bearer {token(client, DONO)}"}
    look = client.post("/looks", json=LOOK, headers=do_dono).json()["id"]

    assert sem_sessao(client).get(f"/looks/{look}/metrics").status_code == 401


def test_rn09_o_dono_ve_o_total_e_a_peca(dono: TestClient, publicado) -> None:
    look, peca = publicado
    sem_sessao(dono).post(f"/clicks/{peca}")
    sem_sessao(dono).post(f"/clicks/{peca}")

    dono.headers["Authorization"] = f"Bearer {token(dono, DONO)}"
    metricas = dono.get(f"/looks/{look}/metrics").json()

    assert metricas["clicks"] == 2
    assert metricas["pieces"][0]["name"] == PECA["name"]
    assert metricas["pieces"][0]["clicks"] == 2


def test_metricas_de_look_sem_clique_comecam_em_zero(dono: TestClient, publicado) -> None:
    look, _ = publicado

    metricas = dono.get(f"/looks/{look}/metrics").json()

    assert metricas["clicks"] == 0
    assert metricas["pieces"][0]["clicks"] == 0


# O clique guarda o look junto da peça para a métrica não depender de join com uma
# peça que pode ter saído do look depois.
def test_o_clique_guarda_o_look_junto_da_peca(dono: TestClient, publicado, db) -> None:
    look, peca = publicado
    sem_sessao(dono).post(f"/clicks/{peca}")

    from app.models.click import Click

    registrado = db.query(Click).one()

    assert str(registrado.look_id) == look
    assert str(registrado.piece_id) == peca
    # Nada de IP: a RN09 precisa de contagem, não de quem clicou — ver ADR-0022.
    assert registrado.ip_hash is None


# O comentário do model prometia que a métrica sobrevive à peça sair do look, e o
# schema não entregava: `piece_id` cascateava, então remover a peça apagava o histórico
# dela. O total do look é número histórico do creator, não inventário do que restou.
def test_o_clique_sobrevive_a_remocao_da_peca(dono: TestClient, publicado) -> None:
    look, peca = publicado
    sem_sessao(dono).post(f"/clicks/{peca}")
    dono.headers["Authorization"] = f"Bearer {token(dono, DONO)}"

    dono.post(f"/looks/{look}/pieces", json={**PECA, "name": "Segunda peça"})
    assert dono.delete(f"/looks/{look}/pieces/{peca}").status_code == 204

    metricas = dono.get(f"/looks/{look}/metrics").json()

    assert metricas["clicks"] == 1
    # A peça saiu, então some da quebra — mas o total do look continua contando.
    assert [p["name"] for p in metricas["pieces"]] == ["Segunda peça"]
