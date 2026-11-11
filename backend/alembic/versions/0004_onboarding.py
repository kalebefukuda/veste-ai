"""onboarding state and intent

Revision ID: 0004
Revises: 0003
"""

import sqlalchemy as sa

from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Nulável de propósito: nulo é "ainda não passou pelo funil", e é o que o
    # frontend lê para decidir entre configurar e ir direto às boas-vindas.
    op.add_column("users", sa.Column("onboarded_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("intent", sa.String(20), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "intent")
    op.drop_column("users", "onboarded_at")
