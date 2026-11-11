import uuid

from pydantic import BaseModel, ConfigDict


# A rota devolve o destino porque contar e redirecionar são o mesmo ato: contador que
# dispara sem levar a lugar nenhum mede intenção, não clique — RN08.
class ClickOut(BaseModel):
    purchase_url: str


class PieceMetrics(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    clicks: int


class LookMetrics(BaseModel):
    clicks: int
    pieces: list[PieceMetrics]
