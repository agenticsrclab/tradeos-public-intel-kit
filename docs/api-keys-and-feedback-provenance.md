# API Keys And Feedback Provenance

This kit supports optional API-key usage and feedback attribution. TradeOS
issues public-intel app keys for signed-in builder accounts. The normal path is
the TradeOS Developer Keys dashboard. The SDKs and CLI can also call the issuer
for trusted automation when you provide `TRADEOS_ACCOUNT_TOKEN`; they do not
perform TradeOS login/device auth yet.

For a short builder-facing setup path, see
[Getting API Keys And Requesting Scale](getting-api-keys-and-scale.md).

## API Key Issuance

Current state:

```text
Public reads: keyless by default
SDK/CLI/MCP: can send TRADEOS_PUBLIC_INTEL_KEY if one is issued
Dashboard key management: create/list/rotate/revoke from Developer Keys
SDK/CLI key management: available with TRADEOS_ACCOUNT_TOKEN
Public-intel key issuer: available from the TradeOS API for signed-in builders
x402: available for paid machine resources through explicit payment flows
```

Recommended dashboard flow:

```text
1. Sign up or sign in to TradeOS.
2. Verify your email.
3. Open Developer Keys.
4. Create a public-intel app key for the builder app.
5. Copy the returned secret once into the app server environment.
```

The CLI exposes `tradeos-intel auth` to show whether a key is configured and to
call the live app-attribution endpoint when the API is reachable. It also
supports key management when `TRADEOS_ACCOUNT_TOKEN` is set:

```bash
tradeos-intel keys create --app-name my-public-intel-app
tradeos-intel keys list
tradeos-intel keys revoke --key-id pubkey_...
```

TradeOS app-key management lives under the public-intel API:

```text
POST   /v1/public-intel/api-keys        create key for a builder app/account
GET    /v1/public-intel/api-keys        list non-secret key metadata
POST   /v1/public-intel/api-keys/{id}/rotate rotate secret and return it once
DELETE /v1/public-intel/api-keys/{id}   revoke key
GET    /v1/public-intel/app-attribution validate optional bearer app key
GET    /v1/public-intel/feedback-activity inspect builder-owned app-key feedback lifecycle
GET    /v1/public-intel/app-feedback-status inspect the authenticated app key's feedback lifecycle
POST   /v1/public-intel/quota-requests request reviewed quota or paid evaluation
```

Key creation and revocation require a signed-in TradeOS account bearer token.
The app-key secret is returned once at creation or rotation and should be kept
server-side. Existing secrets are not retrievable from TradeOS. Public examples
continue to work without it.

## Getting TRADEOS_ACCOUNT_TOKEN

`TRADEOS_ACCOUNT_TOKEN` is the TradeOS account JWT returned by production auth
after login. It is not a static project secret and should not be committed.

Production hosts:

```text
Auth/login: https://tradeos.tech/api/alpha
Public intel: https://api.tradeos.tech/v1/public-intel
```

Dashboard path:

```text
1. Sign up or sign in at https://tradeos.tech/signup or https://tradeos.tech/signin.
2. Verify the email from the inbox.
3. Open Developer Keys and create a public-intel app key.
4. Store the returned TRADEOS_PUBLIC_INTEL_KEY in your server environment.
```

Direct API path for scripts:

```bash
export TRADEOS_EMAIL=your-email@example.com
read -s TRADEOS_PASSWORD

curl -sS https://tradeos.tech/api/alpha/signup \
  -H "content-type: application/json" \
  -d "{\"email\":\"$TRADEOS_EMAIL\",\"password\":\"$TRADEOS_PASSWORD\"}"

# After opening the email verification link:
export TRADEOS_ACCOUNT_TOKEN="$(
  curl -sS https://tradeos.tech/api/alpha/login \
    -H "content-type: application/json" \
    -d "{\"email\":\"$TRADEOS_EMAIL\",\"password\":\"$TRADEOS_PASSWORD\"}" \
  | jq -r .access_token
)"
```

Minimal direct API shape:

