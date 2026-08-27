import uuid

from app.core.exceptions import EmailAlreadyRegistered, InvalidCredentials
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate


class AuthService:
    def __init__(self, users: UserRepository) -> None:
        self.users = users

    def register(self, data: UserCreate) -> User:
        if self.users.get_by_email(data.email):
            raise EmailAlreadyRegistered()

        return self.users.add(
            User(name=data.name, email=data.email, password=hash_password(data.password))
        )

    # Falha igual para e-mail inexistente e senha errada: distinguir os dois revela
    # quais e-mails estão cadastrados.
    def login(self, email: str, password: str) -> str:
        user = self.users.get_by_email(email)

        if user is None or not verify_password(password, user.password):
            raise InvalidCredentials()

        return create_access_token(user.id)

    def get_authenticated(self, user_id: uuid.UUID) -> User:
        user = self.users.get(user_id)

        if user is None:
            raise InvalidCredentials()

        return user
