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
        for _ in range(100):
            bloqueado = (
                client.post(
                    "/auth/login",
                    json={"email": "a@exemplo.com", "password": "x"},
                    headers={"X-Forwarded-For": ip},
                ).status_code
                == 429
            )
            if bloqueado:
                break
        else:
            raise AssertionError("não bloqueou: sem 429 não há o que conferir no log")

    assert ip not in caplog.text


# O valor vai para o log e volta no cabeçalho da resposta. Aceitar qualquer coisa abre
# forjamento de log (CWE-117): uma quebra de linha permitiria inventar um evento novo.
def test_descarta_um_request_id_com_caractere_de_controle(client: TestClient) -> None:
    forjado = 'abc\n{"level": "INFO", "event": "login_do_admin"}'

    devolvido = client.get("/health", headers={"X-Request-Id": forjado}).headers["X-Request-Id"]

    assert devolvido != forjado
    assert "\n" not in devolvido


def test_descarta_um_request_id_absurdamente_longo(client: TestClient) -> None:
    devolvido = client.get("/health", headers={"X-Request-Id": "a" * 500}).headers["X-Request-Id"]

    assert len(devolvido) < 100


def test_preserva_um_request_id_bem_formado(client: TestClient) -> None:
    bom = "7f3c1a9b-2d4e-4f60-9a8b-1c2d3e4f5061"

    assert client.get("/health", headers={"X-Request-Id": bom}).headers["X-Request-Id"] == bom
