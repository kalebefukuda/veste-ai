import pytest
from fastapi.testclient import TestClient

from app.clients import armazenamento
from tests.test_looks import DONO, LOOK, OUTRA, token

# Bytes mínimos que passam pela conferência de assinatura de arquivo.
JPEG = b"\xff\xd8\xff\xe0" + b"0" * 64
PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 64
WEBP = b"RIFF" + b"0000" + b"WEBP" + b"0" * 64


@pytest.fixture
def dono(client: TestClient) -> TestClient:
    client.headers["Authorization"] = f"Bearer {token(client, DONO)}"
    return client


@pytest.fixture
def look(dono: TestClient) -> str:
    return dono.post("/looks", json=LOOK).json()["id"]


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
            return f"https://s3.exemplo/{Params['Key']}?assinado=1&exp={ExpiresIn}"

    monkeypatch.setattr(armazenamento, "_cliente", lambda: ClienteFalso())

    return guardado


def enviar(
    c: TestClient, look: str, conteudo: bytes, tipo: str = "image/jpeg", nome: str = "f.jpg"
):
    return c.post(f"/looks/{look}/image", files={"arquivo": (nome, conteudo, tipo)})


def test_o_dono_envia_a_foto_do_look(dono, look, com_bucket, s3_falso) -> None:
    resposta = enviar(dono, look, JPEG)

    assert resposta.status_code == 200
    # A resposta já traz o endereço assinado, senão a tela teria de recarregar para ver.
    assert resposta.json()["image_url"].startswith("https://s3.exemplo/")
    assert s3_falso["ContentType"] == "image/jpeg"


def test_a_chave_guardada_aponta_para_o_look(dono, look, com_bucket, s3_falso) -> None:
    enviar(dono, look, PNG, "image/png", "f.png")

    assert str(s3_falso["Key"]).startswith(f"looks/{look}/")


# RN07: creator só mexe no que é dele.
def test_rn07_nao_envia_foto_para_look_alheio(client: TestClient, com_bucket, s3_falso) -> None:
    do_dono = {"Authorization": f"Bearer {token(client, DONO)}"}
    look = client.post("/looks", json=LOOK, headers=do_dono).json()["id"]

    client.headers["Authorization"] = f"Bearer {token(client, OUTRA)}"

    assert enviar(client, look, JPEG).status_code == 403


def test_visitante_nao_envia_foto(client: TestClient, look: str, com_bucket, s3_falso) -> None:
    client.headers.pop("Authorization", None)

    assert enviar(client, look, JPEG).status_code == 401


# O cabeçalho do arquivo é escrito por quem envia. A assinatura no começo dos bytes é
# o que separa uma imagem de um executável renomeado.
def test_recusa_arquivo_que_nao_e_imagem(dono, look, com_bucket, s3_falso) -> None:
    resposta = enviar(dono, look, b"MZ\x90\x00 isto e um executavel", "image/jpeg")

    assert resposta.status_code == 422
    assert resposta.json()["code"] == "INVALID_IMAGE"


def test_recusa_tipo_fora_da_lista(dono, look, com_bucket, s3_falso) -> None:
    resposta = enviar(dono, look, JPEG, "image/svg+xml", "f.svg")

    assert resposta.status_code == 422


def test_recusa_arquivo_grande_demais(dono, look, com_bucket, s3_falso) -> None:
    gordo = b"\xff\xd8\xff\xe0" + b"0" * (6 * 1024 * 1024)

    resposta = enviar(dono, look, gordo)

    assert resposta.status_code == 422
    assert resposta.json()["code"] == "IMAGE_TOO_LARGE"


def test_aceita_png_e_webp(dono, look, com_bucket, s3_falso) -> None:
    assert enviar(dono, look, PNG, "image/png", "f.png").status_code == 200
    assert enviar(dono, look, WEBP, "image/webp", "f.webp").status_code == 200


# Sem bucket configurado a funcionalidade não existe ainda, e dizer isso é melhor que
# estourar 500 ou fingir que guardou.
def test_sem_bucket_configurado_recusa_com_recado(dono, look) -> None:
    resposta = enviar(dono, look, JPEG)

    assert resposta.status_code == 503
    assert resposta.json()["code"] == "STORAGE_UNAVAILABLE"


def test_a_foto_enviada_serve_de_imagem_para_publicar(dono, look, com_bucket, s3_falso) -> None:
    from tests.test_looks import PECA

    dono.post(f"/looks/{look}/pieces", json=PECA)
    dono.patch(f"/looks/{look}", json={"category": "work"})
    enviar(dono, look, JPEG)

    # A pré-condição de imagem vale para foto enviada, não só para endereço colado.
    assert dono.post(f"/looks/{look}/publish").status_code == 200
