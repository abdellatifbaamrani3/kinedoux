import uuid

API = "/api/v1"
VISITOR = "a1b2c3d4e5f67890"
SESSION = "b1b2c3d4e5f67890"


def _login(client) -> dict:
    from app.services.admin_auth import clear_attempts

    clear_attempts("testclient")
    response = client.post(f"{API}/admin/login", json={"email": "admin@kinedoux.com", "password": "test-admin-pass"})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['token']}"}


def _visit(client, event: str, visitor: str = VISITOR, session: str = SESSION, **extra):
    body = {
        "visitor_id": visitor,
        "session_id": session,
        "event": event,
        "path": "/products/kenidoux-lumba",
        "utm_source": "facebook",
        "utm_campaign": "lumba_broad_ma",
        "utm_content": "v1",
        "fbclid": "AbC+keep",
    }
    body.update(extra)
    return client.post(f"{API}/track", json=body, headers={"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"})


def test_bots_and_admin_visits_are_ignored(client):
    bot = client.post(
        f"{API}/track",
        json={"visitor_id": VISITOR, "session_id": SESSION, "event": "page_view"},
        headers={"User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)"},
    )
    assert bot.status_code == 202 and bot.json()["stored"] is False
    own = client.post(
        f"{API}/track",
        json={"visitor_id": VISITOR, "session_id": SESSION, "event": "page_view"},
        headers={"User-Agent": "Mozilla/5.0", "Cookie": "kd_admin=desk"},
    )
    assert own.status_code == 202 and own.json()["ignored"] is True


def test_visit_is_stored_and_order_keeps_the_campaign(client):
    auth = _login(client)
    before = client.get(f"{API}/admin/metrics", params={"range": "today"}, headers=auth).json()
    first = _visit(client, "page_view")
    second = _visit(client, "page_view")
    product = _visit(client, "product_view", product_slug="kenidoux-lumba")
    checkout = _visit(client, "checkout_started", product_slug="kenidoux-lumba")
    assert first.status_code == 202 and first.json()["stored"] is True
    assert second.json()["stored"] is True and product.json()["stored"] is True and checkout.json()["stored"] is True

    created = client.post(
        f"{API}/orders",
        json={
            "customer_name": "هند — الرباط",
            "customer_phone": "0691000099",
            "items": [{"product_slug": "kenidoux-lumba", "offer_id": "lumba-2", "quantity": 1}],
            "event_id": f"evt_purchase_{uuid.uuid4()}",
            "tracking": {"visitor_id": VISITOR, "session_id": SESSION, "page_url": "https://kinedoux.com/products/kenidoux-lumba"},
        },
    )
    assert created.status_code == 201, created.text

    listed = client.get(f"{API}/admin/orders", headers=auth, params={"q": "0691000099"})
    row = listed.json()["items"][0]
    assert row["campaign"] == "lumba_broad_ma"
    assert row["status"] == "new"

    after = client.get(f"{API}/admin/metrics", params={"range": "today"}, headers=auth).json()
    assert after["traffic"]["page_views"] == before["traffic"]["page_views"] + 2
    assert after["traffic"]["visitors"] == before["traffic"]["visitors"] + 1
    assert after["traffic"]["sessions"] == before["traffic"]["sessions"] + 1
    assert after["pipeline"]["orders"] == before["pipeline"]["orders"] + 1
    steps = {step["step"]: step["count"] for step in after["funnel"]}
    assert steps["visitors"] >= 1
    assert steps["product_views"] <= steps["visitors"]
    assert steps["checkout_starts"] <= steps["product_views"]
    assert steps["orders"] <= steps["checkout_starts"]
    assert steps["orders"] >= 1
    assert after["conversion_rate"] is not None and after["conversion_rate"] <= 100
    assert after["untracked_orders"] == before.get("untracked_orders", 0)


def test_duplicate_event_and_untracked_order(client):
    auth = _login(client)
    event_id = "a1b2c3d4e5"
    first = _visit(client, "page_view", event_id=event_id)
    second = _visit(client, "page_view", event_id=event_id)
    assert first.json()["stored"] is True
    assert second.json()["stored"] is False
    created = client.post(
        f"{API}/orders",
        json={
            "customer_name": "هند — الرباط",
            "customer_phone": "0691000088",
            "items": [{"product_slug": "kenidoux-lumba", "offer_id": "lumba-1", "quantity": 1}],
            "event_id": f"evt_purchase_{uuid.uuid4()}",
            "tracking": {},
        },
    )
    assert created.status_code == 201, created.text
    report = client.get(f"{API}/admin/metrics", params={"range": "today"}, headers=auth).json()
    assert report["untracked_orders"] >= 1
    assert report["conversion_rate"] is None or report["conversion_rate"] <= 100
    counts = [step["count"] for step in report["funnel"]]
    assert counts == sorted(counts, reverse=True)


def test_admin_path_and_test_order_are_excluded(client):
    auth = _login(client)
    before = client.get(f"{API}/admin/metrics", params={"range": "today"}, headers=auth).json()
    hidden = client.post(
        f"{API}/track",
        json={"visitor_id": VISITOR, "session_id": SESSION, "event": "page_view", "path": "/admin/orders"},
        headers={"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"},
    )
    assert hidden.json()["stored"] is False
    created = client.post(
        f"{API}/orders",
        json={
            "customer_name": "هند — الرباط",
            "customer_phone": "0691000077",
            "items": [{"product_slug": "kenidoux-lumba", "offer_id": "lumba-1", "quantity": 1}],
            "event_id": f"evt_purchase_{uuid.uuid4()}",
            "tracking": {"visitor_id": VISITOR, "session_id": SESSION, "is_test": True},
        },
    )
    assert created.status_code == 201, created.text
    after = client.get(f"{API}/admin/metrics", params={"range": "today"}, headers=auth).json()
    assert after["pipeline"]["orders"] == before["pipeline"]["orders"]
