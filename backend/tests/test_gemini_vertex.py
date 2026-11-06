import base64

import httpx
import pytest

from app.clients import gemini

GERADA = b"\xff\xd8\xff\xe0" + b"gerada" * 8
VERTEX = "https://aiplatform.googleapis.com/v1/projects/{}/locations/global/publishers/google/models/gemini-3.1-flash-lite-image:generateContent"


@pytest.fixture
def chamada(monkeypatch: pytest.MonkeyPatch) -> dict:
    enviado: dict[str, object] = {}

    def fake_post(url: str, **kwargs: object) -> httpx.Response:
        enviado["url"] = url
        enviado.update(kwargs)
        corpo = {
            "candidates": [
                {"content": {"parts": [{"inlineData": {
                    "mimeType": "image/jpeg", "data": base64.b64encode(GERADA).decode(),
                }}]}}
            ]
        }
        return httpx.Response(200, json=corpo, request=httpx.Request("POST", url))

    monkeypatch.setattr(gemini.httpx, "post", fake_post)
    monkeypatch.setenv("GEMINI_API_KEY", "chave-de-teste")
    gemini.get_settings.cache_clear()
    yield enviado
    gemini.get_settings.cache_clear()


def test_gera_pelo_vertex_do_projeto_padrao(chamada):
    assert gemini.gerar([], "camiseta branca") == GERADA

    assert chamada["url"] == VERTEX.format("vesteai-gemini")


def test_projeto_do_vertex_vem_da_configuracao(chamada, monkeypatch):
    monkeypatch.setenv("GEMINI_PROJECT", "outro-projeto")
    gemini.get_settings.cache_clear()

    gemini.gerar([], "camiseta branca")

    assert chamada["url"] == VERTEX.format("outro-projeto")


def test_vertex_exige_a_mensagem_marcada_como_do_usuario(chamada):
    gemini.gerar([], "camiseta branca")

    assert chamada["json"]["contents"][0]["role"] == "user"  # type: ignore[index]


def test_chave_vai_no_cabecalho_e_nunca_no_endereco(chamada):
    gemini.gerar([], "camiseta branca")

    assert chamada["headers"] == {"x-goog-api-key": "chave-de-teste"}
    assert "chave-de-teste" not in str(chamada["url"])
