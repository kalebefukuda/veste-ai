"""Cabeçalhos de resposta — OWASP Security Misconfiguration."""

from collections.abc import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.config import get_settings

# A API só devolve JSON: nada deve poder ser carregado, embutido ou executado a partir
# dela. `default-src 'none'` é a política mais restritiva possível, e cabe aqui.
CSP = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"

CDN = "https://cdn.jsdelivr.net"
DOCUMENTACAO = ("/docs", "/redoc")

# Swagger e ReDoc são as duas únicas páginas HTML da API, e buscam CSS e JS na CDN.
# Sob a política estrita o navegador recusa os dois e a tela fica em branco — 200 no
# servidor, nada para ver. Isto abre o mínimo, e só nessas rotas.
CSP_DOCUMENTACAO = (
    f"default-src 'none'; script-src {CDN} 'unsafe-inline'; style-src {CDN} 'unsafe-inline'; "
    f"font-src {CDN}; img-src 'self' data: https://fastapi.tiangolo.com; "
    "connect-src 'self'; worker-src blob:; "
    "frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
)

FIXOS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": CSP,
}

HSTS = "max-age=31536000; includeSubDomains"


# O ALB termina o TLS, então a última perna sempre chega como HTTP: perguntar à
# requisição se ela é https significaria confiar num cabeçalho que o cliente escreve.
# Quem decide é o ambiente.
def em_producao() -> bool:
    return get_settings().env == "production"


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        response = await call_next(request)
        response.headers.update(FIXOS)

        if request.url.path in DOCUMENTACAO:
            response.headers["Content-Security-Policy"] = CSP_DOCUMENTACAO

        # HSTS instrui o navegador a nunca mais usar HTTP neste domínio, por um ano.
        # Mandar isso em desenvolvimento deixaria localhost inacessível.
        if em_producao():
            response.headers["Strict-Transport-Security"] = HSTS

        return response
