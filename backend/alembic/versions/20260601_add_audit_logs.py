"""add_audit_logs

Revision ID: 20260601_audit_logs
Revises: 20260601_api_contract
Create Date: 2026-06-01 15:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260601_audit_logs"
down_revision: Union[str, Sequence[str], None] = "20260601_api_contract"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(table_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return table_name in inspector.get_table_names()


def _has_index(table_name: str, index_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return index_name in {index["name"] for index in inspector.get_indexes(table_name)}


def upgrade() -> None:
    if not _has_table("audit_logs"):
        op.create_table(
            "audit_logs",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("user_name", sa.String(), nullable=True),
            sa.Column("user_email", sa.String(), nullable=True),
            sa.Column("action", sa.String(), nullable=False),
            sa.Column("entity_type", sa.String(), nullable=False),
            sa.Column("entity_id", sa.String(), nullable=False),
            sa.Column("entity_label", sa.String(), nullable=True),
            sa.Column("changes", postgresql.JSONB(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
        )

    if not _has_index("audit_logs", "ix_audit_logs_created_at"):
        op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])
    if not _has_index("audit_logs", "ix_audit_logs_entity"):
        op.create_index("ix_audit_logs_entity", "audit_logs", ["entity_type", "entity_id"])


def downgrade() -> None:
    if _has_table("audit_logs"):
        if _has_index("audit_logs", "ix_audit_logs_entity"):
            op.drop_index("ix_audit_logs_entity", table_name="audit_logs")
        if _has_index("audit_logs", "ix_audit_logs_created_at"):
            op.drop_index("ix_audit_logs_created_at", table_name="audit_logs")
        op.drop_table("audit_logs")
