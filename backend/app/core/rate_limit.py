"""Freio das rotas de autenticação — força bruta de senha e queima da cota de e-mail."""

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import get_settings

# `login` gasta CPU; `forgot-password` gasta cota de e-mail, que é finita e diária.
LIMIT_LOGIN = "10/minute"
LIMIT_REGISTER = "10/hour"
LIMIT_FORGOT = "3/hour"
LIMIT_RESET = "10/minute"
# Confere senha, então é força bruta em potencial mesmo exigindo sessão válida.
LIMIT_DELETE_ACCOUNT = "5/minute"
# Formulário público que dispara e-mail: sem freio vira máquina de spam e queima a
# cota diária da conta, derrubando a recuperação de senha junto.
LIMIT_CONTACT = "3/hour"


# Atrás do ALB o peer TCP é sempre o load balancer: sem ler o X-Forwarded-For, todos os
# usuários dividiriam um balde só. Confiar no cabeçalho é seguro porque o security group
# da task aceita entrada apenas do ALB — ver infra/network.tf.
def client_ip(request: Request) -> str:
    encaminhado = request.headers.get("X-Forwarded-For")

    if encaminhado:
        # O ALB **acrescenta** o IP observado ao que já veio, então o último item é o
        # único que ele escreveu. Ler o primeiro deixaria o cliente escolher a própria
        # chave e trocar de identidade a cada requisição.
        return encaminhado.split(",")[-1].strip()

    return get_remote_address(request)


limiter = Limiter(
    key_func=client_ip,
    storage_uri=get_settings().rate_limit_storage,
    strategy="fixed-window",
)

