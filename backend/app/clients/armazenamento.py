"""S3 das imagens. O SDK e a credencial moram aqui e não saem desta camada."""

import logging
from typing import Any

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.config import get_settings
from app.core.exceptions import StorageUnavailable

logger = logging.getLogger(__name__)

# Curta de propósito: o endereço vive o tempo de a página carregar a imagem, não o
# tempo de alguém repassar o link.
VALIDADE_SEGUNDOS = 900


def _cliente() -> Any:
    return boto3.client("s3", region_name=get_settings().aws_region)


def guardar(chave: str, conteudo: bytes, tipo: str) -> None:
    bucket = get_settings().s3_bucket

    # Sem bucket a funcionalidade ainda não existe. Dizer isso é melhor que estourar
    # 500 ou fingir que guardou — mesmo padrão dos outros clientes externos.
    if not bucket:
        logger.warning("S3_BUCKET ausente: upload recusado")
        raise StorageUnavailable()

    try:
        _cliente().put_object(Bucket=bucket, Key=chave, Body=conteudo, ContentType=tipo)
    except (BotoCoreError, ClientError) as erro:
        # Erro da biblioteca não sobe: as camadas de cima falam a língua do domínio.
        logger.warning("S3 recusou o upload de %s: %s", chave, erro)
        raise StorageUnavailable() from erro


def endereco_temporario(chave: str) -> str | None:
    bucket = get_settings().s3_bucket

    if not bucket:
        return None

    try:
        return _cliente().generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": chave},
            ExpiresIn=VALIDADE_SEGUNDOS,
        )
    except (BotoCoreError, ClientError) as erro:
        # Leitura falha em silêncio: um card sem foto é melhor que uma página de erro.
        logger.warning("S3 não assinou o endereço de %s: %s", chave, erro)
        return None
