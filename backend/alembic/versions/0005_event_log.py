"""One event log for the desk. Adds the missing visit and order columns.

Revision ID: 0005_event_log
Revises: 0004_store_tracking

Fresh databases already have these columns because 0001 creates the current
models. This revision adds them only on a database created before that.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005_event_log"
down_revision: Union[str, None] = "0004_store_tracking"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _columns(inspector, table: str) -> set[str]:
    if table not in inspector.get_table_names():
        return set()
    return {column["name"] for column in inspector.get_columns(table)}


def _indexes(inspector, table: str) -> set[str]:
    if table not in inspector.get_table_names():
        return set()
    return {index["name"] for index in inspector.get_indexes(table)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    session_cols = _columns(inspector, "sessions")
    for name, column in (
        ("utm_term", sa.Column("utm_term", sa.String(150), nullable=True)),
        ("ttclid", sa.Column("ttclid", sa.String(255), nullable=True)),
        ("last_utm_source", sa.Column("last_utm_source", sa.String(100), nullable=True)),
        ("last_utm_medium", sa.Column("last_utm_medium", sa.String(100), nullable=True)),
        ("last_utm_campaign", sa.Column("last_utm_campaign", sa.String(150), nullable=True)),
        ("last_utm_content", sa.Column("last_utm_content", sa.String(150), nullable=True)),
        ("last_utm_term", sa.Column("last_utm_term", sa.String(150), nullable=True)),
        ("last_fbclid", sa.Column("last_fbclid", sa.String(2048), nullable=True)),
        ("last_ttclid", sa.Column("last_ttclid", sa.String(255), nullable=True)),
        ("client_ip", sa.Column("client_ip", sa.String(64), nullable=True)),
        ("user_agent", sa.Column("user_agent", sa.Text(), nullable=True)),
    ):
        if session_cols and name not in session_cols:
            op.add_column("sessions", column)

    event_cols = _columns(inspector, "store_events")
    for name, column in (
        ("event_key", sa.Column("event_key", sa.String(64), nullable=True)),
        ("page_url", sa.Column("page_url", sa.Text(), nullable=True)),
        ("referrer", sa.Column("referrer", sa.Text(), nullable=True)),
        ("utm_source", sa.Column("utm_source", sa.String(100), nullable=True)),
        ("utm_medium", sa.Column("utm_medium", sa.String(100), nullable=True)),
        ("utm_campaign", sa.Column("utm_campaign", sa.String(150), nullable=True)),
        ("utm_content", sa.Column("utm_content", sa.String(150), nullable=True)),
        ("utm_term", sa.Column("utm_term", sa.String(150), nullable=True)),
        ("fbclid", sa.Column("fbclid", sa.String(2048), nullable=True)),
        ("ttclid", sa.Column("ttclid", sa.String(255), nullable=True)),
        ("device", sa.Column("device", sa.String(16), nullable=True)),
        ("browser", sa.Column("browser", sa.String(40), nullable=True)),
        ("country", sa.Column("country", sa.String(8), nullable=True)),
        ("city", sa.Column("city", sa.String(120), nullable=True)),
        ("value_mad", sa.Column("value_mad", sa.Integer(), nullable=True)),
        ("metadata", sa.Column("metadata", sa.JSON(), nullable=True)),
    ):
        if event_cols and name not in event_cols:
            op.add_column("store_events", column)
    if event_cols and "ix_store_events_event_key" not in _indexes(inspector, "store_events"):
        op.create_index("ix_store_events_event_key", "store_events", ["event_key"], unique=True)

    order_cols = _columns(inspector, "orders")
    for name, column in (
        ("utm_term", sa.Column("utm_term", sa.String(150), nullable=True)),
        ("visitor_id", sa.Column("visitor_id", sa.String(64), nullable=True)),
        ("is_test", sa.Column("is_test", sa.Boolean(), nullable=False, server_default=sa.false())),
    ):
        if order_cols and name not in order_cols:
            op.add_column("orders", column)
    if order_cols and "ix_orders_visitor_id" not in _indexes(inspector, "orders") and "visitor_id" not in order_cols:
        op.create_index("ix_orders_visitor_id", "orders", ["visitor_id"])
    elif order_cols and "visitor_id" in order_cols and "ix_orders_visitor_id" not in _indexes(inspector, "orders"):
        op.create_index("ix_orders_visitor_id", "orders", ["visitor_id"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    order_cols = _columns(inspector, "orders")
    if "ix_orders_visitor_id" in _indexes(inspector, "orders"):
        op.drop_index("ix_orders_visitor_id", table_name="orders")
    for name in ("is_test", "visitor_id", "utm_term"):
        if name in order_cols:
            op.drop_column("orders", name)

    if "ix_store_events_event_key" in _indexes(inspector, "store_events"):
        op.drop_index("ix_store_events_event_key", table_name="store_events")
    event_cols = _columns(inspector, "store_events")
    for name in (
        "metadata",
        "value_mad",
        "city",
        "country",
        "browser",
        "device",
        "ttclid",
        "fbclid",
        "utm_term",
        "utm_content",
        "utm_campaign",
        "utm_medium",
        "utm_source",
        "referrer",
        "page_url",
        "event_key",
    ):
        if name in event_cols:
            op.drop_column("store_events", name)

    session_cols = _columns(inspector, "sessions")
    for name in (
        "user_agent",
        "client_ip",
        "last_ttclid",
        "last_fbclid",
        "last_utm_term",
        "last_utm_content",
        "last_utm_campaign",
        "last_utm_medium",
        "last_utm_source",
        "ttclid",
        "utm_term",
    ):
        if name in session_cols:
            op.drop_column("sessions", name)
