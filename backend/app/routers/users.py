from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.exceptions import DomainHTTPException, UsernameAlreadyTaken
from app.core.rate_limit import LIMIT_DELETE_ACCOUNT, limiter
from app.core.security import verify_password
from app.database import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import DeleteMeIn, UserExport, UserOut, UserUpdate

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

    try:
        db.flush()
    except IntegrityError as error:
        # Só o handle tem unicidade neste PATCH; o e-mail não passa por aqui.
        db.rollback()
        raise DomainHTTPException(
            status.HTTP_409_CONFLICT, UsernameAlreadyTaken()
        ) from error

    return UserOut.model_validate(user)


# LGPD art. 18, II e V: acesso e portabilidade. JSON porque o titular precisa poder
# levar o dado para outro lugar, não só olhar na tela.
@router.get("/me/export")
def export_me(user: Annotated[User, Depends(get_current_user)]) -> UserExport:
    return UserExport.model_validate(user)


# LGPD art. 18, VI. Os tokens de recuperação vão junto pelo ON DELETE CASCADE da FK:
# deixá-los apontando para um titular que pediu para sumir seria retenção indevida.
# A senha é exigida porque a sessão dura 24h: sem ela, quem passar na frente de um
# teclado destravado apaga a conta de outro sem volta.
@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit(LIMIT_DELETE_ACCOUNT)
def delete_me(
    request: Request,
    data: DeleteMeIn,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    if not verify_password(data.password, user.password):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Senha incorreta")

    UserRepository(db).delete(user)

    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Pular e concluir marcam a mesma coisa: quem pulou não pode levar o funil de novo
# em cada login, senão "pular por agora" vira "pular até recarregar".
@router.post("/me/onboarding")
def marcar_onboarding(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserOut:
    if user.onboarded_at is None:
        user.onboarded_at = datetime.now(UTC)
        db.flush()

    return UserOut.model_validate(user)


# A outra metade da liberdade: rever depois. Volta a coluna para nulo, e o funil
# reaparece por escolha de quem pediu.
@router.delete("/me/onboarding")
def limpar_onboarding(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserOut:
    user.onboarded_at = None
    db.flush()

    return UserOut.model_validate(user)
