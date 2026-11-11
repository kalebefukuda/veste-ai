import uuid
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from app.config import get_settings

ALGORITHM = "HS256"


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# A expiração é parâmetro, e não `datetime.now()` solto, para o teste de token
# expirado não depender de esperar o relógio.
def create_access_token(subject: str | uuid.UUID, expires_in: timedelta | None = None) -> str:
    settings = get_settings()
    delta = expires_in or timedelta(minutes=settings.jwt_expiration_minutes)

    issued_at = datetime.now(UTC)
    payload = {
        "sub": str(subject),
        "iat": issued_at.timestamp(),
        "exp": issued_at + delta,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def read_claims(token: str) -> dict[str, object] | None:
    try:
        return jwt.decode(token, get_settings().jwt_secret, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
