import hashlib
import logging
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import BackgroundTasks
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.clients.brevo import send_email
from app.config import get_settings
from app.core.exceptions import EmailDeliveryFailed, InvalidResetToken
from app.core.security import hash_password
from app.database import get_engine
from app.models.password_reset import PasswordReset
from app.repositories.password_reset_repository import PasswordResetRepository
from app.repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)


def fingerprint(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def send_reset_email(email: str, token: str) -> None:
    link = f"{get_settings().frontend_reset_url}?token={token}"
    send_email(
        email,
        "Recuperação de senha — VesteAí",
        "<p>Você pediu para redefinir sua senha.</p>"
        f'<p><a href="{link}">Criar uma senha nova</a></p>'
        "<p>O link vale por 1 hora e só pode ser usado uma vez. "
        "Se não foi você, ignore este e-mail.</p>",
    )


# Roda depois da resposta, então a sessão da requisição já fechou: abre a própria
# para invalidar o token que ninguém recebeu — deixá-lo válido é só resíduo.
def deliver(email: str, token: str) -> None:
    try:
        send_reset_email(email, token)
    except EmailDeliveryFailed:
        with Session(get_engine()) as session:
            session.execute(
                update(PasswordReset)
                .where(PasswordReset.token_hash == fingerprint(token))
                .values(used_at=datetime.now(UTC))
            )
            session.commit()

        logger.error("Recuperação de senha indisponível: o e-mail não foi entregue")


class PasswordResetService:
    def __init__(self, users: UserRepository, resets: PasswordResetRepository) -> None:
        self.users = users
        self.resets = resets

    # Responde igual para e-mail existente e inexistente: contar a diferença
    # transformaria o endpoint num verificador de quais contas existem.
    def request(self, email: str, background: BackgroundTasks | None = None) -> None:
        user = self.users.get_by_email(email)

        if user is None:
            return

        self.resets.invalidate_open(user.id)
        self.resets.purge_closed(user.id)

        token = secrets.token_urlsafe(32)
        self.resets.add(
            PasswordReset(
                user_id=user.id,
                token_hash=fingerprint(token),
                expires_at=datetime.now(UTC)
                + timedelta(minutes=get_settings().reset_token_expiration_minutes),
            )
        )

        # A chamada de rede é o maior componente do tempo de resposta; fora dela, a
        # diferença entre e-mail existente e inexistente encolhe para escrita em banco.
        if background is not None:
            background.add_task(deliver, user.email, token)
            return

        deliver(user.email, token)

    def reset(self, token: str, password: str) -> None:
        user_id = self.resets.consume(fingerprint(token))

        if user_id is None:
            raise InvalidResetToken()

        user = self.users.get(user_id)

        if user is None:
            raise InvalidResetToken()

        user.password = hash_password(password)
        # Marca o corte: tudo emitido antes disto deixa de valer.
        user.password_changed_at = datetime.now(UTC)
