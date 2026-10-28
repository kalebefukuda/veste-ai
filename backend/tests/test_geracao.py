import base64
import socket
from collections.abc import Iterator

import httpx
import pytest
from fastapi.testclient import TestClient

from app.clients import armazenamento, gemini
from tests.test_looks import DONO, LOOK, OUTRA, PECA, token

JPEG = b"\xff\xd8\xff\xe0" + b"0" * 64
GERADA = b"\xff\xd8\xff\xe0" + b"gerada" * 8
GERADA_PNG = b"\x89PNG\r\n\x1a\n" + b"gerada" * 8

FOTO_DA_PECA = "https://cdn.exemplo.com/sobretudo.jpg"


def resposta_do_gemini(imagem: bytes, tipo: str = "image/jpeg") -> dict:
    return {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "inlineData": {
                                "mimeType": tipo,
                                "data": base64.b64encode(imagem).decode(),
                            }
                        }
                    ]
                }
            }
        ]
    }


def resolve_para(ip: str):
    return lambda _host: [ip]


# Nenhum teste depende do DNS de verdade: todo nome resolve para um endereço público.
@pytest.fixture(autouse=True)
def dns_publico(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(gemini, "_enderecos", resolve_para("93.184.216.34"))


@pytest.fixture
def dono(client: TestClient) -> TestClient:
    client.headers["Authorization"] = f"Bearer {token(client, DONO)}"
    return client


@pytest.fixture
def look_com_peca_ilustrada(dono: TestClient) -> str:
    look = dono.post("/looks", json=LOOK).json()["id"]
    dono.post(f"/looks/{look}/pieces", json={**PECA, "image_url": FOTO_DA_PECA})
    return look


@pytest.fixture
def com_chave(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("GEMINI_API_KEY", "chave-de-teste")
    monkeypatch.setenv("S3_BUCKET", "vesteai-imagens-teste")
    gemini.get_settings.cache_clear()
    yield
    gemini.get_settings.cache_clear()


@pytest.fixture
def rede_falsa(monkeypatch: pytest.MonkeyPatch) -> dict:
    enviado: dict[str, object] = {}

    # No transporte, e não no `httpx.get`: a foto pode ser lida inteira ou em pedaços.
    def fake_get(_transporte: object, pedido: httpx.Request) -> httpx.Response:
        enviado.setdefault("buscadas", []).append(str(pedido.url))  # type: ignore[union-attr]
        return httpx.Response(200, content=JPEG, request=pedido)

    def fake_post(url: str, **kwargs: object) -> httpx.Response:
        enviado["url"] = url
        enviado.update(kwargs)
        return httpx.Response(
            200, json=resposta_do_gemini(GERADA), request=httpx.Request("POST", url)
        )

    monkeypatch.setattr(httpx.HTTPTransport, "handle_request", fake_get)
    monkeypatch.setattr(gemini.httpx, "post", fake_post)

    class ClienteFalso:
        def put_object(self, **kwargs: object) -> None:
            enviado["guardado"] = kwargs

        def generate_presigned_url(self, _o: str, Params: dict, ExpiresIn: int) -> str:  # noqa: N803
            return f"https://s3.exemplo/{Params['Key']}"

    monkeypatch.setattr(armazenamento, "_cliente", lambda: ClienteFalso())

    return enviado


def gerar(c: TestClient, look: str, **corpo: object):
    return c.post(f"/looks/{look}/generate", json=corpo or None)


def test_gera_o_modelo_a_partir_das_pecas(dono, look_com_peca_ilustrada, com_chave, rede_falsa):
    resposta = gerar(dono, look_com_peca_ilustrada)

    assert resposta.status_code == 200
    assert resposta.json()["image_url"].startswith("https://s3.exemplo/")
    # A foto da peça entra como entrada do modelo, não só o texto.
    assert rede_falsa["buscadas"] == [FOTO_DA_PECA]


def test_a_imagem_gerada_e_guardada_como_do_look(
    dono, look_com_peca_ilustrada, com_chave, rede_falsa
):
    gerar(dono, look_com_peca_ilustrada)

    assert str(rede_falsa["guardado"]["Key"]).startswith(f"looks/{look_com_peca_ilustrada}/")


# A coluna `ai_generated` existe desde a `0001` e nunca tinha sido escrita. Ela é o que
# separa foto de quem montou de imagem de máquina.
def test_marca_o_look_como_gerado_por_ia(dono, look_com_peca_ilustrada, com_chave, rede_falsa):
    assert gerar(dono, look_com_peca_ilustrada).json()["ai_generated"] is True


# O formato é contrato, não sugestão: sem ele cada look sai num enquadramento e a
# vitrine vira colcha de retalhos.
def test_o_pedido_trava_o_formato(dono, look_com_peca_ilustrada, com_chave, rede_falsa):
    gerar(dono, look_com_peca_ilustrada)

    texto = str(rede_falsa["json"])

    assert "3:4" in texto
    assert "corpo inteiro" in texto.lower()


def test_rn07_nao_gera_para_look_alheio(client: TestClient, com_chave, rede_falsa):
    do_dono = {"Authorization": f"Bearer {token(client, DONO)}"}
    look = client.post("/looks", json=LOOK, headers=do_dono).json()["id"]
    client.post(f"/looks/{look}/pieces", json={**PECA, "image_url": FOTO_DA_PECA}, headers=do_dono)

    client.headers["Authorization"] = f"Bearer {token(client, OUTRA)}"

    assert gerar(client, look).status_code == 403


def test_visitante_nao_gera(client: TestClient, look_com_peca_ilustrada, com_chave, rede_falsa):
    client.headers.pop("Authorization", None)

    assert gerar(client, look_com_peca_ilustrada).status_code == 401


# Sem peça com foto não há o que compor: gerar a partir do nada devolveria um modelo
# vestindo o que a IA inventou, não o look da pessoa.
def test_recusa_look_sem_peca_com_foto(dono: TestClient, com_chave, rede_falsa):
    look = dono.post("/looks", json=LOOK).json()["id"]
    dono.post(f"/looks/{look}/pieces", json=PECA)

    resposta = gerar(dono, look)

    assert resposta.status_code == 422
    assert resposta.json()["code"] == "NOTHING_TO_COMPOSE"


def test_sem_chave_configurada_recusa_com_recado(dono, look_com_peca_ilustrada):
    resposta = gerar(dono, look_com_peca_ilustrada)

    assert resposta.status_code == 503
    assert resposta.json()["code"] == "GENERATION_UNAVAILABLE"


# Sem bucket a imagem gerada não teria onde ficar: o Gemini nem é chamado.
def test_sem_bucket_recusa_antes_de_gerar(
    dono, look_com_peca_ilustrada, com_chave, rede_falsa, monkeypatch
):
    monkeypatch.setenv("S3_BUCKET", "")
    gemini.get_settings.cache_clear()

    resposta = gerar(dono, look_com_peca_ilustrada)

    assert resposta.status_code == 503
    assert resposta.json()["code"] == "STORAGE_UNAVAILABLE"
    assert "url" not in rede_falsa


# FA05 da RFC: a falha mostra recado e não leva o look junto — as peças e os links já
# cadastrados continuam lá para tentar de novo ou enviar foto à mão.
@pytest.mark.parametrize("falha", [httpx.ReadTimeout("demorou"), httpx.ConnectError("sem rede")])
def test_fa05_falha_na_geracao_nao_perde_o_look(
    dono, look_com_peca_ilustrada, com_chave, rede_falsa, monkeypatch, falha
):
    def explode(*_: object, **__: object) -> httpx.Response:
        raise falha

    monkeypatch.setattr(gemini.httpx, "post", explode)

    resposta = gerar(dono, look_com_peca_ilustrada)

    assert resposta.status_code == 502
    assert resposta.json()["code"] == "GENERATION_FAILED"
    # O look sobrevive inteiro: peça, link e título continuam lá.
    assert len(dono.get(f"/looks/{look_com_peca_ilustrada}").json()["pieces"]) == 1


def test_resposta_sem_imagem_e_falha_de_geracao(
    dono, look_com_peca_ilustrada, com_chave, rede_falsa, monkeypatch
):
    def sem_imagem(url: str, **_: object) -> httpx.Response:
        return httpx.Response(200, json={"candidates": []}, request=httpx.Request("POST", url))

    monkeypatch.setattr(gemini.httpx, "post", sem_imagem)

    assert gerar(dono, look_com_peca_ilustrada).status_code == 502


# O preset existe para o feed não virar colcha de retalhos por outro caminho: sem ele
# cada geração inventa uma pessoa diferente vestindo o mesmo look.
def test_o_preset_do_modelo_entra_no_pedido(
    dono, look_com_peca_ilustrada, com_chave, rede_falsa
):
    gerar(
        dono,
        look_com_peca_ilustrada,
        gender="feminino",
        hair_color="loiro",
        hair_length="longo",
    )

    texto = str(rede_falsa["json"]).lower()

    assert "mulher" in texto
    assert "loiro" in texto
    assert "longo" in texto


# Preset é opcional: quem não escolhe nada continua gerando, e o pedido não carrega
# atributo nenhum inventado por nós.
def test_sem_preset_o_pedido_nao_descreve_a_pessoa(
    dono, look_com_peca_ilustrada, com_chave, rede_falsa
):
    gerar(dono, look_com_peca_ilustrada)

    texto = str(rede_falsa["json"]).lower()

    assert "mulher" not in texto
    assert "homem" not in texto


@pytest.mark.parametrize(
    "campo,valor",
    [("gender", "outro"), ("hair_color", "azul"), ("hair_length", "raspado")],
)
def test_preset_fora_da_lista_e_recusado(
    dono, look_com_peca_ilustrada, com_chave, rede_falsa, campo, valor
):
    assert gerar(dono, look_com_peca_ilustrada, **{campo: valor}).status_code == 422


# A mensagem de erro do httpx traz a URL inteira, e essa mensagem vai para o log.
def test_a_chave_nao_aparece_no_log_quando_o_gemini_recusa(
    dono, look_com_peca_ilustrada, com_chave, rede_falsa, monkeypatch, caplog
):
    def recusa(url: str, **kwargs: object) -> httpx.Response:
        pedido = httpx.Request(
            "POST", url, params=kwargs.get("params"), headers=kwargs.get("headers")
        )
        return httpx.Response(400, request=pedido)

    monkeypatch.setattr(gemini.httpx, "post", recusa)

    assert gerar(dono, look_com_peca_ilustrada).status_code == 502
    assert "chave-de-teste" not in caplog.text


def test_a_chave_vai_no_cabecalho(dono, look_com_peca_ilustrada, com_chave, rede_falsa):
    gerar(dono, look_com_peca_ilustrada)

    assert rede_falsa["headers"] == {"x-goog-api-key": "chave-de-teste"}


# Loja fora do ar não derruba a geração: a peça só fica fora da composição.
def test_foto_inacessivel_fica_fora_da_composicao(
    dono, look_com_peca_ilustrada, com_chave, rede_falsa, monkeypatch
):
    def fora_do_ar(_transporte: object, pedido: httpx.Request) -> httpx.Response:
        return httpx.Response(404, request=pedido)

    monkeypatch.setattr(httpx.HTTPTransport, "handle_request", fora_do_ar)

    assert gerar(dono, look_com_peca_ilustrada).json()["code"] == "NOTHING_TO_COMPOSE"


def test_foto_grande_demais_para_de_ser_baixada_no_teto(monkeypatch: pytest.MonkeyPatch):
    lidos: list[int] = []

    def pedacos() -> Iterator[bytes]:
        for _ in range(50):
            lidos.append(1)
            yield b"0" * 1024 * 1024

    def responde(_transporte: object, pedido: httpx.Request) -> httpx.Response:
        return httpx.Response(200, content=pedacos(), request=pedido)

    monkeypatch.setattr(httpx.HTTPTransport, "handle_request", responde)

    assert gemini.buscar_foto(FOTO_DA_PECA) is None
    assert len(lidos) <= 6


# O formato é escolha do modelo: gravar tudo como JPEG mentiria no tipo e na extensão.
def test_a_imagem_gerada_guarda_o_formato_que_o_modelo_devolveu(
    dono, look_com_peca_ilustrada, com_chave, rede_falsa, monkeypatch
):
    def devolve_png(url: str, **_: object) -> httpx.Response:
        return httpx.Response(
            200,
            json=resposta_do_gemini(GERADA_PNG, "image/png"),
            request=httpx.Request("POST", url),
        )

    monkeypatch.setattr(gemini.httpx, "post", devolve_png)

    gerar(dono, look_com_peca_ilustrada)

    assert rede_falsa["guardado"]["ContentType"] == "image/png"
    assert str(rede_falsa["guardado"]["Key"]).endswith(".png")


def test_resposta_que_nao_e_imagem_nao_vira_foto_do_look(
    dono, look_com_peca_ilustrada, com_chave, rede_falsa, monkeypatch
):
    def devolve_texto(url: str, **_: object) -> httpx.Response:
        return httpx.Response(
            200,
            json=resposta_do_gemini(b"<html>nao sou imagem</html>", "image/png"),
            request=httpx.Request("POST", url),
        )

    monkeypatch.setattr(gemini.httpx, "post", devolve_texto)

    resposta = gerar(dono, look_com_peca_ilustrada)

    assert resposta.status_code == 502
    assert resposta.json()["code"] == "GENERATION_FAILED"
    assert "guardado" not in rede_falsa


# Foto enviada à mão é de quem montou, mesmo que antes o look tivesse imagem gerada.
def test_enviar_foto_depois_de_gerar_tira_a_marca_de_ia(
    dono, look_com_peca_ilustrada, com_chave, rede_falsa
):
    gerar(dono, look_com_peca_ilustrada)

    resposta = dono.post(
        f"/looks/{look_com_peca_ilustrada}/image",
        files={"arquivo": ("foto.jpg", JPEG, "image/jpeg")},
    )

    assert resposta.json()["ai_generated"] is False


# A URL da foto é de quem cadastrou a peça: sem barreira, o servidor buscaria a rede
# interna — inclusive as credenciais da task no endereço de metadados do Fargate.
@pytest.mark.parametrize(
    "url",
    [
        "http://169.254.170.2/v2/credentials",
        "http://127.0.0.1:8000/health",
        "http://10.0.0.5/foto.jpg",
        "http://[::1]/foto.jpg",
    ],
)
def test_foto_em_endereco_interno_nao_e_buscada(url: str, rede_falsa):
    assert gemini.buscar_foto(url) is None
    assert "buscadas" not in rede_falsa


def test_nome_que_resolve_para_endereco_interno_nao_e_buscado(rede_falsa, monkeypatch):
    monkeypatch.setattr(gemini, "_enderecos", resolve_para("10.0.0.5"))

    assert gemini.buscar_foto("https://loja.exemplo/foto.jpg") is None
    assert "buscadas" not in rede_falsa


def test_nome_que_nao_resolve_fica_fora_da_composicao(rede_falsa, monkeypatch):
    def nao_resolve(_host: str) -> list[str]:
        raise socket.gaierror("nome desconhecido")

    monkeypatch.setattr(gemini, "_enderecos", nao_resolve)

    assert gemini.buscar_foto("https://nao-existe.exemplo/foto.jpg") is None
    assert "buscadas" not in rede_falsa
