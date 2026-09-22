import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.execute(select(User).where(User.email == email)).scalar_one_or_none()

    # O handle é guardado em minúscula; quem chama já normaliza, e a comparação aqui
    # é exata para aproveitar o índice único da coluna.
    def get_by_username(self, username: str) -> User | None:
        consulta = select(User).where(User.username == username)
        return self.db.execute(consulta).scalar_one_or_none()

    def get(self, user_id: uuid.UUID) -> User | None:
        return self.db.get(User, user_id)

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.flush()

    def add(self, user: User) -> User:
        self.db.add(user)
        self.db.flush()
        self.db.refresh(user)
        return user
