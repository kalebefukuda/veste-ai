import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.look import PieceOut


# Só o que a vitrine mostra. `email` fica de fora de propósito: o feed é público e
# endereço de e-mail não é dado de exposição.
class FeedCreator(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    username: str | None = None
    avatar: str | None = None


class FeedLookOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None = None
    image_url: str | None = None
    created_at: datetime
    creator: FeedCreator
    pieces: list[PieceOut] = []


# `next_page` em vez de total: contar a tabela inteira a cada requisição custa caro e
# não muda o que a tela faz, que é só decidir se ainda há o que carregar.
class FeedPage(BaseModel):
    items: list[FeedLookOut]
    next_page: int | None = None
