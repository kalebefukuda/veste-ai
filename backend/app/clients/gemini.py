"""Geração da imagem do look. A chave e o formato do pedido não saem desta camada."""

import base64
import logging

import httpx

from app.config import get_settings
from app.core.exceptions import GenerationFailed, GenerationUnavailable

logger = logging.getLogger(__name__)

MODELO = "gemini-2.5-flash-image"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODELO}:generateContent"

# A RFC exige geração em menos de 30 segundos; o cliente desiste nesse ponto.
TIMEOUT = 30.0
# Foto de peça é ilustração de catálogo, não arquivo grande. Sem teto, um endereço
# hostil devolveria gigabytes para dentro do processo.
MAXIMO_POR_PECA = 5 * 1024 * 1024
TIMEOUT_DA_PECA = 8.0

# O formato é contrato, não sugestão: sem ele cada look sai num enquadramento e a
# vitrine vira colcha de retalhos. O 3:4 é o mesmo que a tela trava.
FORMATO = (
    "Fotografia de moda de corpo inteiro. Uma única pessoa em pé, de frente, "
    "vestindo exatamente as peças das imagens fornecidas. Estúdio com fundo liso "
    "cinza-claro e luz suave uniforme. Enquadramento vertical 3:4, corpo inteiro "
    "visível da cabeça aos pés, pessoa centralizada. Sem texto, sem logotipo, sem "
    "marca d'água e sem colagem: uma única fotografia coerente."
)


def disponivel() -> bool:
    return bool(get_settings().gemini_api_key)


def buscar_foto(url: str) -> tuple[bytes, str] | None:
    """Baixa a foto de uma peça para servir de entrada ao modelo."""
    conteudo = bytearray()

    try:
        with httpx.stream("GET", url, timeout=TIMEOUT_DA_PECA, follow_redirects=False) as resposta:
            resposta.raise_for_status()

            # Em pedaços: o teto vale durante o download, não depois dele.
            for pedaco in resposta.iter_bytes():
                conteudo += pedaco

                if len(conteudo) > MAXIMO_POR_PECA:
                    logger.info("Foto de peça grande demais, seguindo sem ela: %s", url)
                    return None

            tipo = resposta.headers.get("content-type", "image/jpeg").split(";")[0]
    except httpx.HTTPError as erro:
        # Peça sem foto acessível apenas não entra na composição — uma loja fora do ar
        # não pode impedir a geração do look inteiro.
        logger.info("Foto de peça inacessível, seguindo sem ela: %s", erro)
        return None

    return bytes(conteudo), tipo


GENEROS = {"feminino": "uma mulher", "masculino": "um homem"}
COMPRIMENTOS = {"curto": "curto", "medio": "na altura dos ombros", "longo": "longo"}


def _pessoa(genero: str | None, cabelo: str | None, comprimento: str | None) -> str:
    """Traduz o preset da tela em uma frase do prompt. Sem preset, nada é dito."""
    if not (genero or cabelo or comprimento):
        return ""

    quem = GENEROS.get(genero or "", "uma pessoa")
    tracos = " ".join(filter(None, [cabelo, COMPRIMENTOS.get(comprimento or "")]))

    return f"O modelo é {quem}" + (f", de cabelo {tracos}" if tracos else "") + "."


def gerar(
    pecas: list[tuple[bytes, str]],
    descricao: str,
    genero: str | None = None,
    cabelo: str | None = None,
    comprimento: str | None = None,
) -> bytes:
    chave = get_settings().gemini_api_key

    if not chave:
        logger.warning("GEMINI_API_KEY ausente: geração recusada")
        raise GenerationUnavailable()

    pedido = "\n\n".join(
        filter(None, [FORMATO, _pessoa(genero, cabelo, comprimento), f"Sobre o look: {descricao}"])
    )
    partes: list[dict] = [{"text": pedido}]
    partes += [
        {"inlineData": {"mimeType": tipo, "data": base64.b64encode(dados).decode()}}
        for dados, tipo in pecas
    ]

    try:
        # No cabeçalho: na URL a chave sairia no log do httpx e na mensagem de erro.
        resposta = httpx.post(
            ENDPOINT,
            headers={"x-goog-api-key": chave},
            json={"contents": [{"parts": partes}]},
            timeout=TIMEOUT,
        )
        resposta.raise_for_status()
    except httpx.HTTPError as erro:
        # Erro da biblioteca não sobe: as camadas de cima falam a língua do domínio.
        logger.warning("Gemini recusou a geração: %s", erro)
        raise GenerationFailed() from erro

    return _imagem_da_resposta(resposta.json())


def _imagem_da_resposta(corpo: dict) -> bytes:
    for candidato in corpo.get("candidates", []):
        for parte in candidato.get("content", {}).get("parts", []):
            dados = parte.get("inlineData", {}).get("data")

            if dados:
                return base64.b64decode(dados)

    # Resposta 200 sem imagem acontece quando o modelo recusa o pedido. Para quem
    # chamou é falha de geração igual, e a tela oferece tentar de novo.
    logger.warning("Gemini respondeu sem imagem")
    raise GenerationFailed()
