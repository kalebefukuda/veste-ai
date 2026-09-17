import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.exceptions import DomainHTTPException, LookNotFound
from app.database import get_db
from app.models.user import User
from app.repositories.saved_repository import SavedRepository
from app.schemas.feed import FeedLookOut
from app.services.saved_service import SavedService

router = APIRouter(prefix="/saved", tags=["saved"])


def get_saved_service(db: Annotated[Session, Depends(get_db)]) -> SavedService:
    return SavedService(SavedRepository(db))


Servico = Annotated[SavedService, Depends(get_saved_service)]
# RN02: toda rota daqui exige sessão. Favorito é de alguém, por definição.
Autenticado = Annotated[User, Depends(get_current_user)]


@router.get("")
def listar(user: Autenticado, service: Servico) -> list[FeedLookOut]:
    return [FeedLookOut.model_validate(look) for look in service.list_mine(user.id)]


# Só os ids, para a vitrine saber quais corações preencher sem que o feed precise de
# sessão — ADR-0023.
@router.get("/ids")
def ids(user: Autenticado, service: Servico) -> list[uuid.UUID]:
    return service.ids_mine(user.id)


@router.post("/{look_id}", status_code=status.HTTP_201_CREATED)
def salvar(look_id: uuid.UUID, user: Autenticado, service: Servico) -> Response:
    try:
        service.save(look_id, user.id)
    except LookNotFound as erro:
        raise DomainHTTPException(status.HTTP_404_NOT_FOUND, erro) from erro

    return Response(status_code=status.HTTP_201_CREATED)


@router.delete("/{look_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover(look_id: uuid.UUID, user: Autenticado, service: Servico) -> Response:
    service.unsave(look_id, user.id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
