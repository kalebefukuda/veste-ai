import pytest
from fastapi.testclient import TestClient

CREDENCIAIS = {"email": "mariana@exemplo.com", "password": "senha-qualquer-1"}


def _login(client: TestClient, ip: str) -> int:
    return client.post(
        "/auth/login", json=CREDENCIAIS, headers={"X-Forwarded-For": ip}
    ).status_code


def test_login_bloqueia_depois_do_limite_de_tentativas(client: TestClient) -> None:
    codigos = [_login(client, "203.0.113.10") for _ in range(12)]

    assert 429 in codigos, "força bruta de senha passou sem freio"


# Sem isto, atrás do ALB todo mundo cai no mesmo balde: o IP visto seria o do load
# balancer, e um único atacante derrubaria o login para todos os usuários.
def test_o_limite_e_por_ip_e_nao_global(client: TestClient) -> None:
    while _login(client, "203.0.113.20") != 429:
        pass

    assert _login(client, "203.0.113.21") != 429


# O forgot-password gasta cota de e-mail (300/dia no plano da Brevo): precisa de um
# limite mais apertado que o login, que só gasta CPU.
def test_forgot_password_e_mais_restrito_que_o_login(client: TestClient) -> None:
    def tentativas_ate_bloquear(rota: str, corpo: dict, ip: str) -> int:
        for tentativa in range(1, 60):
            resposta = client.post(rota, json=corpo, headers={"X-Forwarded-For": ip})
            if resposta.status_code == 429:
                return tentativa
        return 60

    forgot = tentativas_ate_bloquear(
        "/auth/forgot-password", {"email": "a@exemplo.com"}, "203.0.113.30"
    )
    login = tentativas_ate_bloquear("/auth/login", CREDENCIAIS, "203.0.113.31")

    assert forgot < login


def test_resposta_de_bloqueio_segue_o_formato_de_erro_do_projeto(client: TestClient) -> None:
    while _login(client, "203.0.113.40") != 429:
        pass

    corpo = client.post(
        "/auth/login", json=CREDENCIAIS, headers={"X-Forwarded-For": "203.0.113.40"}
    ).json()

    assert corpo["code"] == "TOO_MANY_REQUESTS"
    assert "detail" in corpo


# Health check é chamado pelo ALB a cada poucos segundos: limitar derrubaria o serviço.
def test_health_nao_e_limitado(client: TestClient) -> None:
    codigos = {client.get("/health").status_code for _ in range(40)}

    assert codigos == {200}


@pytest.fixture(autouse=True)
def _zera_contadores() -> None:
    from app.core.rate_limit import limiter

    limiter.reset()
