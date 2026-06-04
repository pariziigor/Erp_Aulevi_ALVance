"""add_supabase_user_id_to_users

Revision ID: 20260604_supabase_user_id
Revises: 20260604_password_controls
Create Date: 2026-06-04 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260604_supabase_user_id"
down_revision: Union[str, Sequence[str], None] = "20260604_password_controls"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def _has_unique_constraint(table_name: str, constraint_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return constraint_name in {constraint["name"] for constraint in inspector.get_unique_constraints(table_name)}


def upgrade() -> None:
    if not _has_column("users", "supabase_user_id"):
        op.add_column("users", sa.Column("supabase_user_id", sa.String(), nullable=True))

    if not _has_unique_constraint("users", "uq_users_supabase_user_id"):
        op.create_unique_constraint("uq_users_supabase_user_id", "users", ["supabase_user_id"])


def downgrade() -> None:
    if _has_column("users", "supabase_user_id"):
        if _has_unique_constraint("users", "uq_users_supabase_user_id"):
            op.drop_constraint("uq_users_supabase_user_id", "users", type_="unique")
        op.drop_column("users", "supabase_user_id")

