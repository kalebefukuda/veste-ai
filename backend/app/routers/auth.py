from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_auth_service
from app.core.exceptions import (
    DomainHTTPException,
    EmailAlreadyRegistered,
    InvalidCredentials,
)
from app.schemas.user import LoginIn, TokenOut, UserCreate, UserOut
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserOut)
def register(
    data: UserCreate,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> UserOut:
    try:
        return UserOut.model_validate(service.register(data))
    except EmailAlreadyRegistered as error:
        raise DomainHTTPException(status.HTTP_409_CONFLICT, error) from error


@router.post("/login", response_model=TokenOut)
def login(
    data: LoginIn,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> TokenOut:
    try:
        return TokenOut(access_token=service.login(data.email, data.password))
    except InvalidCredentials as error:
        raise DomainHTTPException(status.HTTP_401_UNAUTHORIZED, error) from error
