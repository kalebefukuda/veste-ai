import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.user import User

PUBLICADO = "published"


class Look(Base):
    __tablename__ = "looks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    # Nulável: rascunho sem imagem existe, publicado sem imagem não — ADR-0019.
    image_url: Mapped[str | None] = mapped_column(Text)
    ai_generated: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    status: Mapped[str] = mapped_column(String(20), server_default="draft")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()")
    )

    # Sem `lazy` ansioso: só o feed precisa de quem montou, e ele carrega por
    # `joinedload` na própria consulta.
    creator: Mapped["User"] = relationship()

    # `lazy="selectin"` porque toda leitura de look mostra as peças: sem isso, listar
    # N looks dispara N consultas de peça.
    pieces: Mapped[list["Piece"]] = relationship(
        back_populates="look",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="Piece.created_at",
    )


class Piece(Base):
    __tablename__ = "pieces"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    look_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("looks.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(200))
    store: Mapped[str | None] = mapped_column(String(100))
    price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    purchase_url: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()")
    )

    look: Mapped["Look"] = relationship(back_populates="pieces")
