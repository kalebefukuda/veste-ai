"""O perfil público: o feed recortado por quem montou."""

from app.core.exceptions import LookNotFound
from app.models.user import User
from app.repositories.look_repository import LookRepository
from app.repositories.user_repository import UserRepository


class ProfileService:
    def __init__(self, usuarios: UserRepository, looks: LookRepository) -> None:
        self.usuarios = usuarios
        self.looks = looks

    def get(self, username: str) -> tuple[User, list]:
        # Minúscula porque é assim que o handle é guardado — quem digita na URL não
        # sabe disso, e `/@Mariana` tem que achar a mesma pessoa.
        pessoa = self.usuarios.get_by_username(username.lower())

        if pessoa is None:
            raise LookNotFound()

        return pessoa, self.looks.list_published_by_username(username)
