"""First-party shop visits. Fresh databases already get these tables from 0001.

Revision ID: 0004_store_tracking
Revises: 0003_admin_desk
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0004_store_tracking"
down_revision: Union[str, None] = "0003_admin_desk"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    # Imported here so an old database can create the same tables the models define.
    from app.models.analytics import StoreEvent, StoreSession, Visitor

    if "visitors" not in tables:
        Visitor.__table__.create(bind)
    if "sessions" not in tables:
        StoreSession.__table__.create(bind)
    if "store_events" not in tables:
        StoreEvent.__table__.create(bind)

    order_cols = {column["name"] for column in inspector.get_columns("orders")}
    if "utm_content" not in order_cols:
        op.add_column("orders", sa.Column("utm_content", sa.String(150), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    for name in ("store_events", "sessions", "visitors"):
        if name in tables:
            op.drop_table(name)
    order_cols = {column["name"] for column in inspector.get_columns("orders")}
    if "utm_content" in order_cols:
        op.drop_column("orders", "utm_content")
