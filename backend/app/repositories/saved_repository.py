import uuid

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, contains_eager

from app.models.look import PUBLICADO, Look
from app.models.saved_look import SavedLook


class SavedRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_publicado(self, look_id: uuid.UUID) -> Look | None:
        consulta = select(Look).where(Look.id == look_id, Look.status == PUBLICADO)
        return self.db.execute(consulta).scalar_one_or_none()

    def esta_salvo(self, user_id: uuid.UUID, look_id: uuid.UUID) -> bool:
        consulta = select(SavedLook.id).where(
            SavedLook.user_id == user_id, SavedLook.look_id == look_id
        )
        return self.db.execute(consulta).first() is not None

    def save(self, user_id: uuid.UUID, look_id: uuid.UUID) -> None:
        self.db.add(SavedLook(user_id=user_id, look_id=look_id))
        self.db.flush()

    def unsave(self, user_id: uuid.UUID, look_id: uuid.UUID) -> None:
        comando = delete(SavedLook).where(
            SavedLook.user_id == user_id, SavedLook.look_id == look_id
        )
        self.db.execute(comando)
        self.db.flush()

    # O look inteiro, com quem montou, porque a tela de salvos é uma vitrine como o
    # feed — e a coleção é a mesma.
    def list_by_user(self, user_id: uuid.UUID) -> list[Look]:
        consulta = (
            select(Look)
            .join(SavedLook, SavedLook.look_id == Look.id)
            .join(Look.creator)
            .where(SavedLook.user_id == user_id, Look.status == PUBLICADO)
            .options(contains_eager(Look.creator))
            .order_by(SavedLook.created_at.desc())
        )
        return list(self.db.execute(consulta).unique().scalars())

    # Só os ids: é o que a tela precisa para saber quais corações estão preenchidos,
    # sem carregar look nenhum — ADR-0023.
    def list_ids(self, user_id: uuid.UUID) -> list[uuid.UUID]:
        consulta = (
            select(SavedLook.look_id)
            .join(Look, Look.id == SavedLook.look_id)
            .where(SavedLook.user_id == user_id, Look.status == PUBLICADO)
            .order_by(SavedLook.created_at.desc())
        )
        return list(self.db.execute(consulta).scalars())
