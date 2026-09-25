"""Recusa corpo grande demais antes de lê-lo — OWASP, negação de serviço."""

from collections.abc import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

# Folgado acima do limite de 5 MB da imagem, de propósito: foto de 5,5 MB tem de
# chegar à recusa amigável ("máximo 5 MB") em vez de bater num 413 genérico. Este
# limite é contra abuso, não contra arquivo um pouco maior que o permitido.
LIMITE = 8 * 1024 * 1024


class LimiteDeCorpoMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        declarado = request.headers.get("content-length")

        # Pelo tamanho declarado, antes de qualquer leitura: aqui o corpo ainda não
        # entrou no processo. Quem mente no cabeçalho ainda é contido pela leitura
        # limitada no próprio envio — e, em produção, pelo limite do ALB.
        if declarado and declarado.isdigit() and int(declarado) > LIMITE:
            return JSONResponse(
                status_code=413,
                content={"detail": "Corpo da requisição grande demais", "code": "BODY_TOO_LARGE"},
            )

        return await call_next(request)
