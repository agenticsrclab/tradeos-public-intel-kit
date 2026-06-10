import json

import pytest

import tradeos_public_intel.client as client_module
from tradeos_public_intel import TradeOSApiError, TradeOSPublicIntelClient, stable_id


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


def test_get_market_digest_builds_query(monkeypatch):
    seen = {}

    def fake_urlopen(request, timeout):
        seen["url"] = request.full_url
        seen["timeout"] = timeout
        return FakeResponse({"schema_version": "tradeos.public_intel.digest_inputs.v1"})

    monkeypatch.setattr(client_module, "urlopen", fake_urlopen)
    client = TradeOSPublicIntelClient(base_url="https://example.test/v1/public-intel", timeout=2.5)

    payload = client.get_market_digest(limit=5, chain_id="8453")

    assert payload["schema_version"] == "tradeos.public_intel.digest_inputs.v1"
    assert "limit=5" in seen["url"]
    assert "chain_id=8453" in seen["url"]
    assert seen["timeout"] == 2.5


def test_get_app_attribution_sends_optional_public_intel_key(monkeypatch):
    seen = {}

    def fake_urlopen(request, timeout):
        seen["url"] = request.full_url
        seen["authorization"] = request.headers.get("Authorization")
        return FakeResponse({"schema_version": "tradeos.public_intel.app_attribution.v1", "valid": True})

    monkeypatch.setattr(client_module, "urlopen", fake_urlopen)
    client = TradeOSPublicIntelClient(base_url="https://example.test/v1/public-intel", api_key="tos_pub_test")

    payload = client.get_app_attribution()

    assert payload["valid"] is True
    assert seen["url"].endswith("/app-attribution")
    assert seen["authorization"] == "Bearer tos_pub_test"


def test_get_feedback_activity_uses_account_auth_and_app_key_header(monkeypatch):
    seen = {}

    def fake_urlopen(request, timeout):
        seen["url"] = request.full_url
        seen["authorization"] = request.headers.get("Authorization")
        seen["app_key"] = request.headers.get("X-tradeos-public-intel-key")
        return FakeResponse({"schema_version": "tradeos.public_intel.feedback_activity.v1", "viewer": "builder_account"})

    monkeypatch.setattr(client_module, "urlopen", fake_urlopen)
    client = TradeOSPublicIntelClient(
        base_url="https://example.test/v1/public-intel",
        api_key="tos_pub_existing",
        account_token="acct_token",
    )

    payload = client.get_feedback_activity(key_id="pubkey_1", status="accepted", source="agent", limit=10)

    assert payload["viewer"] == "builder_account"
    assert seen["url"].startswith("https://example.test/v1/public-intel/feedback-activity?")
    assert "key_id=pubkey_1" in seen["url"]
    assert "status=accepted" in seen["url"]
    assert "source=agent" in seen["url"]
    assert "limit=10" in seen["url"]
    assert seen["authorization"] == "Bearer acct_token"
    assert seen["app_key"] == "tos_pub_existing"


def test_get_app_feedback_status_uses_public_intel_key_auth(monkeypatch):
    seen = {}

    def fake_urlopen(request, timeout):
        seen["url"] = request.full_url
        seen["authorization"] = request.headers.get("Authorization")
        return FakeResponse({"schema_version": "tradeos.public_intel.feedback_activity.v1", "viewer": "app_key"})

    monkeypatch.setattr(client_module, "urlopen", fake_urlopen)
    client = TradeOSPublicIntelClient(base_url="https://example.test/v1/public-intel", api_key="tos_pub_test")

    payload = client.get_app_feedback_status(status="pending", source="automation", limit=5)

    assert payload["viewer"] == "app_key"
    assert seen["url"].startswith("https://example.test/v1/public-intel/app-feedback-status?")
    assert "status=pending" in seen["url"]
    assert "source=automation" in seen["url"]
    assert "limit=5" in seen["url"]
    assert seen["authorization"] == "Bearer tos_pub_test"


def test_create_app_key_uses_account_token_over_app_key(monkeypatch):
    seen = {}

    def fake_urlopen(request, timeout):
        seen["url"] = request.full_url
        seen["authorization"] = request.headers.get("Authorization")
        seen["body"] = json.loads(request.data.decode("utf-8"))
        return FakeResponse({"secret": "tos_pub_created"})

    monkeypatch.setattr(client_module, "urlopen", fake_urlopen)
    client = TradeOSPublicIntelClient(
        base_url="https://example.test/v1/public-intel",
        api_key="tos_pub_existing",
        account_token="acct_token",
    )

    payload = client.create_app_key(app_name="VVV review bot", scopes=["public_intel.feedback:write"])

    assert payload["secret"] == "tos_pub_created"
    assert seen["url"].endswith("/api-keys")
    assert seen["authorization"] == "Bearer acct_token"
    assert seen["body"]["app_name"] == "VVV review bot"
    assert seen["body"]["scopes"] == ["public_intel.feedback:write"]


