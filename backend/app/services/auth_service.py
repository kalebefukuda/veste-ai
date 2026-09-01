import uuid

from app.core.exceptions import EmailAlreadyRegistered, InvalidCredentials
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate

# Hash descartável, comparado quando o e-mail não existe, só para o bcrypt rodar.
DUMMY_HASH = hash_password("nao-e-a-senha-de-ninguem")


class AuthService:
    def __init__(self, users: UserRepository) -> None:
        self.users = users

    def register(self, data: UserCreate) -> User:
        if self.users.get_by_email(data.email):
            raise EmailAlreadyRegistered()

        return self.users.add(
            User(name=data.name, email=data.email, password=hash_password(data.password))
        )

    # Falha igual para e-mail inexistente e senha errada, e no mesmo tempo: o bcrypt
    # é lento de propósito, então pular a verificação revelaria que a conta não existe.
    def login(self, email: str, password: str) -> str:
        user = self.users.get_by_email(email)
        stored = user.password if user else DUMMY_HASH

        if not verify_password(password, stored) or user is None:
            raise InvalidCredentials()

        return create_access_token(user.id)

    def get_authenticated(self, user_id: uuid.UUID) -> User:
        user = self.users.get(user_id)

        if user is None:
            raise InvalidCredentials()

        return user
