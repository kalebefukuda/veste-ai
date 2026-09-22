from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.exceptions import DomainHTTPException, LookNotFound
from app.database import get_db
from app.repositories.look_repository import LookRepository
from app.repositories.user_repository import UserRepository
from app.schemas.feed import FeedLookOut
from app.schemas.profile import ProfileOut
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/profiles", tags=["profiles"])


def get_profile_service(db: Annotated[Session, Depends(get_db)]) -> ProfileService:
    return ProfileService(UserRepository(db), LookRepository(db))


Servico = Annotated[ProfileService, Depends(get_profile_service)]
# RN03: o perfil é o feed recortado por pessoa, e o feed é público.


@router.get("/{username}")
def perfil(username: str, service: Servico) -> ProfileOut:
    try:
        pessoa, looks = service.get(username)
    except LookNotFound as erro:
        raise DomainHTTPException(status.HTTP_404_NOT_FOUND, erro) from erro

    return ProfileOut(
        name=pessoa.name,
        username=pessoa.username or "",
        avatar=pessoa.avatar,
        bio=pessoa.bio,
        looks=[FeedLookOut.model_validate(look) for look in looks],
    )
