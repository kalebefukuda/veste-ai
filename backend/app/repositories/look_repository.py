import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.look import PUBLICADO, Look, Piece


class LookRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get(self, look_id: uuid.UUID) -> Look | None:
        return self.db.get(Look, look_id)

    def list_by_user(self, user_id: uuid.UUID) -> list[Look]:
        consulta = select(Look).where(Look.user_id == user_id).order_by(Look.created_at.desc())
        return list(self.db.execute(consulta).scalars())

    # `joinedload` porque o feed mostra o nome de quem montou em todo card: sem
    # ele, listar N looks dispara N consultas de usuário.
    def list_published(self, limit: int, offset: int) -> list[Look]:
        consulta = (
            select(Look)
            .where(Look.status == PUBLICADO)
            .order_by(Look.created_at.desc())
            .limit(limit)
            .offset(offset)
            .options(joinedload(Look.creator))
        )
        return list(self.db.execute(consulta).unique().scalars())

    def get_published(self, look_id: uuid.UUID) -> Look | None:
        consulta = (
            select(Look)
            .where(Look.id == look_id, Look.status == PUBLICADO)
            .options(joinedload(Look.creator))
        )
        return self.db.execute(consulta).unique().scalar_one_or_none()

    def add(self, look: Look) -> Look:
        self.db.add(look)
        self.db.flush()
        self.db.refresh(look)
        return look

    def add_piece(self, piece: Piece) -> Piece:
        self.db.add(piece)
        self.db.flush()
        self.db.refresh(piece)
        return piece

    def get_piece(self, piece_id: uuid.UUID) -> Piece | None:
        return self.db.get(Piece, piece_id)

    def delete(self, look: Look) -> None:
        self.db.delete(look)
        self.db.flush()

    # Pela relação, não por `db.delete`: com `delete-orphan` é isso que mantém a
    # coleção já carregada do look em dia. Apagar o filho direto deixaria a peça
    # removida ainda aparecendo na leitura seguinte, dentro da mesma sessão.
    def remove_piece(self, look: Look, piece: Piece) -> None:
        look.pieces.remove(piece)
        self.db.flush()
