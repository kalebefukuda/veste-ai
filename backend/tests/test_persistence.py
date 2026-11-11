import contextlib
import uuid

from sqlalchemy import text

from app.database import get_db, get_engine

INSERT = text(
    "insert into users (name, email, password) values ('Persistida', :email, 'hash-qualquer')"
)


# A fixture `client` mantém a transação aberta, então um flush sem commit parece
# funcionar. Este teste exercita o get_db real, que é onde o commit tem que estar.
def test_get_db_commita_ao_encerrar() -> None:
    email = f"{uuid.uuid4()}@exemplo.com"

    session_generator = get_db()
    session = next(session_generator)
    session.execute(INSERT, {"email": email})

    with contextlib.suppress(StopIteration):
        next(session_generator)

    try:
        with get_engine().connect() as fresh:
            found = fresh.execute(
                text("select count(*) from users where email = :email"), {"email": email}
            ).scalar_one()

        assert found == 1, "get_db fechou a sessão sem commit: a escrita foi desfeita"
    finally:
        with get_engine().begin() as cleanup:
            cleanup.execute(text("delete from users where email = :email"), {"email": email})
