import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.exceptions import (
    DomainHTTPException,
    LookNotFound,
    LookWithoutImage,
    LookWithoutPiece,
    NotTheOwner,
)
from app.database import get_db
from app.models.user import User
from app.repositories.look_repository import LookRepository
from app.schemas.look import LookCreate, LookOut, LookUpdate, PieceCreate, PieceOut
from app.services.look_service import LookService

router = APIRouter(prefix="/looks", tags=["looks"])


def get_look_service(db: Annotated[Session, Depends(get_db)]) -> LookService:
    return LookService(LookRepository(db))


Servico = Annotated[LookService, Depends(get_look_service)]
# RN01: toda rota daqui exige sessão. O feed público entra em rotas próprias.
Autenticado = Annotated[User, Depends(get_current_user)]


# Único ponto que traduz regra de domínio em HTTP; o serviço não conhece status code.
def _http(erro: Exception) -> DomainHTTPException:
    if isinstance(erro, LookNotFound):
        return DomainHTTPException(status.HTTP_404_NOT_FOUND, erro)
    if isinstance(erro, NotTheOwner):
        return DomainHTTPException(status.HTTP_403_FORBIDDEN, erro)
    return DomainHTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, erro)


@router.post("", status_code=status.HTTP_201_CREATED)
def criar(dados: LookCreate, user: Autenticado, service: Servico) -> LookOut:
    return LookOut.model_validate(service.create(dados, user.id))


@router.get("")
def listar(user: Autenticado, service: Servico) -> list[LookOut]:
    return [LookOut.model_validate(look) for look in service.list_mine(user.id)]


@router.get("/{look_id}")
def detalhe(look_id: uuid.UUID, user: Autenticado, service: Servico) -> LookOut:
    try:
        return LookOut.model_validate(service.get_mine(look_id, user.id))
    except (LookNotFound, NotTheOwner) as erro:
        raise _http(erro) from erro


@router.patch("/{look_id}")
def editar(
    look_id: uuid.UUID, dados: LookUpdate, user: Autenticado, service: Servico
) -> LookOut:
    try:
        return LookOut.model_validate(service.update(look_id, dados, user.id))
    except (LookNotFound, NotTheOwner, LookWithoutImage) as erro:
        raise _http(erro) from erro


@router.delete("/{look_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover(look_id: uuid.UUID, user: Autenticado, service: Servico) -> Response:
    try:
        service.delete(look_id, user.id)
    except (LookNotFound, NotTheOwner) as erro:
        raise _http(erro) from erro

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{look_id}/pieces", status_code=status.HTTP_201_CREATED)
def adicionar_peca(
    look_id: uuid.UUID, dados: PieceCreate, user: Autenticado, service: Servico
) -> PieceOut:
    try:
        return PieceOut.model_validate(service.add_piece(look_id, dados, user.id))
    except (LookNotFound, NotTheOwner) as erro:
        raise _http(erro) from erro


@router.delete("/{look_id}/pieces/{piece_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_peca(
    look_id: uuid.UUID, piece_id: uuid.UUID, user: Autenticado, service: Servico
) -> Response:
    try:
        service.remove_piece(look_id, piece_id, user.id)
    except (LookNotFound, NotTheOwner, LookWithoutPiece) as erro:
        raise _http(erro) from erro

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{look_id}/publish")
def publicar(look_id: uuid.UUID, user: Autenticado, service: Servico) -> LookOut:
    try:
        return LookOut.model_validate(service.publish(look_id, user.id))
    except (LookNotFound, NotTheOwner, LookWithoutPiece, LookWithoutImage) as erro:
        raise _http(erro) from erro