```bash
export TRADEOS_API_BASE=https://api.tradeos.tech/v1/public-intel
curl -X POST "$TRADEOS_API_BASE/api-keys" \
  -H "authorization: Bearer $TRADEOS_ACCOUNT_TOKEN" \
  -H "content-type: application/json" \
  -d '{"app_name":"my-public-intel-app"}'
```

The response contains `secret` once. Configure that value as
`TRADEOS_PUBLIC_INTEL_KEY` in server-side SDK, MCP, or CLI environments.

## Abuse Controls

TradeOS protects public-intel key creation and write paths. Builders should
expect these guardrails:

```text
email verification required for app-key creation
maximum active app keys per account
per-account and per-network key creation velocity limits
per-key feedback/write velocity limits
anonymous/keyless write velocity limits
revoked, suspended, and expired app keys rejected on writes
read quotas by anonymous, starter, baseline, earned, reviewed, and limited profile
operator review for higher public quota
```

Common responses:

| Status | Meaning | Builder Action |
| --- | --- | --- |
| 401 | invalid public-intel app key | rotate or remove the key |
| 403 | email verification required, key revoked, key suspended, or key expired | verify account or contact TradeOS |
| 409 | active key limit reached | revoke an unused key |
| 429 | key creation or write rate limit reached | respect `Retry-After` and back off |

More detail: [Distribution Setup Guide](distribution-setup-guide.md)

## App Quota Profiles

An app key is an attribution and reputation key. It is not a paid API key.

| Profile | Reads/min | Reads/hour | Reads/day | Symbols/day | Meaning |
| --- | ---: | ---: | ---: | ---: | --- |
| Anonymous preview | 2 | 15 | 40 | 5 | no app key |
| Builder baseline | 5 | 50 | 100 | 10 | starter expired without useful feedback |
| Builder starter | 15 | 150 | 400 | 30 | first 7 days of a verified app key |
| Builder earned | 15 | 150 | 400 | 30 | useful feedback refreshed quota |
| Reviewed project | 30 | 300 | 800 | 60 | manually approved app |
| Limited app | 5 | 50 | 100 | 10 | reputation or operator-limited app |

Every public read response includes the active profile:

```text
access_control.rate_limit_status.quota_profile
access_control.quota_policy.refresh_reason
access_control.quota_policy.review_request_endpoint
```

Earned quota requires useful recent app-attributed feedback. The default policy
requires at least 5 feedback events in 7 days with a suppressed-feedback ratio
below 25 percent.

Builders can inspect the feedback rows that affect app reputation:

```bash
curl -sS "$TRADEOS_API_BASE/feedback-activity?key_id=pubkey_...&status=all&source=all" \
  -H "authorization: Bearer $TRADEOS_ACCOUNT_TOKEN"

curl -sS "$TRADEOS_API_BASE/app-feedback-status?status=accepted&source=agent" \
  -H "authorization: Bearer $TRADEOS_PUBLIC_INTEL_KEY"
```

`feedback-activity` is scoped to app keys owned by the signed-in builder
account. `app-feedback-status` is scoped to the authenticated public-intel app
key. Both responses expose `app_reputation_dti`, per-row lifecycle state, and
policy flags that confirm app feedback is not a personal user balance, not
API-convertible, and not paid capacity.

To request more before buying:

```bash
curl -X POST "$TRADEOS_API_BASE/quota-requests" \
  -H "authorization: Bearer $TRADEOS_ACCOUNT_TOKEN" \
  -H "content-type: application/json" \
  -d '{
    "project_name": "community-market-bot",
    "app_key_id": "pubkey_...",
    "requested_tier": "reviewed_project",
    "use_case": "Discord bot with source-backed token summaries and feedback buttons.",
    "expected_daily_reads": 1500,
    "expected_symbols_per_day": 80,
    "monetization_model": "paid community bot seats",
    "feedback_plan": "Members can mark useful, stale, late, wrong, or missing-context answers.",
    "paid_intent": "will use x402 for alerting and higher scale"
  }'
```

The CLI wraps the same endpoint:

