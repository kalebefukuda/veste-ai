import os

# Importing app.main calls get_settings(), which fails collection without this.
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://vesteai:vesteai@localhost:5432/vesteai_test",
)
os.environ.setdefault("JWT_SECRET", "test-only-secret")

import subprocess  # noqa: E402
import sys  # noqa: E402
from collections.abc import Iterator  # noqa: E402
from pathlib import Path  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import Session, sessionmaker  # noqa: E402

from app.database import get_db, get_engine  # noqa: E402
from app.main import app  # noqa: E402


# Pela CLI porque a pasta backend/alembic/ sombreia o pacote alembic instalado.
@pytest.fixture(scope="session", autouse=True)
def schema() -> None:
    subprocess.run(  # noqa: S603 — o comando vem do interpretador, não de entrada externa
        [str(Path(sys.executable).parent / "alembic"), "upgrade", "head"],
        cwd=Path(__file__).resolve().parent.parent,
        check=True,
    )


# Cada teste roda numa transação desfeita ao fim: rápido e isolado, sem truncar tabela.
@pytest.fixture
def db() -> Iterator[Session]:
    connection = get_engine().connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_db] = lambda: db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


# O contador do rate limit vive em memória do processo e sobrevive entre testes: sem
# zerar, um teste que chama a mesma rota várias vezes derruba o seguinte.
@pytest.fixture(autouse=True)
def _zera_rate_limit() -> None:
    from app.core.rate_limit import limiter

    limiter.reset()
