import pytest
from fastapi.testclient import TestClient
from prometheus_client import REGISTRY, generate_latest

from app.config import get_settings
from app.core import metricas
from app.main import app

ID_QUALQUER = "7c45a3d4-7449-4bdc-8916-06173cdd2655"


def amostra(nome: str, rotulos: dict[str, str] | None = None) -> float:
    return REGISTRY.get_sample_value(nome, rotulos or {}) or 0.0


def test_conta_a_requisicao_por_metodo_rota_e_status(client: TestClient) -> None:
    rotulos = {"method": "GET", "route": "/health", "status": "200"}
    antes = amostra("vesteai_http_requests_total", rotulos)

    client.get("/health")

    assert amostra("vesteai_http_requests_total", rotulos) == antes + 1


def test_mede_o_tempo_de_resposta_por_rota(client: TestClient) -> None:
    rotulos = {"method": "GET", "route": "/health"}
    antes = amostra("vesteai_http_request_duration_seconds_count", rotulos)

    client.get("/health")

    assert amostra("vesteai_http_request_duration_seconds_count", rotulos) == antes + 1


# O id no rótulo criaria uma série por look e poria identificador nas métricas.
def test_rotula_pelo_molde_da_rota_e_nunca_pelo_id(client: TestClient) -> None:
    client.post(f"/clicks/{ID_QUALQUER}")

    exposto = generate_latest().decode()

    assert 'route="/clicks/{piece_id}"' in exposto
    assert ID_QUALQUER not in exposto


# Robô varrendo caminhos aleatórios não pode inflar a quantidade de séries.
def test_caminho_inexistente_vira_um_rotulo_so(client: TestClient) -> None:
    client.get("/wp-admin/varredura-123")

    exposto = generate_latest().decode()

    assert 'route="unmatched"' in exposto
    assert "varredura-123" not in exposto


# As métricas saem só pela porta interna: pela API pública, quem varre não as lê.
def test_a_api_publica_nao_expoe_metricas(client: TestClient) -> None:
    assert client.get("/metrics").status_code == 404


# Presa à máquina por padrão: o Prometheus lê pelo localhost da task, não pela rede.
def test_a_porta_de_metricas_sobe_presa_a_maquina(monkeypatch: pytest.MonkeyPatch) -> None:
    portas: list[tuple[int, str]] = []
    monkeypatch.setattr(metricas, "start_http_server", lambda p, addr: portas.append((p, addr)))
    monkeypatch.setenv("METRICS_PORT", "9100")
    get_settings.cache_clear()

    try:
        with TestClient(app):
            pass
    finally:
        get_settings.cache_clear()

    assert portas == [(9100, "127.0.0.1")]


def test_sem_porta_configurada_nao_abre_nada(monkeypatch: pytest.MonkeyPatch) -> None:
    portas: list[int] = []
    monkeypatch.setattr(metricas, "start_http_server", lambda p, addr: portas.append(p))

    metricas.iniciar(0, "127.0.0.1")

    assert portas == []


# Série que só nasce no primeiro evento deixa o painel em "No data" em vez de zero.
def test_as_series_de_geracao_existem_desde_o_inicio() -> None:
    for resultado in ("success", "failure"):
        rotulos = {"result": resultado}
        assert REGISTRY.get_sample_value("vesteai_generations_total", rotulos) is not None
