"""look keeps the key of an uploaded image

Revision ID: 0009
Revises: 0008
"""

import sqlalchemy as sa

from alembic import op

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Coluna própria, e não reaproveitar `image_url`: o endereço assinado expira, então
    # o que se guarda é a chave no bucket. Endereço colado à mão continua valendo em
    # `image_url` — os looks que já existem não podem parar de ter foto — ADR-0025.
    op.add_column("looks", sa.Column("image_key", sa.Text()))


def downgrade() -> None:
    op.drop_column("looks", "image_key")
