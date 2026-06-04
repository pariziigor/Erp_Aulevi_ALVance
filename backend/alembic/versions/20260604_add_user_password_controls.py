"""add_user_password_controls

Revision ID: 20260604_password_controls
Revises: 20260601_audit_logs
Create Date: 2026-06-04 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260604_password_controls"
down_revision: Union[str, Sequence[str], None] = "20260601_audit_logs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    if not _has_column("users", "must_change_password"):
        op.add_column(
            "users",
            sa.Column("must_change_password", sa.Boolean(), nullable=False, server_default=sa.false()),
        )
        op.alter_column("users", "must_change_password", server_default=None)

    if not _has_column("users", "password_reset_requested_at"):
        op.add_column("users", sa.Column("password_reset_requested_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    if _has_column("users", "password_reset_requested_at"):
        op.drop_column("users", "password_reset_requested_at")
    if _has_column("users", "must_change_password"):
        op.drop_column("users", "must_change_password")