```bash
tradeos-intel quota request \
  --project-name community-market-bot \
  --app-key-id pubkey_... \
  --use-case "Discord bot with source-backed token summaries and feedback buttons." \
  --reads 1500 \
  --symbols 80 \
  --feedback-plan "Members can mark useful, stale, late, wrong, or missing context." \
  --paid-intent "Will use x402 for alerts and higher scale."
```

Approval is manual. TradeOS can approve reviewed-project quota, keep the app at
baseline, limit or suspend abusive usage, or move the builder to paid/x402 access
for scale.

## Attribution Without A Key

Even without an API key, feedback writes carry attribution fields:

```text
client_app
client_version
anonymous_session_id_or_user_id
source_snapshot_refs
idempotency_key
feedback_source
automation_level
agent_id
agent_run_id
agent_model
agent_confidence
provenance_note
```

These fields help TradeOS understand whether a label came from a person, an
agent, or a fully automated process.

## Feedback Source Classes

| Source | Meaning | Credit Treatment | Value To TradeOS |
| --- | --- | --- | --- |
| `human` | a person reviewed and labeled the intelligence | GUI human feedback can be eligible for human DTI; public-intel API feedback affects app reputation by default | high-quality judgment, UX signal |
| `human_assisted` | an agent suggested or summarized, but a person confirmed | app reputation and quota-confidence signal by default unless future policy links it to verified human DTI | strong signal with provenance |
| `agent` | an LLM/agent generated the label without direct human confirmation | app reputation after validation; no personal user credit | scale, disagreement detection, model-quality signal |
| `automation` | deterministic bot/job/rule emitted feedback | telemetry by default; app reputation only after calibration | monitoring, regression detection, outcome telemetry |
| `hybrid` | mixed workflow with unclear boundary | conservative app-reputation treatment until clarified | useful but should be sampled/audited |

Clients can report provenance, but they cannot choose their own credit class.
TradeOS should compute credit weight server-side.

## Credit And Access Policy

TradeOS uses scoped credit treatment because agentic feedback can be
high-volume, copied, or self-referential.

| Feedback Class | Credit treatment | Access effect | Notes |
| --- | --- | --- | --- |
| signed-in GUI human | pending human DTI when eligible; spendable only after Feedback Ops accepts it | temporary public dashboard depth, public Ask packs, or read-only Review Lab where enabled | current personal-credit path |
| public-intel API human or human-assisted | app reputation and quota-confidence signal by default | may support earned public app quota after validation | does not mint personal DTI without future explicit policy |
| unlinked human/anonymous | quality signal only until linked | none or later reconciliation | can backfill provenance, but not spendable credit by itself |
| verified agent | app reputation or quota confidence, not personal credit | may support earned public app quota after calibration | useful for builders and QA |
| raw automation | telemetry by default; zero-weight for earned app reputation until trusted | none by default | store as telemetry until trust is established |
| spam/looped automation | no credit | none | rate-limit, suppress, or ignore |

Agent and automation feedback is still valuable. It can identify stale evidence,
find confusing explanations, measure model disagreement, and produce product
analytics. It should be weighted separately from human judgment and should not
unlock paid API calls, x402 resources, execution, exports, or private forecasts.

## CLI Examples

Check attribution status:

```bash
tradeos-intel auth
```

Human feedback:

```bash
tradeos-intel feedback \
  --target-id digest_123 \
  --label useful \
  --feedback-source human \
  --anonymous-session-id user_abc
```

Agent feedback:

```bash
tradeos-intel feedback \
  --target-id digest_123 \
  --label evidence_too_thin \
  --feedback-source agent \
  --automation-level autonomous \
  --agent-id market-review-agent \
  --agent-run-id run_2026_06_06_001 \
  --agent-model z-ai-glm-5-turbo
```

Automation feedback:

```bash
tradeos-intel feedback \
  --target-id thesis_456 \
  --target-type thesis \
  --label too_late \
  --feedback-source automation \
  --automation-level automated \
  --provenance-note "Scheduled outcome check after 24h move window"
```
