from pydantic import BaseModel, ConfigDict

from app.schemas.feed import FeedLookOut


# O handle é endereço público; o e-mail não. Este schema existe para essa fronteira
# ficar explícita em vez de depender de lembrar de excluir campo.
class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    username: str
    avatar: str | None = None
    bio: str | None = None
    looks: list[FeedLookOut] = []
    # Mesma forma do feed: a tela decide se ainda há o que carregar sem receber total.
    next_page: int | None = None
