import os
import sqlite3
import subprocess
import sys
import uuid
from pathlib import Path


def order_payload(phone: str, name: str) -> dict:
    return {
        "customer_name": name,
        "customer_phone": phone,
        "items": [{"product_slug": "kenidoux-lumba", "offer_id": "lumba-2", "quantity": 1}],
        "event_id": f"evt_purchase_{uuid.uuid4()}",
        "tracking": {"fbp": "fb.1.1.123", "utm_source": "facebook", "utm_campaign": "lumba_broad_ma"},
    }

API = "/api/v1"


def _login(client) -> str:
    from app.services.admin_auth import clear_attempts

    clear_attempts("testclient")
    response = client.post(
        f"{API}/admin/login",
        json={"email": "admin@kinedoux.com", "password": "test-admin-pass"},
    )
    assert response.status_code == 200, response.text
    return response.json()["token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_old_database_gains_the_desk_columns(tmp_path):
    database = tmp_path / "old.db"
    connection = sqlite3.connect(database)
    connection.execute(
        "CREATE TABLE orders (id CHAR(32) PRIMARY KEY, customer_phone_e164 VARCHAR(30), created_at DATETIME)"
    )
    connection.execute("CREATE TABLE alembic_version (version_num VARCHAR(32) NOT NULL)")
    connection.execute("INSERT INTO alembic_version (version_num) VALUES ('0002_click_ids')")
    connection.commit()
    connection.close()

    env = os.environ.copy()
    env["DATABASE_URL"] = f"sqlite:///{database.as_posix()}"
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=Path(__file__).resolve().parents[1],
        env=env,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr
    check = sqlite3.connect(database)
    columns = {row[1] for row in check.execute("PRAGMA table_info(orders)")}
    tables = {row[0] for row in check.execute("SELECT name FROM sqlite_master WHERE type = 'table'")}
    check.close()
    assert {"city", "address", "fulfillment_status", "call_attempts", "notes", "tracking_number"} <= columns
    assert {"admin_users", "admin_sessions", "order_events", "phone_blacklist"} <= tables


def test_login_rejects_a_wrong_password(client):
    from app.services.admin_auth import clear_attempts

    clear_attempts("testclient")
    response = client.post(
        f"{API}/admin/login",
        json={"email": "admin@kinedoux.com", "password": "not-the-password"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_orders_require_a_session(client):
    assert client.get(f"{API}/admin/orders").status_code == 401


def test_login_locks_after_repeated_failures(client):
    from app.services.admin_auth import clear_attempts

    clear_attempts("testclient")
    locked = False
    for _ in range(12):
        response = client.post(
            f"{API}/admin/login",
            json={"email": "admin@kinedoux.com", "password": "wrong-password-12"},
        )
        if response.status_code == 429:
            locked = True
            break
        assert response.status_code == 401
    assert locked
    clear_attempts("testclient")


def test_desk_parses_city_and_enforces_status(client):
    token = _login(client)
    phone = "0691000001"
    created = client.post(
        f"{API}/orders",
        json=order_payload(phone, "يوسف بنعلي — الدار البيضاء — حي الرياض"),
    )
    assert created.status_code == 201, created.text

    listed = client.get(f"{API}/admin/orders", headers=_auth(token), params={"q": phone})
    assert listed.status_code == 200, listed.text
    body = listed.json()
    assert body["total"] >= 1
    row = body["items"][0]
    assert row["status"] == "new"
    assert row["checkout_status"] == "pending_upsell"
    assert row["city"] == "الدار البيضاء"
    assert row["address"] == "حي الرياض"
    assert row["name"] == "يوسف بنعلي"
    assert row["duplicate"] is False
    assert row["blacklisted"] is False
    assert "fbp" not in row and "fbc" not in row

    order_id = row["id"]
    moved = client.patch(
        f"{API}/admin/orders/{order_id}",
        headers=_auth(token),
        json={"status": "no_answer_1"},
    )
    assert moved.status_code == 200, moved.text
    assert moved.json()["status"] == "no_answer_1"
    assert moved.json()["call_attempts"] == 1

    illegal = client.patch(
        f"{API}/admin/orders/{order_id}",
        headers=_auth(token),
        json={"status": "shipped"},
    )
    assert illegal.status_code == 422

    history = client.get(f"{API}/admin/orders/{order_id}/history", headers=_auth(token))
    assert history.status_code == 200
    assert history.json()["items"][0]["to_status"] == "no_answer_1"
    assert history.json()["items"][0]["actor_email"] == "admin@kinedoux.com"


def test_duplicate_and_blacklist_are_flags(client):
    token = _login(client)
    phone = "0691000002"
    first = client.post(f"{API}/orders", json=order_payload(phone, "سلمى — طنجة"))
    second = client.post(f"{API}/orders", json=order_payload(phone, "سلمى — طنجة"))
    assert first.status_code == 201 and second.status_code == 201

    listed = client.get(f"{API}/admin/orders", headers=_auth(token), params={"q": phone})
    items = listed.json()["items"]
    assert len(items) == 2
    assert all(item["duplicate"] is True for item in items)
    assert all(item["status"] == "new" for item in items)

    blocked = client.post(
        f"{API}/admin/blacklist",
        headers=_auth(token),
        json={"phone_e164": "+212691000002", "reason": "test"},
    )
    assert blocked.status_code == 200, blocked.text
    again = client.get(f"{API}/admin/orders", headers=_auth(token), params={"q": phone})
    assert len(again.json()["items"]) == 2
    assert all(item["blacklisted"] is True for item in again.json()["items"])

    exported = client.get(f"{API}/admin/orders/export", headers=_auth(token), params={"q": phone})
    assert exported.status_code == 200
    assert exported.text.startswith("\ufeff")
    assert "طنجة" in exported.text
