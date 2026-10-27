"""Onde a imagem de um look mora, e como ela vira endereço para a tela."""

import uuid

from app.clients import armazenamento, gemini
from app.core.exceptions import (
    GenerationUnavailable,
    ImageTooLarge,
    InvalidImage,
    NothingToCompose,
    StorageUnavailable,
)
from app.models.look import Look
from app.schemas.feed import FeedLookOut
from app.schemas.look import ModeloDoLook

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


def guardar(look: Look, conteudo: bytes, tipo: str) -> str:
    if tipo not in ASSINATURAS:
        raise InvalidImage()

    if len(conteudo) > TAMANHO_MAXIMO:
        raise ImageTooLarge()

    if not all(
        conteudo[posicao : posicao + len(esperado)] == esperado
        for posicao, esperado in ASSINATURAS[tipo]
    ):
        raise InvalidImage()

    # `uuid` no nome para troca de foto não colidir com a anterior em cache, e prefixo
    # com o id do look para o bucket ficar legível.
    chave = f"looks/{look.id}/{uuid.uuid4()}.{EXTENSOES[tipo]}"
    armazenamento.guardar(chave, conteudo, tipo)

    return chave


def gerar_do_look(look: Look, modelo: ModeloDoLook | None = None) -> str:
    # Antes de qualquer ida à rede: sem chave a funcionalidade não existe, e descobrir
    # isso depois de buscar as fotos viraria "sem o que compor" — que culpa a pessoa
    # por algo que é nosso.
    if not gemini.disponivel():
        raise GenerationUnavailable()

    if not armazenamento.disponivel():
        raise StorageUnavailable()

    fotos = [
        foto
        for peca in look.pieces
        if peca.image_url and (foto := gemini.buscar_foto(peca.image_url))
    ]

    # Sem peça com foto não há o que compor: o modelo devolveria alguém vestindo o que
    # ele inventou, não o look da pessoa.
    if not fotos:
        raise NothingToCompose()

    gerada = gemini.gerar(
        fotos,
        look.description or look.title,
        genero=modelo.gender if modelo else None,
        cabelo=modelo.hair_color if modelo else None,
        comprimento=modelo.hair_length if modelo else None,
    )
    chave = f"looks/{look.id}/{uuid.uuid4()}.jpg"
    armazenamento.guardar(chave, gerada, "image/jpeg")

    return chave


# Chave enviada ganha endereço assinado; endereço colado à mão continua como está. Os
# looks que já existiam não podem parar de ter foto por causa da coluna nova.
def endereco(look: Look) -> str | None:
    if look.image_key:
        return armazenamento.endereco_temporario(look.image_key)

    return look.image_url


# Fábrica única do que a vitrine mostra: o endereço assinado tem de ser resolvido em
# toda tela que devolve look, e esquecer uma deixaria a foto enviada invisível nela.
def para_vitrine(look: Look) -> FeedLookOut:
    saida = FeedLookOut.model_validate(look)
    saida.image_url = endereco(look)

    return saida
