"""Log estruturado com `request_id` — rastreabilidade sem dado pessoal (LGPD)."""

import json
import logging
import time
import uuid
from collections.abc import Awaitable, Callable
from contextvars import ContextVar

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

HEADER = "X-Request-Id"

# ContextVar e não parâmetro: o id precisa alcançar qualquer log de qualquer camada
# sem que services e repositories tenham de carregá-lo na assinatura.
_request_id: ContextVar[str] = ContextVar("request_id", default="-")

logger = logging.getLogger("vesteai.access")


def current_request_id() -> str:
    return _request_id.get()


# Carimba o id no registro no momento em que ele é criado. Ler o ContextVar só na
# formatação daria "-" sempre que o handler formatasse fora do contexto da requisição.
class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = current_request_id()
        return True


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        evento = {
            "level": record.levelname,
            "event": record.getMessage(),
            "logger": record.name,
            "request_id": getattr(record, "request_id", "-"),
        }

        if record.exc_info:
            evento["exception"] = self.formatException(record.exc_info)

        return json.dumps(evento, ensure_ascii=False)


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        # Respeitar o id que já veio permite seguir uma requisição do frontend até aqui.
        identificador = request.headers.get(HEADER) or uuid.uuid4().hex
        token = _request_id.set(identificador)

        inicio = time.perf_counter()

        try:
            response = await call_next(request)

            # Só o caminho, nunca a URL inteira: query string pode carregar token.
            # E nada de IP, e-mail ou corpo — o Padrão de logs proíbe (LGPD).
            logger.info(
                "requisicao metodo=%s rota=%s status=%s duracao_ms=%d",
                request.method,
                request.url.path,
                response.status_code,
                (time.perf_counter() - inicio) * 1000,
            )

            response.headers[HEADER] = identificador
            return response
        finally:
            _request_id.reset(token)


def configure(level: str = "INFO") -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    handler.addFilter(RequestIdFilter())

    root = logging.getLogger()
    root.handlers = [handler]
    root.addFilter(RequestIdFilter())
    root.setLevel(level)

    # O slowapi escreve o IP bruto na mensagem ao bloquear. O evento em si é registrado
    # pelo nosso middleware, com o request_id e sem o IP — ver Padrão de logs (LGPD).
    logging.getLogger("slowapi").setLevel(logging.CRITICAL)
