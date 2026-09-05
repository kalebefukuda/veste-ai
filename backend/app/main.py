import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.core.exceptions import DomainHTTPException, TooManyRequests
from app.core.logging import RequestIdMiddleware, configure
from app.core.rate_limit import limiter
from app.core.security_headers import SecurityHeadersMiddleware
from app.routers import auth, users

configure()

logger = logging.getLogger(__name__)

app = FastAPI(title="VesteAi API", version="0.1.0")

app.state.limiter = limiter
app.add_middleware(SecurityHeadersMiddleware)
# Registrado por último para rodar primeiro: todo log de dentro já sai com o id.
app.add_middleware(RequestIdMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[get_settings().frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Formato único de erro: `code` é o que o frontend usa para decidir o que exibir,
# `detail` é a mensagem ao usuário e `rule` liga a resposta à regra da RFC.
# O slowapi tem handler próprio, com outro formato de corpo. Este devolve o formato
# único da API para que o frontend trate 429 como trata qualquer outro erro.
@app.exception_handler(RateLimitExceeded)
def handle_rate_limit(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    erro = TooManyRequests()
    logger.warning("rate_limit_excedido rota=%s", request.url.path)
    return JSONResponse(status_code=429, content={"detail": erro.detail, "code": erro.code})


@app.exception_handler(DomainHTTPException)
def handle_domain_error(request: Request, exc: DomainHTTPException) -> JSONResponse:
    body = {"detail": exc.error.detail, "code": exc.error.code}
    rule = getattr(exc.error, "rule", None)

    if rule:
        body["rule"] = rule

    return JSONResponse(status_code=exc.status_code, content=body)


app.include_router(auth.router)
app.include_router(users.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
