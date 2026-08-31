import logging

import httpx

from app.config import get_settings
from app.core.exceptions import EmailDeliveryFailed

logger = logging.getLogger(__name__)

ENDPOINT = "https://api.brevo.com/v3/smtp/email"
TIMEOUT = 10.0


def send_email(to: str, subject: str, html: str) -> None:
    settings = get_settings()

    if not settings.brevo_api_key:
        logger.warning("BREVO_API_KEY ausente: e-mail para %s não foi enviado", _mask(to))
        raise EmailDeliveryFailed()

    payload = {
        "sender": {"email": settings.email_sender, "name": settings.email_sender_name},
        "to": [{"email": to}],
        "subject": subject,
        "htmlContent": html,
    }

    try:
        response = httpx.post(
            ENDPOINT,
            json=payload,
            headers={"api-key": settings.brevo_api_key, "accept": "application/json"},
            timeout=TIMEOUT,
        )
        response.raise_for_status()
    except httpx.HTTPError as error:
        # Erro da biblioteca não sobe: as camadas de cima falam a língua do domínio.
        logger.warning("Brevo recusou o envio para %s: %s", _mask(to), error)
        raise EmailDeliveryFailed() from error


def _mask(email: str) -> str:
    name, _, domain = email.partition("@")
    return f"{name[:2]}***@{domain}"
