"""Onde a imagem de um look mora, e como ela vira endereço para a tela."""

import logging
import uuid

from app.clients import armazenamento, gemini
from app.core.exceptions import (
    GenerationFailed,
    GenerationUnavailable,
    ImageTooLarge,
    InvalidImage,
    NothingToCompose,
    PiecesWithoutPhoto,
    StorageUnavailable,
)
from app.models.look import Look, Piece
from app.schemas.feed import FeedLookOut
from app.schemas.look import LookOut, ModeloDoLook

logger = logging.getLogger(__name__)

TAMANHO_MAXIMO = 5 * 1024 * 1024

# O cabeçalho do arquivo é escrito por quem envia. A assinatura nos bytes é o que
# separa uma imagem de um executável renomeado. Cada par é (posição, conteúdo), e
# todos precisam bater.
ASSINATURAS: dict[str, tuple[tuple[int, bytes], ...]] = {
    "image/jpeg": ((0, b"\xff\xd8\xff"),),
    "image/png": ((0, b"\x89PNG\r\n\x1a\n"),),
    # RIFF sozinho não diz WebP: AVI e WAV usam o mesmo contêiner. Quem identifica é o
    # marcador nos bytes 8 a 11.
    "image/webp": ((0, b"RIFF"), (8, b"WEBP")),
}

EXTENSOES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def _tipo_pelos_bytes(conteudo: bytes) -> str | None:
    return next(
        (
            tipo
            for tipo, assinatura in ASSINATURAS.items()
            if all(
                conteudo[posicao : posicao + len(esperado)] == esperado
                for posicao, esperado in assinatura
            )
        ),
        None,
    )


def guardar(pasta: str, conteudo: bytes, tipo: str) -> str:
    if tipo not in ASSINATURAS:
        raise InvalidImage()

    if len(conteudo) > TAMANHO_MAXIMO:
        raise ImageTooLarge()

    if _tipo_pelos_bytes(conteudo) != tipo:
        raise InvalidImage()

    # `uuid` no nome para troca de foto não colidir com a anterior em cache, e a pasta
    # com os ids do look e da peça para o bucket ficar legível.
    chave = f"{pasta}/{uuid.uuid4()}.{EXTENSOES[tipo]}"
    armazenamento.guardar(chave, conteudo, tipo)

    return chave


def _foto_da_peca(peca: Piece) -> tuple[bytes, str] | None:
    if peca.image_key:
        return armazenamento.ler(peca.image_key)

    return gemini.buscar_foto(peca.image_url) if peca.image_url else None


def gerar_do_look(look: Look, modelo: ModeloDoLook | None = None) -> str:
    # Antes de qualquer ida à rede: sem chave a funcionalidade não existe, e descobrir
    # isso depois de buscar as fotos viraria "sem o que compor" — que culpa a pessoa
    # por algo que é nosso.
    if not gemini.disponivel():
        raise GenerationUnavailable()

    if not armazenamento.disponivel():
        raise StorageUnavailable()

    # Sem peça não há o que compor: o modelo devolveria alguém vestindo o que ele
    # inventou, não o look da pessoa.
    if not look.pieces:
        raise NothingToCompose()

    # O modelo veste todas as peças; uma sem foto deixaria a imagem mentir sobre o look.
    sem_foto = [str(peca.id) for peca in look.pieces if not (peca.image_key or peca.image_url)]

    if sem_foto:
        raise PiecesWithoutPhoto(sem_foto)

    fotos = [foto for peca in look.pieces if (foto := _foto_da_peca(peca))]

    if not fotos:
        raise NothingToCompose()

    gerada = gemini.gerar(
        fotos,
        look.description or look.title,
        genero=modelo.gender if modelo else None,
        cabelo=modelo.hair_color if modelo else None,
        comprimento=modelo.hair_length if modelo else None,
    )
    # O formato é escolha do modelo, e o que vale são os bytes, não o rótulo da resposta.
    tipo = _tipo_pelos_bytes(gerada)

    if tipo is None:
        logger.warning("Gemini devolveu conteúdo que não é imagem conhecida")
        raise GenerationFailed()

    chave = f"looks/{look.id}/{uuid.uuid4()}.{EXTENSOES[tipo]}"
    armazenamento.guardar(chave, gerada, tipo)

    return chave


# Chave enviada ganha endereço assinado; endereço colado à mão continua como está. Os
# looks e as peças que já existiam não podem parar de ter foto por causa da coluna nova.
def endereco(origem: Look | Piece) -> str | None:
    if origem.image_key:
        return armazenamento.endereco_temporario(origem.image_key)

    return origem.image_url


# Ponto único: o endereço assinado tem de ser resolvido em toda tela que devolve look,
# e esquecer uma deixaria a foto enviada — do look ou da peça — invisível nela.
def resolver_enderecos(saida: LookOut | FeedLookOut, look: Look) -> None:
    saida.image_url = endereco(look)

    for saida_da_peca, peca in zip(saida.pieces, look.pieces, strict=True):
        saida_da_peca.image_url = endereco(peca)


def para_vitrine(look: Look) -> FeedLookOut:
    saida = FeedLookOut.model_validate(look)
    resolver_enderecos(saida, look)

    return saida
