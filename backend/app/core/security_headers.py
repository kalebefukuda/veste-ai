"""Cabeçalhos de resposta — OWASP Security Misconfiguration."""

from collections.abc import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# A API só devolve JSON: nada deve poder ser carregado, embutido ou executado a partir
# dela. `default-src 'none'` é a política mais restritiva possível, e cabe aqui.
CSP = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"

FIXOS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": CSP,
}

HSTS = "max-age=31536000; includeSubDomains"


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        response = await call_next(request)
        response.headers.update(FIXOS)

        # HSTS instrui o navegador a nunca mais usar HTTP neste domínio. Mandar isso em
        # desenvolvimento, que roda sem TLS, deixaria localhost inacessível no navegador.
        if request.headers.get("X-Forwarded-Proto") == "https":
            response.headers["Strict-Transport-Security"] = HSTS

        return response
