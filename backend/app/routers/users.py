from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserExport, UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
def me(user: Annotated[User, Depends(get_current_user)]) -> UserOut:
    return UserOut.model_validate(user)


@router.patch("/me")
def update_me(
    data: UserUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserOut:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)

    db.flush()

    return UserOut.model_validate(user)


# LGPD art. 18, II e V: acesso e portabilidade. JSON porque o titular precisa poder
# levar o dado para outro lugar, não só olhar na tela.
@router.get("/me/export")
def export_me(user: Annotated[User, Depends(get_current_user)]) -> UserExport:
    return UserExport.model_validate(user)


# LGPD art. 18, VI. Os tokens de recuperação vão junto pelo ON DELETE CASCADE da FK:
# deixá-los apontando para um titular que pediu para sumir seria retenção indevida.
@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    UserRepository(db).delete(user)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
