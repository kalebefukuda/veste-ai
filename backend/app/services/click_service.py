"""RN08 e RN09: o clique conta ao levar para a loja, e a métrica é só de quem montou."""

import uuid

from app.core.exceptions import LookNotFound, NotTheOwner
from app.models.click import Click
from app.models.look import Look, Piece
from app.repositories.look_repository import LookRepository


class ClickService:
    def __init__(self, looks: LookRepository) -> None:
        self.looks = looks

    # Devolve o destino no mesmo ato de contar: é o que amarra o contador ao
    # redirecionamento, em vez de medir quem só passou o mouse.
    def register(self, piece_id: uuid.UUID) -> Piece:
        peca = self.looks.get_piece_publicada(piece_id)

        # Rascunho responde igual a inexistente, como no feed: distinguir os dois
        # entregaria a quem varre a API que aquele id é um look em preparo.
        if peca is None:
            raise LookNotFound()

        self.looks.add_click(Click(piece_id=peca.id, look_id=peca.look_id))

        return peca

    def metrics(self, look_id: uuid.UUID, user_id: uuid.UUID) -> tuple[Look, dict, int]:
        look = self.looks.get(look_id)

        if look is None:
            raise LookNotFound()

        # RN09: 403 e não 404 — o look existe, e quem já está autenticado merece
        # saber que a recusa é de permissão, não de existência.
        if look.user_id != user_id:
            raise NotTheOwner()

        return look, self.looks.count_clicks(look.id), self.looks.total_clicks(look.id)
