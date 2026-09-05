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


def test_o_log_sai_em_json_com_o_request_id(
    client: TestClient, caplog: pytest.LogCaptureFixture
) -> None:
    with caplog.at_level(logging.INFO):
        client.get("/health", headers={"X-Request-Id": "id-rastreavel"})

    registros = [json.loads(linha) for linha in caplog.messages if linha.startswith("{")]

    assert any(r.get("request_id") == "id-rastreavel" for r in registros)


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
