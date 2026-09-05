from fastapi.testclient import TestClient

# Ausência destes cabeçalhos é "Security Misconfiguration" na tabela OWASP do projeto,
# e o playbook trata violação de segurança básica como reprovação direta.
ESPERADOS = {
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-frame-options": "DENY",
}


def test_toda_resposta_traz_os_cabecalhos_de_seguranca(client: TestClient) -> None:
    headers = client.get("/health").headers

    for nome, valor in ESPERADOS.items():
        assert headers.get(nome) == valor, f"faltou {nome}"


def test_os_cabecalhos_valem_tambem_na_resposta_de_erro(client: TestClient) -> None:
    headers = client.get("/users/me").headers

    assert headers.get("x-content-type-options") == "nosniff"


def test_existe_politica_de_conteudo(client: TestClient) -> None:
    csp = client.get("/health").headers.get("content-security-policy")

    assert csp is not None
    # A API só devolve JSON: nada deve poder ser carregado ou embutido a partir dela.
    assert "default-src 'none'" in csp
    assert "frame-ancestors 'none'" in csp


# HSTS só faz sentido sob TLS, e em HTTP local ele atrapalharia o desenvolvimento.
def test_hsts_nao_vai_em_conexao_sem_tls(client: TestClient) -> None:
    assert "strict-transport-security" not in client.get("/health").headers


def test_hsts_vai_quando_o_alb_indica_https(client: TestClient) -> None:
    headers = client.get("/health", headers={"X-Forwarded-Proto": "https"}).headers

    assert "max-age=" in headers.get("strict-transport-security", "")
