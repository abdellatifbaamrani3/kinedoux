"""initial schema: products, orders, order_items, tracking_logs, contact_messages

Revision ID: 0001_initial
Revises:
Create Date: 2026-10-29 00:00:00

Tables are created from SQLAlchemy metadata so the migrated schema cannot drift
from `app.models` (the pytest `compare_metadata` assertion depends on this).
"""
from typing import Sequence, Union

from alembic import op

from app.models import Base

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind())