def test_submit_quota_request_uses_account_token(monkeypatch):
    seen = {}

    def fake_urlopen(request, timeout):
        seen["url"] = request.full_url
        seen["authorization"] = request.headers.get("Authorization")
        seen["body"] = json.loads(request.data.decode("utf-8"))
        return FakeResponse({"status": "submitted"})

    monkeypatch.setattr(client_module, "urlopen", fake_urlopen)
    client = TradeOSPublicIntelClient(
        base_url="https://example.test/v1/public-intel",
        account_token="acct_token",
    )

    payload = client.submit_quota_request(
        project_name="Community Bot",
        app_key_id="pubkey_1",
        use_case="Discord bot with source-backed token summaries and feedback buttons.",
        expected_daily_reads=1500,
        expected_symbols_per_day=80,
        monetization_model="paid community seats",
        feedback_plan="Members can label useful, stale, late, or wrong answers.",
    )

    assert payload["status"] == "submitted"
    assert seen["url"].endswith("/quota-requests")
    assert seen["authorization"] == "Bearer acct_token"
    assert seen["body"]["project_name"] == "Community Bot"
    assert seen["body"]["app_key_id"] == "pubkey_1"
    assert seen["body"]["requested_tier"] == "reviewed_project"


def test_submit_digest_feedback_maps_to_conversions(monkeypatch):
    seen = {}

    def fake_urlopen(request, timeout):
        seen["url"] = request.full_url
        seen["body"] = json.loads(request.data.decode("utf-8"))
        seen["idempotency"] = request.headers.get("Idempotency-key")
        return FakeResponse({"status": "accepted_shadow"})

    monkeypatch.setattr(client_module, "urlopen", fake_urlopen)
    client = TradeOSPublicIntelClient(base_url="https://example.test/v1/public-intel")

    payload = client.submit_digest_feedback(
        target_type="digest",
        target_id="digest_1",
        label="useful",
        feedback_source="automation",
        automation_level="autonomous",
        agent_run_id="run_1",
    )

    assert payload["status"] == "accepted_shadow"
    assert seen["url"].endswith("/conversions")
    assert seen["body"]["event_type"] == "public_intel_feedback"
    assert seen["body"]["target_id"] == "digest_1"
    assert seen["body"]["feedback_source"] == "automation"
    assert seen["body"]["automation_level"] == "autonomous"
    assert seen["body"]["agent_run_id"] == "run_1"
    assert seen["idempotency"]


def test_get_token_watchlist_snapshot_builds_public_query(monkeypatch):
    seen = {}

    def fake_urlopen(request, timeout):
        seen["url"] = request.full_url
        return FakeResponse({"schema_version": "tradeos.public_intel.watchlist_snapshot.v1"})

    monkeypatch.setattr(client_module, "urlopen", fake_urlopen)
    client = TradeOSPublicIntelClient(base_url="https://example.test/v1/public-intel")

    payload = client.get_token_watchlist_snapshot("VVV", mode="trader", chain="8453")

    assert payload["schema_version"] == "tradeos.public_intel.watchlist_snapshot.v1"
    assert seen["url"].endswith("/tokens/VVV/watchlist-snapshot?mode=trader&chain=8453")


def test_get_token_watchlist_snapshot_encodes_path_segments(monkeypatch):
    seen = {}

    def fake_urlopen(request, timeout):
        seen["url"] = request.full_url
        return FakeResponse({"schema_version": "tradeos.public_intel.watchlist_snapshot.v1"})

    monkeypatch.setattr(client_module, "urlopen", fake_urlopen)
    client = TradeOSPublicIntelClient(base_url="https://example.test/v1/public-intel")

    client.get_token_watchlist_snapshot("base/0xabc", mode="trader")

    assert seen["url"].endswith("/tokens/base%2F0xabc/watchlist-snapshot?mode=trader")


