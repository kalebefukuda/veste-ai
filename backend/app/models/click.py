import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Click(Base):
    __tablename__ = "clicks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    # Nulável e `SET NULL`: a peça pode sair do look, e o clique que ela recebeu
    # continua sendo parte do histórico — ADR-0022.
    piece_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("pieces.id", ondelete="SET NULL")
    )
    # O look vai junto da peça justamente por isso: o total não pode depender de uma
    # peça que saiu dele depois.
    look_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("looks.id", ondelete="CASCADE")
    )
    # Existe desde a 0001 e segue vazia de propósito — ADR-0022.
    ip_hash: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()")
    )
