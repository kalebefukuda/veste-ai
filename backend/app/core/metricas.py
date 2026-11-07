"""Métricas no formato do Prometheus, servidas numa porta que só a rede interna alcança."""

import time
from collections.abc import Awaitable, Callable

from prometheus_client import Counter, Histogram, start_http_server
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

REQUISICOES = Counter(
    "vesteai_http_requests_total", "HTTP requests served.", ["method", "route", "status"]
)
TEMPO_DE_RESPOSTA = Histogram(
    "vesteai_http_request_duration_seconds", "HTTP response time.", ["method", "route"]
)
GERACOES = Counter("vesteai_generations_total", "AI image generations.", ["result"])
for resultado in ("success", "failure"):
    GERACOES.labels(result=resultado)
TEMPO_DA_GERACAO = Histogram(
    "vesteai_generation_duration_seconds",
    "Time to generate a look image.",
    buckets=(2, 5, 10, 15, 20, 25, 30, 45, 60),
)
CLIQUES = Counter("vesteai_clicks_total", "Clicks that took the visitor to the store.")


def iniciar(porta: int, endereco: str) -> None:
    if porta:
        start_http_server(porta, addr=endereco)


class MetricasMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        inicio = time.perf_counter()
        status = 500

        try:
            resposta = await call_next(request)
            status = resposta.status_code
            return resposta
        finally:
            # O molde da rota, e não o caminho: id no rótulo vira uma série por look.
            molde = getattr(request.scope.get("route"), "path", "unmatched")
            REQUISICOES.labels(request.method, molde, str(status)).inc()
            TEMPO_DE_RESPOSTA.labels(request.method, molde).observe(time.perf_counter() - inicio)
