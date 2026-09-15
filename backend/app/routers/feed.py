import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.exceptions import DomainHTTPException, LookNotFound
from app.database import get_db
from app.repositories.look_repository import LookRepository
from app.schemas.feed import FeedLookOut, FeedPage
from app.schemas.look import Categoria
from app.services.feed_service import FeedService

router = APIRouter(prefix="/feed", tags=["feed"])

POR_PAGINA = 12


def get_feed_service(db: Annotated[Session, Depends(get_db)]) -> FeedService:
    return FeedService(LookRepository(db))


Servico = Annotated[FeedService, Depends(get_feed_service)]
# RN03: nenhuma rota daqui pede sessão. É a única parte da API que é assim.


@router.get("")
def listar(
    service: Servico,
    page: Annotated[int, Query(ge=1)] = 1,
    per_page: Annotated[int, Query(ge=1, le=50)] = POR_PAGINA,
    q: Annotated[str | None, Query(max_length=100)] = None,
    categoria: Annotated[Categoria | None, Query()] = None,
) -> FeedPage:
    looks, proxima = service.page(page, per_page, q, categoria)

    return FeedPage(
        items=[FeedLookOut.model_validate(look) for look in looks],
        next_page=proxima,
    )


@router.get("/{look_id}")
def detalhe(look_id: uuid.UUID, service: Servico) -> FeedLookOut:
    try:
        return FeedLookOut.model_validate(service.look(look_id))
    except LookNotFound as erro:
        raise DomainHTTPException(status.HTTP_404_NOT_FOUND, erro) from erro
