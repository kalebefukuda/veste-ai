import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session

CREDENTIALS = {"name": "Mariana", "email": "mariana@exemplo.com", "password": "senha-antiga-1"}
NOVA_SENHA = "senha-nova-bem-longa"


@pytest.fixture
def registered(client: TestClient) -> dict[str, str]:
    client.post("/auth/register", json=CREDENTIALS)
    return CREDENTIALS


# Medir tempo em teste é frágil; o que dá para garantir é o mecanismo. Com o
# curto-circuito, e-mail inexistente nunca chegava no bcrypt — e o bcrypt é lento
# de propósito, então a diferença de tempo dizia se a conta existe.
def test_login_verifica_senha_mesmo_para_email_inexistente(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    chamadas: list[str] = []

    import app.services.auth_service as auth_service

    original = auth_service.verify_password

    def contando(plain: str, hashed: str) -> bool:
        chamadas.append(hashed)
        return original(plain, hashed)

    monkeypatch.setattr(auth_service, "verify_password", contando)

    client.post("/auth/login", json={"email": "ninguem@exemplo.com", "password": "qualquer"})

    assert chamadas, "o bcrypt não rodou: o tempo de resposta revela que a conta não existe"


# A chamada de rede à Brevo é o maior componente do tempo. Fora da resposta, a
# diferença entre e-mail existente e inexistente encolhe para escrita em banco.
def test_o_envio_nao_acontece_dentro_da_resposta(
    client: TestClient, registered: dict[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    momentos: list[str] = []

    monkeypatch.setattr(
        "app.services.password_reset_service.send_reset_email",
        lambda email, token: momentos.append("enviado"),
    )

    # O TestClient roda as background tasks só depois de devolver a resposta.
    with TestClient(client.app) as cliente:
        cliente.post("/auth/register", json={**CREDENTIALS, "email": "outra@exemplo.com"})
        cliente.post("/auth/forgot-password", json={"email": "outra@exemplo.com"})

    assert momentos == ["enviado"]


def test_trocar_a_senha_invalida_os_tokens_anteriores(
    client: TestClient, registered: dict[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    antigo = client.post(
        "/auth/login",
        json={"email": registered["email"], "password": registered["password"]},
    ).json()["access_token"]

    assert client.get("/users/me", headers={"Authorization": f"Bearer {antigo}"}).status_code == 200

    capturados: list[str] = []
    monkeypatch.setattr(
        "app.services.password_reset_service.send_reset_email",
        lambda email, token: capturados.append(token),
    )
    client.post("/auth/forgot-password", json={"email": registered["email"]})
    client.post("/auth/reset-password", json={"token": capturados[0], "password": NOVA_SENHA})

    # Se o reset acontece porque a conta foi comprometida, quem já tinha um token
    # continuaria com acesso por até 24h.
    depois = client.get("/users/me", headers={"Authorization": f"Bearer {antigo}"})

    assert depois.status_code == 401


def test_pedido_novo_apaga_os_tokens_ja_encerrados(
    client: TestClient, db: Session, registered: dict[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(
        "app.services.password_reset_service.send_reset_email", lambda email, token: None
    )

    for _ in range(3):
        client.post("/auth/forgot-password", json={"email": registered["email"]})

    total = db.execute(text("select count(*) from password_resets")).scalar_one()

    assert total == 1, "tokens encerrados não são apagados e a tabela cresce sem função"
