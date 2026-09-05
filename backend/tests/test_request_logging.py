import json
import logging

import pytest
from fastapi.testclient import TestClient


def test_toda_resposta_devolve_um_identificador_de_requisicao(client: TestClient) -> None:
    assert client.get("/health").headers.get("X-Request-Id")


# Rastrear um erro através do ALB e do frontend exige que o mesmo id atravesse tudo.
def test_respeita_o_identificador_que_ja_veio(client: TestClient) -> None:
    resposta = client.get("/health", headers={"X-Request-Id": "id-de-fora"})

    assert resposta.headers["X-Request-Id"] == "id-de-fora"


def test_cada_requisicao_recebe_um_id_diferente(client: TestClient) -> None:
    ids = {client.get("/health").headers["X-Request-Id"] for _ in range(5)}

    assert len(ids) == 5


def test_o_log_carrega_o_request_id_da_requisicao(
    client: TestClient, caplog: pytest.LogCaptureFixture
) -> None:
    with caplog.at_level(logging.INFO):
        client.get("/health", headers={"X-Request-Id": "id-rastreavel"})

    acessos = [r for r in caplog.records if r.name == "vesteai.access"]

    assert acessos, "nenhum log de acesso: o request_id não serviria para achar nada"
    assert acessos[0].request_id == "id-rastreavel"
    assert "/health" in acessos[0].getMessage()


def test_o_formatter_serializa_em_json(caplog: pytest.LogCaptureFixture) -> None:
    from app.core.logging import JsonFormatter

    registro = logging.LogRecord("teste", logging.INFO, "", 0, "evento_qualquer", None, None)
    registro.request_id = "id-x"

    saida = json.loads(JsonFormatter().format(registro))

    assert saida == {
        "level": "INFO",
        "event": "evento_qualquer",
        "logger": "teste",
        "request_id": "id-x",
    }


# LGPD: o Padrão de logs proíbe IP bruto. O slowapi loga o IP ao bloquear — se ele
# passar direto, a proteção que acabamos de adicionar vira o vazamento.
def test_o_bloqueio_por_rate_limit_nao_registra_o_ip_bruto(
    client: TestClient, caplog: pytest.LogCaptureFixture
) -> None:
    ip = "198.51.100.77"

    with caplog.at_level(logging.WARNING):
        while (
            client.post(
                "/auth/login",
                json={"email": "a@exemplo.com", "password": "x"},
                headers={"X-Forwarded-For": ip},
            ).status_code
            != 429
        ):
            pass

    assert ip not in caplog.text
