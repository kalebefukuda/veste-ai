from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_auth_service, get_password_reset_service
from app.core.exceptions import (
    DomainHTTPException,
    EmailAlreadyRegistered,
    InvalidCredentials,
    InvalidResetToken,
)
from app.schemas.user import (
    ForgotPasswordIn,
    LoginIn,
    ResetPasswordIn,
    TokenOut,
    UserCreate,
    UserOut,
)
from app.services.auth_service import AuthService
from app.services.password_reset_service import PasswordResetService

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


# 202 sempre, sem dizer se o e-mail existe — ver PasswordResetService.request.
@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(
    data: ForgotPasswordIn,
    service: Annotated[PasswordResetService, Depends(get_password_reset_service)],
) -> dict[str, str]:
    service.request(data.email)

    return {"detail": "Se houver uma conta com este e-mail, enviamos um link de recuperação"}


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(
    data: ResetPasswordIn,
    service: Annotated[PasswordResetService, Depends(get_password_reset_service)],
) -> None:
    try:
        service.reset(data.token, data.password)
    except InvalidResetToken as error:
        raise DomainHTTPException(status.HTTP_400_BAD_REQUEST, error) from error
