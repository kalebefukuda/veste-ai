import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password: Mapped[str] = mapped_column(Text)
    plan: Mapped[str] = mapped_column(String(20), server_default="free")
    # Endereço público da pessoa. Guardado sempre em minúscula: `Mariana` e `mariana`
    # convivendo seriam dois perfis e ninguém saberia qual digitar.
    username: Mapped[str | None] = mapped_column(String(30), unique=True, index=True)
    avatar: Mapped[str | None] = mapped_column(Text)
    bio: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    # Nulo é "ainda não passou pelo funil". Limpar de volta para nulo é o que
    # permite rever o onboarding depois, por escolha da pessoa.
    onboarded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    intent: Mapped[str | None] = mapped_column(String(20))
    # Token emitido antes desta marca é recusado: é o que permite invalidar sessão
    # antiga na troca de senha sem abandonar o JWT stateless.
    password_changed_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
