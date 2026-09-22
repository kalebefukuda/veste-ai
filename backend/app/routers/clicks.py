import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.exceptions import DomainHTTPException, LookNotFound
from app.database import get_db
from app.repositories.look_repository import LookRepository
from app.schemas.click import ClickOut
from app.services.click_service import ClickService

router = APIRouter(prefix="/clicks", tags=["clicks"])


def get_click_service(db: Annotated[Session, Depends(get_db)]) -> ClickService:
    return ClickService(LookRepository(db))


Servico = Annotated[ClickService, Depends(get_click_service)]
# RN03: comprar não exige conta, então contar o clique também não pode exigir.


@router.post("/{piece_id}", status_code=status.HTTP_201_CREATED)
def registrar(piece_id: uuid.UUID, service: Servico) -> ClickOut:
    try:
        return ClickOut(purchase_url=service.register(piece_id).purchase_url)
    except LookNotFound as erro:
        raise DomainHTTPException(status.HTTP_404_NOT_FOUND, erro) from erro
