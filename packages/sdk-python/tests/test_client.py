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


def test_stable_id_is_deterministic():
    assert stable_id("x", {"b": 1, "a": 2}) == stable_id("x", {"a": 2, "b": 1})
