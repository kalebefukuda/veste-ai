from typing import Annotated

from fastapi import APIRouter, Request, status

from app.core.exceptions import DomainHTTPException, EmailDeliveryFailed
from app.core.rate_limit import LIMIT_CONTACT, limiter
from app.schemas.user import ContactIn
from app.services import contact_service

router = APIRouter(tags=["contact"])


# 202 e não 200: a plataforma aceitou o pedido, quem responde é uma pessoa depois.
@router.post("/contact", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit(LIMIT_CONTACT)
def contact(request: Request, data: Annotated[ContactIn, ...]) -> dict[str, str]:
    try:
        contact_service.send(data.email, data.message)
    except EmailDeliveryFailed as error:
        # Sem tarefa de fundo aqui: quem preencheu precisa saber se saiu ou não.
        # Dizer "enviado" com o envio falhando é pior que dar erro.
        raise DomainHTTPException(status.HTTP_502_BAD_GATEWAY, error) from error

    return {"detail": "Recebemos seu pedido. Respondemos no prazo legal de 15 dias"}
