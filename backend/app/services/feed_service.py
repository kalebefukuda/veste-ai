"""Leitura pública dos looks. Nada aqui depende de sessão — é a RN03 em código."""

import uuid

from app.core.exceptions import LookNotFound
from app.models.look import Look
from app.repositories.look_repository import LookRepository


class FeedService:
    def __init__(self, looks: LookRepository) -> None:
        self.looks = looks

    def page(self, page: int, per_page: int) -> tuple[list[Look], int | None]:
        # Busca um a mais que o pedido: é o que responde "tem próxima?" sem varrer a
        # tabela inteira com um count a cada página.
        achados = self.looks.list_published(limit=per_page + 1, offset=(page - 1) * per_page)
        tem_mais = len(achados) > per_page

        return achados[:per_page], page + 1 if tem_mais else None

    def look(self, look_id: uuid.UUID) -> Look:
        look = self.looks.get_published(look_id)

        # Rascunho responde igual a inexistente: dizer "existe, mas não é público"
        # entregaria a quem varre a API que aquele id é um look em preparo.
        if look is None:
            raise LookNotFound()

        return look
