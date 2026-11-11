"""look image becomes optional

Revision ID: 0006
Revises: 0005
"""

import sqlalchemy as sa

from alembic import op

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # A 0001 criou `image_url` NOT NULL, seguindo a RFC. A decisão mudou: rascunho
    # sem imagem existe, e a imagem passa a ser pré-condição de publicação — assim a
    # regra fica no serviço, onde dá para dar mensagem, em vez de virar erro do banco.
    op.alter_column("looks", "image_url", existing_type=sa.Text(), nullable=True)


def downgrade() -> None:
    op.alter_column("looks", "image_url", existing_type=sa.Text(), nullable=False)
