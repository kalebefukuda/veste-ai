"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-08-17

Transcribed from RFC section 5.2. The clicks.ip_hash column comes from RFC
section 6.4, which requires the visitor IP to be persisted only as a SHA-256
hash; section 5.2 omits it.
"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def _created_at() -> sa.Column:
    return sa.Column("created_at", sa.TIMESTAMP(), nullable=False, server_default=sa.text("now()"))


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password", sa.Text(), nullable=False),
        sa.Column("plan", sa.String(20), nullable=False, server_default="free"),
        sa.Column("avatar", sa.Text()),
        sa.Column("bio", sa.Text()),
        _created_at(),
        sa.CheckConstraint("plan IN ('free', 'pro')", name="ck_users_plan"),
    )

    op.create_table(
        "looks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("image_url", sa.Text(), nullable=False),
        sa.Column("ai_generated", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        _created_at(),
        sa.CheckConstraint("status IN ('draft', 'published')", name="ck_looks_status"),
    )
    op.create_index("ix_looks_status_created_at", "looks", ["status", "created_at"])
    op.create_index("ix_looks_user_id", "looks", ["user_id"])

    op.create_table(
        "pieces",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "look_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("looks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("store", sa.String(100)),
        sa.Column("price", sa.Numeric(10, 2)),
        sa.Column("purchase_url", sa.Text(), nullable=False),
        sa.Column("image_url", sa.Text()),
        _created_at(),
    )
    op.create_index("ix_pieces_look_id", "pieces", ["look_id"])

    op.create_table(
        "clicks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "piece_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("pieces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "look_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("looks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("ip_hash", sa.Text()),
        _created_at(),
    )
    op.create_index("ix_clicks_look_id_created_at", "clicks", ["look_id", "created_at"])

    op.create_table(
        "saved_looks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "look_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("looks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        _created_at(),
        sa.UniqueConstraint("user_id", "look_id", name="uq_saved_looks_user_look"),
    )


def downgrade() -> None:
    op.drop_table("saved_looks")
    op.drop_table("clicks")
    op.drop_table("pieces")
    op.drop_table("looks")
    op.drop_table("users")
