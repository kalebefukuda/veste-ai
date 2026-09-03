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

# Espelham frontend/tailwind.config.ts — uma fonte só para a identidade.
PURPLE = "#8B5CF6"
ROSE = "#F472B6"
NAVY = "#1E1B4B"


def fingerprint(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


# Tabela e estilo inline porque cliente de e-mail não tem flexbox nem <style> confiável.
def _html(link: str) -> str:
    return f"""\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background:#ffffff;padding:32px 16px">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"
           style="max-width:560px;width:100%;font-family:'Plus Jakarta Sans',system-ui,sans-serif">
      <tr><td style="background:linear-gradient(135deg,{PURPLE} 0%,{ROSE} 100%);
                     background-color:{PURPLE};height:4px;border-radius:4px 4px 0 0">
        &nbsp;</td></tr>
      <tr><td style="padding:40px 8px 0">
        <p style="margin:0;font-size:22px;font-weight:700;color:{NAVY}">VesteAí</p>
        <h1 style="margin:24px 0 0;font-size:28px;line-height:1.25;font-weight:700;color:{NAVY}">
          Criar uma senha nova
        </h1>
        <p style="margin:16px 0 0;font-size:16px;line-height:1.6;color:{NAVY}">
          Você pediu para redefinir sua senha. É só clicar no botão abaixo.
        </p>
      </td></tr>
      <tr><td style="padding:32px 8px 0">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:{PURPLE};border-radius:16px">
            <a href="{link}"
               style="display:inline-block;padding:14px 24px;font-size:16px;font-weight:600;
                      color:#ffffff;text-decoration:none">Criar uma senha nova</a>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:32px 8px 0">
        <p style="margin:0;font-size:14px;line-height:1.6;color:{NAVY}">
          O link vale por 1 hora e só pode ser usado uma vez.
          Se não foi você, ignore este e-mail — sua senha continua a mesma.
        </p>
        <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:{NAVY}">
          Se o botão não funcionar, copie e cole este endereço no navegador:<br>
          <span style="word-break:break-all">{link}</span>
        </p>
      </td></tr>
      <tr><td style="padding:32px 8px 0;border-top:1px solid #EEECF9">
        <p style="margin:24px 0 0;font-size:12px;color:{NAVY}">
          VesteAí — curadoria de looks com links de compra.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>"""


def _texto(link: str) -> str:
    return (
        "VesteAí — criar uma senha nova\n\n"
        "Você pediu para redefinir sua senha. Abra o endereço abaixo:\n\n"
        f"{link}\n\n"
        "O link vale por 1 hora e só pode ser usado uma vez. "
        "Se não foi você, ignore este e-mail — sua senha continua a mesma.\n"
    )


def send_reset_email(email: str, token: str) -> None:
    link = f"{get_settings().frontend_reset_url}?token={token}"
    send_email(email, "Recuperação de senha — VesteAí", _html(link), _texto(link))


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
