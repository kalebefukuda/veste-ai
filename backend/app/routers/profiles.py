from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.exceptions import DomainHTTPException, ProfileNotFound
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


POR_PAGINA = 12


@router.get("/{username}")
def perfil(
    username: str,
    service: Servico,
    page: Annotated[int, Query(ge=1)] = 1,
    per_page: Annotated[int, Query(ge=1, le=50)] = POR_PAGINA,
) -> ProfileOut:
    try:
        pessoa, looks, proxima = service.get(username, page, per_page)
    except ProfileNotFound as erro:
        raise DomainHTTPException(status.HTTP_404_NOT_FOUND, erro) from erro

    return ProfileOut(
        name=pessoa.name,
        username=pessoa.username or "",
        avatar=pessoa.avatar,
        bio=pessoa.bio,
        looks=[FeedLookOut.model_validate(look) for look in looks],
        next_page=proxima,
    )
