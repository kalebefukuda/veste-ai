"""public handle

Revision ID: 0005
Revises: 0004
"""

import sqlalchemy as sa

from alembic import op

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Nulável porque as contas existentes não escolheram nenhum, e o funil só pede o
    # handle a quem passa por ele. No Postgres o índice único convive com vários nulos.
    op.add_column("users", sa.Column("username", sa.String(30), nullable=True))
    op.create_index("ix_users_username", "users", ["username"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_users_username", table_name="users")
    op.drop_column("users", "username")
