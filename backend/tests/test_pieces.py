import pytest
from fastapi.testclient import TestClient

from tests.test_looks import DONO, LOOK, OUTRA, PECA, token


@pytest.fixture
def dono(client: TestClient) -> TestClient:
    client.headers["Authorization"] = f"Bearer {token(client, DONO)}"
    return client


@pytest.fixture
def look(dono: TestClient) -> str:
    return dono.post("/looks", json=LOOK).json()["id"]


# RN05: peça exige nome e link de compra.
def test_rn05_peca_exige_nome_e_link(dono: TestClient, look: str) -> None:
    assert dono.post(f"/looks/{look}/pieces", json={"name": "Só o nome"}).status_code == 422
    assert dono.post(
        f"/looks/{look}/pieces", json={"purchase_url": "https://loja.exemplo.com/x"}
    ).status_code == 422


def test_rn05_peca_completa_entra(dono: TestClient, look: str) -> None:
    resposta = dono.post(f"/looks/{look}/pieces", json=PECA)

    assert resposta.status_code == 201
    assert resposta.json()["purchase_url"] == PECA["purchase_url"]


# RN06 diz que a validade comercial é do creator, mas endereço que não é http(s) não
# leva a loja nenhuma: é erro de formulário, não julgamento sobre a oferta.
@pytest.mark.parametrize(
    "url",
    [
        "javascript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "file:///etc/passwd",
        "loja.exemplo.com/sem-esquema",
        "ftp://loja.exemplo.com/x",
    ],
)
def test_link_de_compra_recusa_esquema_perigoso(dono: TestClient, look: str, url: str) -> None:
    assert dono.post(f"/looks/{look}/pieces", json={**PECA, "purchase_url": url}).status_code == 422


def test_rn07_nao_adiciona_peca_em_look_alheio(client: TestClient) -> None:
    do_dono = {"Authorization": f"Bearer {token(client, DONO)}"}
    look = client.post("/looks", json=LOOK, headers=do_dono).json()["id"]

    invasor = {"Authorization": f"Bearer {token(client, OUTRA)}"}

    assert client.post(f"/looks/{look}/pieces", json=PECA, headers=invasor).status_code == 403


def test_remover_peca(dono: TestClient, look: str) -> None:
    peca = dono.post(f"/looks/{look}/pieces", json=PECA).json()["id"]

    assert dono.delete(f"/looks/{look}/pieces/{peca}").status_code == 204
    assert dono.get(f"/looks/{look}").json()["pieces"] == []


# RN04: look só publica com ao menos uma peça com link de compra.
def test_rn04_nao_publica_look_sem_peca(dono: TestClient, look: str) -> None:
    dono.patch(f"/looks/{look}", json={"image_url": "https://cdn.exemplo.com/look.jpg"})
    resposta = dono.post(f"/looks/{look}/publish")

    assert resposta.status_code == 422
    assert resposta.json()["code"] == "LOOK_WITHOUT_PIECE"


# A imagem virou pré-condição de publicação em vez de coluna obrigatória: rascunho
# sem imagem pode existir, look publicado sem imagem não.
def test_nao_publica_look_sem_imagem(dono: TestClient, look: str) -> None:
    dono.post(f"/looks/{look}/pieces", json=PECA)
    resposta = dono.post(f"/looks/{look}/publish")

    assert resposta.status_code == 422
    assert resposta.json()["code"] == "LOOK_WITHOUT_IMAGE"


def test_publica_com_peca_e_imagem(dono: TestClient, look: str) -> None:
    dono.post(f"/looks/{look}/pieces", json=PECA)
    dono.patch(f"/looks/{look}", json={"image_url": "https://cdn.exemplo.com/look.jpg"})

    resposta = dono.post(f"/looks/{look}/publish")

    assert resposta.status_code == 200
    assert resposta.json()["status"] == "published"


# Remover a última peça de um look publicado o deixaria no ar violando a RN04.
def test_rn04_nao_remove_a_ultima_peca_de_look_publicado(dono: TestClient, look: str) -> None:
    peca = dono.post(f"/looks/{look}/pieces", json=PECA).json()["id"]
    dono.patch(f"/looks/{look}", json={"image_url": "https://cdn.exemplo.com/look.jpg"})
    dono.post(f"/looks/{look}/publish")

    resposta = dono.delete(f"/looks/{look}/pieces/{peca}")

    assert resposta.status_code == 422
    assert resposta.json()["code"] == "LOOK_WITHOUT_PIECE"


def test_rn07_so_o_dono_publica(client: TestClient) -> None:
    do_dono = {"Authorization": f"Bearer {token(client, DONO)}"}
    look = client.post("/looks", json=LOOK, headers=do_dono).json()["id"]
    client.post(f"/looks/{look}/pieces", json=PECA, headers=do_dono)

    invasor = {"Authorization": f"Bearer {token(client, OUTRA)}"}

    assert client.post(f"/looks/{look}/publish", headers=invasor).status_code == 403
