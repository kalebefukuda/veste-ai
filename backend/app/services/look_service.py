"""Regras de negócio dos looks. O router não decide nada: só traduz para HTTP."""

import uuid

from app.core.exceptions import LookNotFound, LookWithoutImage, LookWithoutPiece, NotTheOwner
from app.models.look import PUBLICADO, Look, Piece
from app.repositories.look_repository import LookRepository
from app.schemas.look import LookCreate, LookUpdate, PieceCreate


class LookService:
    def __init__(self, looks: LookRepository) -> None:
        self.looks = looks

    def _meu(self, look_id: uuid.UUID, user_id: uuid.UUID) -> Look:
        look = self.looks.get(look_id)

        if look is None:
            raise LookNotFound()

        # RN07: 403 e não 404, porque o look existe — esconder isso seria mentir
        # sobre o estado do sistema para quem já está autenticado.
        if look.user_id != user_id:
            raise NotTheOwner()

        return look

    def create(self, dados: LookCreate, user_id: uuid.UUID) -> Look:
        return self.looks.add(Look(user_id=user_id, **dados.model_dump()))

    def get_mine(self, look_id: uuid.UUID, user_id: uuid.UUID) -> Look:
        return self._meu(look_id, user_id)

    def list_mine(self, user_id: uuid.UUID) -> list[Look]:
        return self.looks.list_by_user(user_id)

    def update(self, look_id: uuid.UUID, dados: LookUpdate, user_id: uuid.UUID) -> Look:
        look = self._meu(look_id, user_id)
        campos = dados.model_dump(exclude_unset=True)

        # A pré-condição de publicar vale enquanto o look estiver publicado, como na
        # remoção da última peça: senão a edição desfaz o que a publicação exigiu.
        if look.status == PUBLICADO and "image_url" in campos and not campos["image_url"]:
            raise LookWithoutImage()

        for campo, valor in campos.items():
            setattr(look, campo, valor)

        return look

    def delete(self, look_id: uuid.UUID, user_id: uuid.UUID) -> None:
        self.looks.delete(self._meu(look_id, user_id))

    def add_piece(self, look_id: uuid.UUID, dados: PieceCreate, user_id: uuid.UUID) -> Piece:
        self._meu(look_id, user_id)
        return self.looks.add_piece(Piece(look_id=look_id, **dados.model_dump()))

    def remove_piece(self, look_id: uuid.UUID, piece_id: uuid.UUID, user_id: uuid.UUID) -> None:
        look = self._meu(look_id, user_id)
        peca = self.looks.get_piece(piece_id)

        if peca is None or peca.look_id != look.id:
            raise LookNotFound()

        # RN04 vale também na remoção: tirar a última peça deixaria um look publicado
        # no ar sem nenhum caminho de compra, que é o que a regra existe para impedir.
        if look.status == PUBLICADO and len(look.pieces) == 1:
            raise LookWithoutPiece()

        self.looks.remove_piece(look, peca)

    def publish(self, look_id: uuid.UUID, user_id: uuid.UUID) -> Look:
        look = self._meu(look_id, user_id)

        if not look.pieces:
            raise LookWithoutPiece()

        if not look.image_url:
            raise LookWithoutImage()

        look.status = PUBLICADO
        return look
