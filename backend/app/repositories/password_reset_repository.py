import uuid
from datetime import UTC, datetime

from sqlalchemy import delete, update
from sqlalchemy.orm import Session

from app.models.password_reset import PasswordReset


class PasswordResetRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    # Marca e devolve num único UPDATE condicional. Ler e depois marcar deixaria duas
    # requisições simultâneas passarem pela mesma janela e redefinirem a senha as duas.
    def consume(self, token_hash: str) -> uuid.UUID | None:
        consumed = self.db.execute(
            update(PasswordReset)
            .where(
                PasswordReset.token_hash == token_hash,
                PasswordReset.used_at.is_(None),
                PasswordReset.expires_at > datetime.now(UTC),
            )
            .values(used_at=datetime.now(UTC))
            .returning(PasswordReset.user_id)
        ).scalar_one_or_none()

        return consumed

    def invalidate_open(self, user_id: uuid.UUID) -> None:
        self.db.execute(
            update(PasswordReset)
            .where(PasswordReset.user_id == user_id, PasswordReset.used_at.is_(None))
            .values(used_at=datetime.now(UTC))
        )

    # Sem isto a tabela só cresce: token usado ou vencido nunca teria fim.
    def purge_closed(self, user_id: uuid.UUID) -> None:
        self.db.execute(
            delete(PasswordReset).where(
                PasswordReset.user_id == user_id,
                PasswordReset.used_at.is_not(None),
            )
        )

    def add(self, reset: PasswordReset) -> PasswordReset:
        self.db.add(reset)
        self.db.flush()
        return reset
