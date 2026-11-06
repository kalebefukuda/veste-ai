"""piece keeps the key of an uploaded photo

Revision ID: 0010
Revises: 0009
"""

import sqlalchemy as sa

from alembic import op

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Mesmo desenho da foto do look: a chave no bucket, e `image_url` segue valendo para
    # as peças que já existem com endereço colado — ADR-0027.
    op.add_column("pieces", sa.Column("image_key", sa.Text()))


def downgrade() -> None:
    op.drop_column("pieces", "image_key")
