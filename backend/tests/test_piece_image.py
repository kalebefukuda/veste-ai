import pytest
from fastapi.testclient import TestClient

from app.clients import armazenamento
from tests.test_looks import DONO, LOOK, OUTRA, PECA, token

# Bytes mínimos que passam pela conferência de assinatura de arquivo.
JPEG = b"\xff\xd8\xff\xe0" + b"0" * 64
PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 64


@pytest.fixture
def dono(client: TestClient) -> TestClient:
    client.headers["Authorization"] = f"Bearer {token(client, DONO)}"
    return client


@pytest.fixture
def look_e_peca(dono: TestClient) -> tuple[str, str]:
    look = dono.post("/looks", json=LOOK).json()["id"]
    peca = dono.post(f"/looks/{look}/pieces", json=PECA).json()["id"]
    return look, peca


@pytest.fixture
def com_bucket(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("S3_BUCKET", "vesteai-imagens-teste")
    armazenamento.get_settings.cache_clear()
    yield
    armazenamento.get_settings.cache_clear()


@pytest.fixture
def s3_falso(monkeypatch: pytest.MonkeyPatch) -> dict:
    guardado: dict[str, object] = {}

    class ClienteFalso:
        def put_object(self, **kwargs: object) -> None:
            guardado.update(kwargs)

        def generate_presigned_url(self, _operacao: str, Params: dict, ExpiresIn: int) -> str:  # noqa: N803
            return f"https://s3.exemplo/{Params['Key']}?assinado=1"

    monkeypatch.setattr(armazenamento, "_cliente", lambda: ClienteFalso())

    return guardado


def enviar(c: TestClient, look: str, peca: str, conteudo: bytes, tipo: str = "image/jpeg"):
    return c.post(
        f"/looks/{look}/pieces/{peca}/image", files={"arquivo": ("f.jpg", conteudo, tipo)}
    )


def test_o_dono_envia_a_foto_da_peca(dono, look_e_peca, com_bucket, s3_falso) -> None:
    look, peca = look_e_peca

    resposta = enviar(dono, look, peca, JPEG)

    assert resposta.status_code == 200
    assert resposta.json()["image_url"].startswith("https://s3.exemplo/")
    assert s3_falso["ContentType"] == "image/jpeg"


def test_a_chave_da_foto_aponta_para_a_peca(dono, look_e_peca, com_bucket, s3_falso) -> None:
    look, peca = look_e_peca

    enviar(dono, look, peca, PNG, "image/png")

    assert str(s3_falso["Key"]).startswith(f"looks/{look}/pieces/{peca}/")
    assert str(s3_falso["Key"]).endswith(".png")


# RN07: creator só mexe no que é dele.
def test_rn07_nao_envia_foto_para_peca_alheia(
    client: TestClient, com_bucket, s3_falso
) -> None:
    do_dono = {"Authorization": f"Bearer {token(client, DONO)}"}
    look = client.post("/looks", json=LOOK, headers=do_dono).json()["id"]
    peca = client.post(f"/looks/{look}/pieces", json=PECA, headers=do_dono).json()["id"]

    client.headers["Authorization"] = f"Bearer {token(client, OUTRA)}"

    assert enviar(client, look, peca, JPEG).status_code == 403


def test_visitante_nao_envia_foto_de_peca(
    client: TestClient, look_e_peca, com_bucket, s3_falso
) -> None:
    look, peca = look_e_peca
    client.headers.pop("Authorization", None)

    assert enviar(client, look, peca, JPEG).status_code == 401


# A peça precisa ser deste look: o id de outra peça do mesmo dono não serve de atalho.
def test_peca_de_outro_look_e_404(dono, look_e_peca, com_bucket, s3_falso) -> None:
    look, _ = look_e_peca
    outro = dono.post("/looks", json=LOOK).json()["id"]
    peca_do_outro = dono.post(f"/looks/{outro}/pieces", json=PECA).json()["id"]

    assert enviar(dono, look, peca_do_outro, JPEG).status_code == 404


def test_recusa_arquivo_que_nao_e_imagem(dono, look_e_peca, com_bucket, s3_falso) -> None:
    look, peca = look_e_peca

    resposta = enviar(dono, look, peca, b"MZ\x90\x00 isto e um executavel")

    assert resposta.status_code == 422
    assert resposta.json()["code"] == "INVALID_IMAGE"


def test_recusa_foto_grande_demais(dono, look_e_peca, com_bucket, s3_falso) -> None:
    look, peca = look_e_peca

    resposta = enviar(dono, look, peca, b"\xff\xd8\xff\xe0" + b"0" * (6 * 1024 * 1024))

    assert resposta.status_code == 422
    assert resposta.json()["code"] == "IMAGE_TOO_LARGE"


def test_sem_bucket_recusa_com_recado(dono, look_e_peca) -> None:
    look, peca = look_e_peca

    resposta = enviar(dono, look, peca, JPEG)

    assert resposta.status_code == 503
    assert resposta.json()["code"] == "STORAGE_UNAVAILABLE"


# P03: a foto enviada tem de aparecer em toda tela que mostra a peça, não só na resposta
# do envio — o endereço assinado é resolvido na leitura.
def test_a_foto_enviada_aparece_no_look(dono, look_e_peca, com_bucket, s3_falso) -> None:
    look, peca = look_e_peca
    enviar(dono, look, peca, JPEG)

    pecas = dono.get(f"/looks/{look}").json()["pieces"]

    assert pecas[0]["image_url"].startswith(f"https://s3.exemplo/looks/{look}/pieces/{peca}/")


def test_a_foto_enviada_aparece_na_vitrine(dono, look_e_peca, com_bucket, s3_falso) -> None:
    look, peca = look_e_peca
    enviar(dono, look, peca, JPEG)
    dono.patch(f"/looks/{look}", json={"category": "work", "image_url": "https://img.exemplo/l.jpg"})
    dono.post(f"/looks/{look}/publish")

    pecas = dono.get(f"/feed/{look}").json()["pieces"]

    assert pecas[0]["image_url"].startswith("https://s3.exemplo/")


# A peça antiga, com endereço colado, continua mostrando o endereço dela.
def test_peca_com_endereco_colado_continua_igual(dono, com_bucket, s3_falso) -> None:
    look = dono.post("/looks", json=LOOK).json()["id"]
    dono.post(f"/looks/{look}/pieces", json={**PECA, "image_url": "https://loja.exemplo/b.jpg"})

    assert dono.get(f"/looks/{look}").json()["pieces"][0]["image_url"] == "https://loja.exemplo/b.jpg"