def test_get_symbol_cockpit_evidence_aggregates_public_interfaces(monkeypatch):
    seen = []

    def fake_urlopen(request, timeout):
        seen.append(request.full_url)
        return FakeResponse({"schema_version": "ok", "url": request.full_url})

    monkeypatch.setattr(client_module, "urlopen", fake_urlopen)
    client = TradeOSPublicIntelClient(base_url="https://example.test/v1/public-intel")

    payload = client.get_symbol_cockpit_evidence("vvv", mode="trader", chain="8453")

    assert payload["schema_version"] == "tradeos.public_intel.symbol_cockpit_evidence.v1"
    assert payload["symbol"] == "VVV"
    assert "watchlist_snapshot" in payload["sources"]
    assert any("/digest-inputs?limit=10&chain_id=8453" in url for url in seen)


def test_create_watchlist_uses_account_auth_and_app_key_header(monkeypatch):
    seen = {}

    def fake_urlopen(request, timeout):
        seen["url"] = request.full_url
        seen["authorization"] = request.headers.get("Authorization")
        seen["app_key"] = request.headers.get("X-tradeos-public-intel-key")
        seen["body"] = json.loads(request.data.decode("utf-8"))
        return FakeResponse({"watchlist": {"watchlist_id": "wl_1"}})

    monkeypatch.setattr(client_module, "urlopen", fake_urlopen)
    client = TradeOSPublicIntelClient(
        base_url="https://example.test/v1/public-intel",
        api_key="tos_pub_test",
        account_token="acct_token",
    )

    payload = client.create_watchlist(name="Portfolio risk")

    assert payload["watchlist"]["watchlist_id"] == "wl_1"
    assert seen["url"].endswith("/watchlists")
    assert seen["authorization"] == "Bearer acct_token"
    assert seen["app_key"] == "tos_pub_test"
    assert seen["body"]["name"] == "Portfolio risk"
    assert seen["body"]["mode"] == "investor"


def test_submit_watchlist_feedback_uses_account_auth_and_app_key_header(monkeypatch):
    seen = {}

    def fake_urlopen(request, timeout):
        seen["url"] = request.full_url
        seen["authorization"] = request.headers.get("Authorization")
        seen["app_key"] = request.headers.get("X-tradeos-public-intel-key")
        seen["body"] = json.loads(request.data.decode("utf-8"))
        return FakeResponse({"status": "accepted", "feedback_id": "pifb_1"})

    monkeypatch.setattr(client_module, "urlopen", fake_urlopen)
    client = TradeOSPublicIntelClient(
        base_url="https://example.test/v1/public-intel",
        api_key="tos_pub_test",
        account_token="acct_token",
    )

    payload = client.submit_watchlist_feedback(
        watchlist_id="wl_1",
        target_type="watchlist_event",
        target_id="wle_1",
        label="useful",
        optional_note="timely alert",
    )

    assert payload["feedback_id"] == "pifb_1"
    assert seen["url"].endswith("/watchlists/wl_1/feedback")
    assert seen["authorization"] == "Bearer acct_token"
    assert seen["app_key"] == "tos_pub_test"
    assert seen["body"]["target_id"] == "wle_1"
    assert seen["body"]["label"] == "useful"
    assert seen["body"]["notes"] == "timely alert"


def test_trigger_watchlist_deliveries_uses_account_auth_and_app_key_header(monkeypatch):
    seen = {}

    def fake_urlopen(request, timeout):
        seen["url"] = request.full_url
        seen["authorization"] = request.headers.get("Authorization")
        seen["app_key"] = request.headers.get("X-tradeos-public-intel-key")
        seen["body"] = json.loads(request.data.decode("utf-8"))
        return FakeResponse({"schema_version": "tradeos.public_intel.watchlist_deliveries.v1", "deliveries": []})

    monkeypatch.setattr(client_module, "urlopen", fake_urlopen)
    client = TradeOSPublicIntelClient(
        base_url="https://example.test/v1/public-intel",
        api_key="tos_pub_test",
        account_token="acct_token",
    )

    payload = client.trigger_watchlist_deliveries("wl_1", channel_kinds=["in_app"], min_severity="watch")

    assert payload["schema_version"] == "tradeos.public_intel.watchlist_deliveries.v1"
    assert seen["url"].endswith("/watchlists/wl_1/deliveries/trigger")
    assert seen["authorization"] == "Bearer acct_token"
    assert seen["app_key"] == "tos_pub_test"
    assert seen["body"]["channel_kinds"] == ["in_app"]
    assert seen["body"]["min_severity"] == "watch"


def test_stable_id_is_deterministic():
    assert stable_id("x", {"b": 1, "a": 2}) == stable_id("x", {"a": 2, "b": 1})
