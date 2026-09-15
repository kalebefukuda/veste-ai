"""look gets an occasion category

Revision ID: 0007
Revises: 0006
"""

import sqlalchemy as sa

from alembic import op

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None

CATEGORIAS = "('work', 'casual', 'social', 'party', 'beach', 'sport')"


def upgrade() -> None:
    # Nulável porque rascunho antigo não tem categoria e a coluna nasce num banco com
    # dados. Quem exige preenchimento é a publicação, no serviço — mesmo desenho da
    # imagem, ADR-0019.
    op.add_column("looks", sa.Column("category", sa.String(20)))

    # CHECK e não só validação no Pydantic: a lista de valores é finita e o banco é a
    # última linha de defesa contra escrita por outro caminho.
    op.create_check_constraint("ck_looks_category", "looks", f"category IN {CATEGORIAS}")

    # O feed filtra por categoria dentro do que está publicado, na ordem da data.
    op.create_index(
        "ix_looks_category_created_at", "looks", ["status", "category", "created_at"]
    )


def downgrade() -> None:
    op.drop_index("ix_looks_category_created_at", "looks")
    op.drop_constraint("ck_looks_category", "looks", type_="check")
    op.drop_column("looks", "category")
