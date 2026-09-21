"""click survives the piece it pointed at

Revision ID: 0008
Revises: 0007
"""

import sqlalchemy as sa

from alembic import op

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # A `0001` cascateava `piece_id`, então remover uma peça apagava o histórico de
    # cliques dela. O total do look é número histórico do creator, não inventário do
    # que restou no look — ver ADR-0022.
    op.drop_constraint("clicks_piece_id_fkey", "clicks", type_="foreignkey")
    op.alter_column(
        "clicks", "piece_id", existing_type=sa.dialects.postgresql.UUID(), nullable=True
    )
    op.create_foreign_key(
        "clicks_piece_id_fkey", "clicks", "pieces", ["piece_id"], ["id"], ondelete="SET NULL"
    )

    # `look_id` continua cascateando: apagar o look apaga o que ele mediu, e isso é o
    # que a exclusão de conta precisa para não deixar rastro.


def downgrade() -> None:
    op.drop_constraint("clicks_piece_id_fkey", "clicks", type_="foreignkey")
    op.execute("DELETE FROM clicks WHERE piece_id IS NULL")
    op.alter_column(
        "clicks", "piece_id", existing_type=sa.dialects.postgresql.UUID(), nullable=False
    )
    op.create_foreign_key(
        "clicks_piece_id_fkey", "clicks", "pieces", ["piece_id"], ["id"], ondelete="CASCADE"
    )
