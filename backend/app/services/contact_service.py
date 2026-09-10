"""Canal do titular. Ao contrário do e-mail de boas-vindas, a falha aqui precisa
chegar a quem preencheu: dizer "enviado" sem nada ter saído é pior que dar erro."""

import html
import logging

from app.clients.brevo import send_email
from app.config import get_settings
from app.core.exceptions import EmailDeliveryFailed

logger = logging.getLogger(__name__)

NAVY = "#1E1B4B"
PURPLE = "#8B5CF6"


def _corpo(remetente: str, mensagem: str) -> tuple[str, str]:
    # Texto de terceiro entrando num HTML que sai assinado pelo domínio da
    # plataforma: sem escapar, o formulário vira um relay de HTML escolhido por
    # quem preencheu — a mesma classe do e-mail de boas-vindas.
    remetente_seguro = html.escape(remetente)
    mensagem_segura = html.escape(mensagem).replace("\n", "<br>")

    html_corpo = f"""\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background:#ffffff;padding:32px 16px">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"
           style="max-width:560px;width:100%;font-family:system-ui,sans-serif">
      <tr><td style="background:{PURPLE};height:4px;border-radius:4px 4px 0 0">&nbsp;</td></tr>
      <tr><td style="padding:32px 8px 0">
        <p style="margin:0;font-size:13px;color:{NAVY}">Pedido pelo canal de privacidade</p>
        <p style="margin:12px 0 0;font-size:16px;font-weight:700;color:{NAVY}">
          {remetente_seguro}
        </p>
      </td></tr>
      <tr><td style="padding:24px 8px 0">
        <p style="margin:0;font-size:15px;line-height:1.7;color:{NAVY}">{mensagem_segura}</p>
      </td></tr>
    </table>
  </td></tr>
</table>"""

    texto = f"Pedido pelo canal de privacidade\n\nDe: {remetente}\n\n{mensagem}\n"

    return html_corpo, texto


def send(remetente: str, mensagem: str) -> None:
    destino = get_settings().contact_destination

    if not destino:
        # Sem destino o pedido não chega a ninguém, e o prazo legal corre. Falhar
        # alto é a única saída honesta: aceitar e descartar seria pior.
        logger.error("CONTACT_DESTINATION ausente: pedido do titular não foi entregue")
        raise EmailDeliveryFailed()

    html_corpo, texto = _corpo(remetente, mensagem)

    # O destino sai de variável de ambiente e nunca da entrada: assunto e
    # destinatário montados com dado de terceiro é como se injeta cabeçalho.
    send_email(
        destino,
        "VesteAí — pedido pelo canal de privacidade",
        html_corpo,
        texto,
    )
