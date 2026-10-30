"""Test harness.

Spins up a real PostgreSQL (embedded `pgserver`, dev-only) and a fake Google Apps Script endpoint that
answers POST with a 302 redirect exactly like production, then boots the real app on top of them.
Falls back to SQLite when `pgserver` is not installed.
"""

import json
import os
import subprocess
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

SHEET_CALLS: list[dict] = []


class _FakeAppsScript(BaseHTTPRequestHandler):
    def do_POST(self):  # noqa: N802
        length = int(self.headers.get("content-length", 0))
        SHEET_CALLS.append(json.loads(self.rfile.read(length) or b"{}"))
        self.send_response(302)
        self.send_header("Location", "/done")
        self.end_headers()

    def do_GET(self):  # noqa: N802
        body = json.dumps({"status": "success"}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):  # silence
        pass


@pytest.fixture(scope="session")
def database_url():
    try:
        import pgserver
    except ImportError:
        path = Path(tempfile.mkdtemp()) / "test.db"
        yield f"sqlite:///{path.as_posix()}"
        return

    import psycopg2

    server = pgserver.get_server(tempfile.mkdtemp(), cleanup_mode="stop")
    admin_uri = server.get_uri()  # postgresql://postgres:@127.0.0.1:PORT/postgres
    host_port = admin_uri.split("@", 1)[1].split("/", 1)[0]
    conn = psycopg2.connect(admin_uri)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("CREATE ROLE kenidoux LOGIN SUPERUSER PASSWORD 'kenidoux'")
    cur.execute("CREATE DATABASE namabeauty OWNER kenidoux")
    conn.close()
    # exact shape EasyPanel hands out (postgres:// + sslmode=disable)
    yield f"postgres://kenidoux:kenidoux@{host_port}/namabeauty?sslmode=disable"
    server.cleanup()


@pytest.fixture(scope="session")
def sheet_server():
    httpd = HTTPServer(("127.0.0.1", 0), _FakeAppsScript)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{httpd.server_port}/exec"
    httpd.shutdown()


@pytest.fixture(scope="session", autouse=True)
def _bootstrap(database_url, sheet_server):
    """Runs before ANY test so app.config is first imported with the test environment."""
    os.environ.update(
        APP_ENV="test",
        DATABASE_URL=database_url,
        GOOGLE_SHEETS_WEBHOOK_URL=sheet_server,
        GOOGLE_SHEETS_WEBHOOK_SECRET="s3cret",
        UPSELL_AUTO_FINALIZE_SECONDS="2",
        PHONE_VALIDATION_MODE="BOTH",
        SITE_URL="https://kenidoux.com",
        META_PIXEL_ID="",
        TIKTOK_PIXEL_ID="",
        SNAP_PIXEL_ID="",
    )
    # 1) real Alembic migration, exactly what entrypoint.sh runs
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=BACKEND_DIR,
        env=os.environ.copy(),
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr


@pytest.fixture(scope="session")
def client(_bootstrap):
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as c:  # runs lifespan: create_all fallback + seed + sweeper
        yield c


@pytest.fixture()
def sheet_calls():
    SHEET_CALLS.clear()
    return SHEET_CALLS
