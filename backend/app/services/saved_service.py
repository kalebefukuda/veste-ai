"""RN02: só autenticado salva favorito, e só do que está publicado."""

import uuid

from app.core.exceptions import LookNotFound
from app.models.look import Look
from app.repositories.saved_repository import SavedRepository


class SavedService:
    def __init__(self, salvos: SavedRepository) -> None:
        self.salvos = salvos

    def save(self, look_id: uuid.UUID, user_id: uuid.UUID) -> None:
        # Rascunho não está no feed: guardar o endereço de algo que a pessoa não
        # consegue abrir seria salvar um link morto.
        if self.salvos.get_publicado(look_id) is None:
            raise LookNotFound()

        # O coração é interruptor: o segundo toque não vira erro nem linha repetida.
        # Quem garante isso é o `ON CONFLICT` do insert, não uma conferência antes —
        # entre conferir e inserir cabe outra requisição.
        self.salvos.save(user_id, look_id)

    def unsave(self, look_id: uuid.UUID, user_id: uuid.UUID) -> None:
        # Desfazer o que não estava salvo chega no mesmo estado, então não é erro.
        self.salvos.unsave(user_id, look_id)

    def list_mine(self, user_id: uuid.UUID) -> list[Look]:
        return self.salvos.list_by_user(user_id)

    def ids_mine(self, user_id: uuid.UUID) -> list[uuid.UUID]:
        return self.salvos.list_ids(user_id)
