"""E-mail de boas-vindas. Ao contrário do reset, falhar aqui não invalida nada: a
conta já existe, e o cadastro não pode virar erro porque o Brevo caiu."""

import html
import logging

from fastapi import BackgroundTasks

from app.clients.brevo import send_email
from app.core.exceptions import EmailDeliveryFailed

logger = logging.getLogger(__name__)

PURPLE = "#8B5CF6"
ROSE = "#F472B6"
NAVY = "#1E1B4B"


# Tabela e estilo inline porque cliente de e-mail não tem flexbox nem <style> confiável.
def _html(nome: str) -> str:
    # O nome vem do cadastro sem restrição de caractere, e o e-mail sai antes de
    # qualquer prova de posse do endereço: sem escapar, dá para cadastrar o e-mail
    # de outra pessoa e mandar HTML escolhido pelo atacante numa mensagem oficial.
    nome = html.escape(nome)

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
        <p style="margin:0;font-size:22px;font-weight:700;color:{NAVY}">Veste<span
          style="color:{PURPLE}">Aí</span></p>
        <h1 style="margin:24px 0 0;font-size:28px;line-height:1.25;font-weight:700;color:{NAVY}">
          Boas-vindas, {nome}
        </h1>
        <p style="margin:16px 0 0;font-size:16px;line-height:1.6;color:{NAVY}">
          Sua conta está pronta. É por ela que os looks que você montar vão ficar salvos
          no seu nome.
        </p>
      </td></tr>
      <tr><td style="padding:32px 8px 0">
        <p style="margin:0;font-size:16px;line-height:1.6;font-weight:600;color:{NAVY}">
          Como vai funcionar
        </p>
        <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:{NAVY}">
          <strong>1.</strong> Você monta o look e cola o link de cada peça na loja
          onde ela está.<br>
          <strong>2.</strong> A IA gera a imagem da composição.<br>
          <strong>3.</strong> O look vai para o feed, e cada clique em link de compra
          passará a ser registrado.
        </p>
      </td></tr>
      <tr><td style="padding:24px 8px 0">
        <p style="margin:0;font-size:14px;line-height:1.6;color:{NAVY}">
          O editor de looks está <strong>em desenvolvimento</strong>. Avisamos por aqui
          quando ele entrar no ar.
        </p>
      </td></tr>
      <tr><td style="padding:32px 8px 0;border-top:1px solid #EEECF9">
        <p style="margin:24px 0 0;font-size:12px;color:{NAVY}">
          VesteAí — looks completos, com cada peça linkada na loja.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>"""


def _texto(nome: str) -> str:
    return (
        f"VesteAí — boas-vindas, {nome}\n\n"
        "Sua conta está pronta. É por ela que os looks que você montar vão ficar "
        "salvos no seu nome.\n\n"
        "Como vai funcionar:\n"
        "1. Você monta o look e cola o link de cada peça na loja onde ela está.\n"
        "2. A IA gera a imagem da composição.\n"
        "3. O look vai para o feed, e cada clique em link de compra passará a ser registrado.\n\n"
        "O editor de looks está em desenvolvimento. Avisamos por aqui quando entrar no ar.\n"
    )


def deliver(email: str, nome: str) -> None:
    try:
        send_email(email, "Boas-vindas ao VesteAí", _html(nome), _texto(nome))
    except EmailDeliveryFailed:
        # Sem retentativa e sem propagar: a conta existe, e quem se cadastrou não tem
        # o que fazer com um erro de infraestrutura de e-mail.
        logger.warning("boas-vindas não enviado")


def schedule(email: str, nome: str, background: BackgroundTasks) -> None:
    background.add_task(deliver, email, nome)
