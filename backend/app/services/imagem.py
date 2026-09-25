"""Onde a imagem de um look mora, e como ela vira endereço para a tela."""

import uuid

from app.clients import armazenamento
from app.core.exceptions import ImageTooLarge, InvalidImage
from app.models.look import Look
from app.schemas.feed import FeedLookOut

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
