"""Keep the full Meta click id. varchar(255) was cutting fbc.

Revision ID: 0002_click_ids
Revises: 0001_initial
Create Date: 2026-11-21 00:00:00
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_click_ids"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("orders", "fbp", existing_type=sa.String(255), type_=sa.String(2048))
    op.alter_column("orders", "fbc", existing_type=sa.String(255), type_=sa.String(2048))


def downgrade() -> None:
    op.alter_column("orders", "fbp", existing_type=sa.String(2048), type_=sa.String(255))
    op.alter_column("orders", "fbc", existing_type=sa.String(2048), type_=sa.String(255))
