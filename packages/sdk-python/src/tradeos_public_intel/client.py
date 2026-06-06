from __future__ import annotations

import hashlib
import json
import os
import uuid
from datetime import UTC, datetime
from typing import Any
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

DEFAULT_BASE_URL = "https://api.tradeos.tech/v1/public-intel"


class TradeOSApiError(RuntimeError):
    def __init__(self, message: str, status: int, body: Any | None = None) -> None:
        super().__init__(message)
        self.status = status
        self.body = body


class TradeOSPublicIntelClient:
    def __init__(
        self,
        *,
        base_url: str | None = None,
        api_key: str | None = None,
        account_token: str | None = None,
        app_name: str = "tradeos-public-intel-python",
        app_version: str = "0.1.0",
        timeout: float = 10.0,
    ) -> None:
        self.base_url = (base_url or os.getenv("TRADEOS_API_BASE") or DEFAULT_BASE_URL).rstrip("/")
        self.api_key = api_key if api_key is not None else os.getenv("TRADEOS_PUBLIC_INTEL_KEY")
        self.account_token = account_token if account_token is not None else os.getenv("TRADEOS_ACCOUNT_TOKEN")
        self.app_name = app_name
        self.app_version = app_version
        self.timeout = timeout

    def sources_health(self) -> dict[str, Any]:
        return self._get("/sources/health")

    def get_app_attribution(self) -> dict[str, Any]:
        return self._get("/app-attribution")

    def create_app_key(
        self,
        *,
        app_name: str,
        scopes: list[str] | None = None,
        expires_at: str | None = None,
        account_token: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {"app_name": app_name}
        if scopes is not None:
            payload["scopes"] = scopes
        if expires_at:
            payload["expires_at"] = expires_at
        return self._post("/api-keys", payload, authorization_token=self._require_account_token(account_token))

    def list_app_keys(self, *, account_token: str | None = None) -> dict[str, Any]:
        return self._get("/api-keys", authorization_token=self._require_account_token(account_token))

    def revoke_app_key(self, key_id: str, *, account_token: str | None = None) -> dict[str, Any]:
        return self._request(
            "DELETE",
            f"/api-keys/{key_id}",
            authorization_token=self._require_account_token(account_token),
        )

    def get_market_digest(
        self,
        *,
        limit: int | None = None,
        chain_id: str | None = None,
        window_start: str | None = None,
        window_end: str | None = None,
    ) -> dict[str, Any]:
        return self._get(
            "/digest-inputs",
            {
                "limit": limit,
                "chain_id": chain_id,
                "window_start": window_start,
                "window_end": window_end,
            },
        )

    def get_public_candidates(
        self,
        *,
        limit: int | None = None,
        chain_id: str | None = None,
        since: str | None = None,
    ) -> dict[str, Any]:
        return self._get("/candidates", {"limit": limit, "chain_id": chain_id, "since": since})

    def get_thesis_watchlist(
        self,
        *,
        limit: int | None = None,
        chain_id: str | None = None,
    ) -> dict[str, Any]:
        return self._get("/thesis-watchlist", {"limit": limit, "chain_id": chain_id})

    def get_thesis(self, thesis_id: str) -> dict[str, Any]:
        return self._get(f"/theses/{thesis_id}")

    def get_thesis_feedback(
        self,
        *,
        source_service: str | None = None,
        thesis_type: str | None = None,
        subject: str | None = None,
        horizon_seconds: int | None = None,
    ) -> dict[str, Any]:
        return self._get(
            "/thesis-feedback",
            {
                "source_service": source_service,
                "thesis_type": thesis_type,
                "subject": subject,
                "horizon_seconds": horizon_seconds,
            },
        )

    def get_public_claim_proof(self, public_claim_id: str) -> dict[str, Any]:
        return self._get(f"/proofs/{public_claim_id}")

    def write_claim(
        self,
        payload: dict[str, Any],
        *,
        idempotency_key_value: str | None = None,
    ) -> dict[str, Any]:
        return self._post("/claims", payload, idempotency_key_value=idempotency_key_value)

    def submit_digest_feedback(
        self,
        *,
        target_type: str,
        target_id: str,
        label: str,
        optional_note: str = "",
        consent_for_dataset_use: bool = False,
        anonymous_session_id_or_user_id: str = "",
        source_snapshot_refs: list[str] | None = None,
        occurred_at: str | None = None,
        feedback_source: str = "",
        automation_level: str = "",
        agent_id: str = "",
        agent_run_id: str = "",
        agent_model: str = "",
        agent_confidence: float | None = None,
        provenance_note: str = "",
        idempotency_key_value: str | None = None,
    ) -> dict[str, Any]:
        timestamp = occurred_at or now_iso()
        payload = {
            "event_id": stable_id("digest_feedback", [target_type, target_id, label, timestamp]),
            "event_type": "public_intel_feedback",
            "target_type": target_type,
            "target_id": target_id,
            "label": label,
            "optional_note": optional_note,
            "consent_for_dataset_use": consent_for_dataset_use,
            "anonymous_session_id_or_user_id": anonymous_session_id_or_user_id,
            "client_app": self.app_name,
            "client_version": self.app_version,
            "source_snapshot_refs": source_snapshot_refs or [],
            "occurred_at": timestamp,
        }
        payload.update(
            feedback_provenance(
                feedback_source=feedback_source,
                automation_level=automation_level,
                agent_id=agent_id,
                agent_run_id=agent_run_id,
                agent_model=agent_model,
                agent_confidence=agent_confidence,
                provenance_note=provenance_note,
            )
        )
        return self._post("/conversions", payload, idempotency_key_value=idempotency_key_value)

    def submit_thesis_feedback(
        self,
        *,
        thesis_id: str,
        target_id: str,
        label: str,
        optional_note: str = "",
        consent_for_dataset_use: bool = False,
        anonymous_session_id_or_user_id: str = "",
        source_snapshot_refs: list[str] | None = None,
        occurred_at: str | None = None,
        feedback_source: str = "",
        automation_level: str = "",
        agent_id: str = "",
        agent_run_id: str = "",
        agent_model: str = "",
        agent_confidence: float | None = None,
        provenance_note: str = "",
        idempotency_key_value: str | None = None,
    ) -> dict[str, Any]:
        timestamp = occurred_at or now_iso()
        provenance = feedback_provenance(
            feedback_source=feedback_source,
            automation_level=automation_level,
            agent_id=agent_id,
            agent_run_id=agent_run_id,
            agent_model=agent_model,
            agent_confidence=agent_confidence,
            provenance_note=provenance_note,
        )
        payload = {
            "event_id": stable_id("thesis_feedback", [thesis_id, label, timestamp]),
            "thesis_id": thesis_id,
            "event_type": "outcome_observed",
            "source_service": "tradeos-public-intel-kit",
            "source_endpoint": "python.submit_thesis_feedback",
            "source_snapshot_refs": source_snapshot_refs or [],
            "thesis_feedback_status": label,
            "outcome_class": label,
            "event_json": {
                "target_type": "thesis",
                "target_id": target_id,
                "label": label,
                "optional_note": optional_note,
                "consent_for_dataset_use": consent_for_dataset_use,
                "anonymous_session_id_or_user_id": anonymous_session_id_or_user_id,
                "client_app": self.app_name,
                "client_version": self.app_version,
                **provenance,
            },
            "occurred_at": timestamp,
        }
        return self._post("/thesis-outcomes", payload, idempotency_key_value=idempotency_key_value)

    def _get(
        self,
        path: str,
        query: dict[str, Any] | None = None,
        *,
        authorization_token: str | None = None,
    ) -> dict[str, Any]:
        return self._request("GET", path, query=query, authorization_token=authorization_token)

    def _post(
        self,
        path: str,
        payload: dict[str, Any],
        *,
        idempotency_key_value: str | None = None,
        authorization_token: str | None = None,
    ) -> dict[str, Any]:
        return self._request(
            "POST",
            path,
            payload=payload,
            idempotency_key_value=idempotency_key_value,
            authorization_token=authorization_token,
        )

    def _request(
        self,
        method: str,
        path: str,
        *,
        query: dict[str, Any] | None = None,
        payload: dict[str, Any] | None = None,
        idempotency_key_value: str | None = None,
        authorization_token: str | None = None,
    ) -> dict[str, Any]:
        url = f"{self.base_url}{path}"
        filtered_query = {
            key: value for key, value in (query or {}).items() if value is not None and str(value) != ""
        }
        if filtered_query:
            url = f"{url}?{urlencode(filtered_query)}"
        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        headers = {
            "accept": "application/json",
            "user-agent": f"{self.app_name}/{self.app_version}",
        }
        if payload is not None:
            headers["content-type"] = "application/json"
            headers["idempotency-key"] = idempotency_key_value or idempotency_key()
        if authorization_token:
            headers["authorization"] = f"Bearer {authorization_token}"
        elif self.api_key:
            headers["authorization"] = f"Bearer {self.api_key}"
        request = Request(url, data=body, headers=headers, method=method)
        try:
            with urlopen(request, timeout=self.timeout) as response:
                raw = response.read().decode("utf-8")
                data = json.loads(raw) if raw else {}
        except HTTPError as exc:
            raw = exc.read().decode("utf-8")
            try:
                body_data: Any = json.loads(raw)
            except json.JSONDecodeError:
                body_data = raw
            raise TradeOSApiError(
                f"TradeOS public intelligence request failed: {exc.code} {exc.reason}",
                exc.code,
                body_data,
            ) from exc
        if not isinstance(data, dict):
            raise TradeOSApiError("TradeOS public intelligence response was not a JSON object", 200, data)
        return data

    def _require_account_token(self, override: str | None = None) -> str:
        token = override or self.account_token
        if not token:
            raise RuntimeError("TRADEOS_ACCOUNT_TOKEN or account_token is required for app-key management.")
        return token


def stable_id(prefix: str, value: Any) -> str:
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), default=str).encode("utf-8")
    digest = hashlib.sha256(encoded).hexdigest()[:24]
    return f"{prefix}_{digest}"


def idempotency_key(prefix: str = "tradeos_public_intel") -> str:
    return f"{prefix}_{uuid.uuid4()}"


def now_iso() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def feedback_provenance(
    *,
    feedback_source: str = "",
    automation_level: str = "",
    agent_id: str = "",
    agent_run_id: str = "",
    agent_model: str = "",
    agent_confidence: float | None = None,
    provenance_note: str = "",
) -> dict[str, Any]:
    payload: dict[str, Any] = {}
    optional_values: dict[str, Any] = {
        "feedback_source": feedback_source,
        "automation_level": automation_level,
        "agent_id": agent_id,
        "agent_run_id": agent_run_id,
        "agent_model": agent_model,
        "agent_confidence": agent_confidence,
        "provenance_note": provenance_note,
    }
    for key, value in optional_values.items():
        if value is None or value == "":
            continue
        payload[key] = value
    return payload
