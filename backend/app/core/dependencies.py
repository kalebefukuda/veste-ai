import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import InvalidCredentials
from app.core.security import read_claims
from app.database import get_db
from app.models.user import User
from app.repositories.password_reset_repository import PasswordResetRepository
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.password_reset_service import PasswordResetService

bearer = HTTPBearer(auto_error=False)


def get_auth_service(db: Annotated[Session, Depends(get_db)]) -> AuthService:
    return AuthService(UserRepository(db))


def get_password_reset_service(
    db: Annotated[Session, Depends(get_db)],
) -> PasswordResetService:
    return PasswordResetService(UserRepository(db), PasswordResetRepository(db))


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Faça login para continuar",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    claims = read_claims(credentials.credentials)

    if claims is None or "sub" not in claims:
        raise unauthorized

    # Só os erros de autenticação viram 401. Falha de banco ou bug precisa subir
    # como 500, senão o usuário tenta logar de novo enquanto o problema é outro.
    try:
        user = service.get_authenticated(uuid.UUID(str(claims["sub"])))
    except (ValueError, InvalidCredentials) as error:
        raise unauthorized from error

    # Token emitido antes da última troca de senha morre aqui. A leitura do usuário
    # já acontecia, então a revogação não custa consulta nova.
    issued_at = claims.get("iat")

    if issued_at is not None and float(issued_at) < user.password_changed_at.timestamp():
        raise unauthorized

    return user
