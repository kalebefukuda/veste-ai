import uuid
from datetime import UTC, datetime

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models.password_reset import PasswordReset


class PasswordResetRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_usable(self, token_hash: str) -> PasswordReset | None:
        return self.db.execute(
            select(PasswordReset).where(
                PasswordReset.token_hash == token_hash,
                PasswordReset.used_at.is_(None),
                PasswordReset.expires_at > datetime.now(UTC),
            )
        ).scalar_one_or_none()

    def invalidate_open(self, user_id: uuid.UUID) -> None:
        self.db.execute(
            update(PasswordReset)
            .where(PasswordReset.user_id == user_id, PasswordReset.used_at.is_(None))
            .values(used_at=datetime.now(UTC))
        )

    def add(self, reset: PasswordReset) -> PasswordReset:
        self.db.add(reset)
        self.db.flush()
        return reset

    def mark_used(self, reset: PasswordReset) -> None:
        reset.used_at = datetime.now(UTC)
        self.db.flush()
