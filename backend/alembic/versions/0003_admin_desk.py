"""Admin login and the cash-on-delivery desk.

Revision ID: 0003_admin_desk
Revises: 0002_click_ids
Create Date: 2026-11-22 00:00:00

Fresh databases already receive these tables from 0001, because that revision
creates whatever the models define today. Production databases created earlier
do not, so this revision adds only what is missing.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003_admin_desk"
down_revision: Union[str, None] = "0002_click_ids"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "admin_users" not in tables:
        op.create_table(
            "admin_users",
            sa.Column("id", sa.Uuid(), primary_key=True),
            sa.Column("email", sa.String(200), nullable=False),
            sa.Column("password_hash", sa.String(200), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_admin_users_email", "admin_users", ["email"], unique=True)

    if "admin_sessions" not in tables:
        op.create_table(
            "admin_sessions",
            sa.Column("id", sa.Uuid(), primary_key=True),
            sa.Column("user_id", sa.Uuid(), sa.ForeignKey("admin_users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("token_hash", sa.String(64), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_admin_sessions_user_id", "admin_sessions", ["user_id"])
        op.create_index("ix_admin_sessions_token_hash", "admin_sessions", ["token_hash"], unique=True)
        op.create_index("ix_admin_sessions_expires_at", "admin_sessions", ["expires_at"])

    if "order_events" not in tables:
        op.create_table(
            "order_events",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("order_id", sa.Uuid(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
            sa.Column("actor_email", sa.String(200), nullable=False),
            sa.Column("from_status", sa.String(40), nullable=True),
            sa.Column("to_status", sa.String(40), nullable=False),
            sa.Column("note", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_order_events_order_id", "order_events", ["order_id"])
        op.create_index("ix_order_events_created_at", "order_events", ["created_at"])

    if "phone_blacklist" not in tables:
        op.create_table(
            "phone_blacklist",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("phone_e164", sa.String(30), nullable=False),
            sa.Column("reason", sa.String(300), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_phone_blacklist_phone_e164", "phone_blacklist", ["phone_e164"], unique=True)

    order_cols = {column["name"] for column in inspector.get_columns("orders")}
    additions = [
        ("city", sa.Column("city", sa.String(120), nullable=True)),
        ("address", sa.Column("address", sa.String(300), nullable=True)),
        ("call_attempts", sa.Column("call_attempts", sa.Integer(), nullable=False, server_default="0")),
        ("notes", sa.Column("notes", sa.Text(), nullable=True)),
        ("tracking_number", sa.Column("tracking_number", sa.String(80), nullable=True)),
        ("fulfillment_status", sa.Column("fulfillment_status", sa.String(40), nullable=False, server_default="new")),
        ("analytics_session_id", sa.Column("analytics_session_id", sa.String(64), nullable=True)),
    ]
    for name, column in additions:
        if name not in order_cols:
            op.add_column("orders", column)

    indexes = {index["name"] for index in inspector.get_indexes("orders")}
    if "ix_orders_city" not in indexes and "city" not in order_cols:
        op.create_index("ix_orders_city", "orders", ["city"])
    if "ix_orders_fulfillment_status" not in indexes and "fulfillment_status" not in order_cols:
        op.create_index("ix_orders_fulfillment_status", "orders", ["fulfillment_status"])
    if "ix_orders_phone_created" not in indexes:
        op.create_index("ix_orders_phone_created", "orders", ["customer_phone_e164", "created_at"])
    if "ix_orders_analytics_session" not in indexes and "analytics_session_id" not in order_cols:
        op.create_index("ix_orders_analytics_session", "orders", ["analytics_session_id"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    for name in ("phone_blacklist", "order_events", "admin_sessions", "admin_users"):
        if name in tables:
            op.drop_table(name)
    order_cols = {column["name"] for column in inspector.get_columns("orders")}
    for name in (
        "analytics_session_id",
        "fulfillment_status",
        "tracking_number",
        "notes",
        "call_attempts",
        "address",
        "city",
    ):
        if name in order_cols:
            op.drop_column("orders", name)
