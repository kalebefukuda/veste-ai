"""O perfil público: o feed recortado por quem montou."""

from app.core.exceptions import ProfileNotFound
from app.models.user import User
from app.repositories.look_repository import LookRepository
from app.repositories.user_repository import UserRepository


class ProfileService:
    def __init__(self, usuarios: UserRepository, looks: LookRepository) -> None:
        self.usuarios = usuarios
        self.looks = looks

    def get(
        self, username: str, page: int, per_page: int
    ) -> tuple[User, list, int | None]:
        # Minúscula porque é assim que o handle é guardado — quem digita na URL não
        # sabe disso, e `/@Mariana` tem que achar a mesma pessoa.
        pessoa = self.usuarios.get_by_username(username.lower())

        # Erro próprio, e não o do look: o código de erro é contrato, e dizer
        # LOOK_NOT_FOUND quando quem falta é a pessoa mente sobre o que aconteceu.
        if pessoa is None:
            raise ProfileNotFound()

        # Mesmo truque do feed: busca um a mais que o pedido para saber se há próxima
        # sem varrer a coleção com um count.
        achados = self.looks.list_published_by_username(
            username, limit=per_page + 1, offset=(page - 1) * per_page
        )
        tem_mais = len(achados) > per_page

        return pessoa, achados[:per_page], page + 1 if tem_mais else None
