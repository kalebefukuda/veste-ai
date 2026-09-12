import uuid

from sqlalchemy import or_, select
from sqlalchemy.orm import Session, contains_eager

from app.models.look import PUBLICADO, Look, Piece
from app.models.user import User


class LookRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get(self, look_id: uuid.UUID) -> Look | None:
        return self.db.get(Look, look_id)

    def list_by_user(self, user_id: uuid.UUID) -> list[Look]:
        consulta = select(Look).where(Look.user_id == user_id).order_by(Look.created_at.desc())
        return list(self.db.execute(consulta).scalars())

    # O join com users é sempre válido — todo look tem dono — então ele entra fixo e
    # `contains_eager` aproveita a linha já trazida. Sem isso, listar N looks dispara
    # N consultas de usuário só para escrever o nome no card.
    def _publicados(self):  # noqa: ANN202 — Select tipado polui mais do que esclarece
        return (
            select(Look)
            .join(Look.creator)
            .where(Look.status == PUBLICADO)
            .options(contains_eager(Look.creator))
        )

    def list_published(
        self,
        limit: int,
        offset: int,
        busca: str | None = None,
        categoria: str | None = None,
    ) -> list[Look]:
        consulta = self._publicados()

        # Título e nome de quem montou: é o que a pessoa lembra na hora de procurar.
        if busca:
            termo = f"%{busca}%"
            consulta = consulta.where(or_(Look.title.ilike(termo), User.name.ilike(termo)))

        if categoria:
            consulta = consulta.where(Look.category == categoria)

        consulta = consulta.order_by(Look.created_at.desc()).limit(limit).offset(offset)

        return list(self.db.execute(consulta).unique().scalars())

    def get_published(self, look_id: uuid.UUID) -> Look | None:
        consulta = self._publicados().where(Look.id == look_id)

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
