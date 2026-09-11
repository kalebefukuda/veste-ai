import uuid
from datetime import datetime
from decimal import Decimal
from typing import Annotated
from urllib.parse import urlparse

from pydantic import AfterValidator, BaseModel, ConfigDict, Field

# RN06 diz que a validade comercial do link é do creator — mas endereço que não é
# http(s) não leva a loja nenhuma. Recusar `javascript:` e `data:` não é julgar a
# oferta: é impedir que o feed vire vetor de execução no navegador de quem clica.
ESQUEMAS = {"http", "https"}


def _link_de_loja(valor: str) -> str:
    partes = urlparse(valor)

    if partes.scheme not in ESQUEMAS or not partes.netloc:
        raise ValueError("O link de compra precisa começar com http:// ou https://")

    return valor


LinkDeCompra = Annotated[str, AfterValidator(_link_de_loja)]


class PieceCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=2, max_length=200)
    purchase_url: LinkDeCompra
    store: str | None = Field(default=None, max_length=100)
    price: Decimal | None = Field(default=None, ge=0, le=Decimal("99999999.99"))
    image_url: LinkDeCompra | None = None


class PieceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    purchase_url: str
    store: str | None = None
    price: Decimal | None = None
    image_url: str | None = None


class LookCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=2, max_length=200)
    description: str | None = Field(default=None, max_length=2000)


class LookUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    image_url: LinkDeCompra | None = None


class LookOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None = None
    image_url: str | None = None
    ai_generated: bool
    status: str
    created_at: datetime
    pieces: list[PieceOut] = []
