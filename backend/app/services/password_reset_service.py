import hashlib
import logging
import secrets
from datetime import UTC, datetime, timedelta

from app.clients.brevo import send_email
from app.config import get_settings
from app.core.exceptions import EmailDeliveryFailed, InvalidResetToken
from app.core.security import hash_password
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


class PasswordResetService:
    def __init__(self, users: UserRepository, resets: PasswordResetRepository) -> None:
        self.users = users
        self.resets = resets

    # Responde igual para e-mail existente e inexistente: contar a diferença
    # transformaria o endpoint num verificador de quais contas existem.
    def request(self, email: str) -> None:
        user = self.users.get_by_email(email)

        if user is None:
            return

        self.resets.invalidate_open(user.id)

        token = secrets.token_urlsafe(32)
        self.resets.add(
            PasswordReset(
                user_id=user.id,
                token_hash=fingerprint(token),
                expires_at=datetime.now(UTC)
                + timedelta(minutes=get_settings().reset_token_expiration_minutes),
            )
        )

        try:
            send_reset_email(user.email, token)
        except EmailDeliveryFailed:
            logger.warning("Token de reset criado, mas o e-mail não saiu")

    def reset(self, token: str, password: str) -> None:
        reset = self.resets.get_usable(fingerprint(token))

        if reset is None:
            raise InvalidResetToken()

        user = self.users.get(reset.user_id)

        if user is None:
            raise InvalidResetToken()

        user.password = hash_password(password)
        self.resets.mark_used(reset)
