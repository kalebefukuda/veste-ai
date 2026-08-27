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

    payload = {"sub": str(subject), "exp": datetime.now(UTC) + delta}
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def read_subject(token: str) -> str | None:
    try:
        payload = jwt.decode(token, get_settings().jwt_secret, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None

    return payload.get("sub")
