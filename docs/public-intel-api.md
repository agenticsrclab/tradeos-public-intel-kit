# TradeOS Public Intelligence API

Default public base URL:

```text
https://api.tradeos.tech/v1/public-intel
```

For local TradeOS core development, point `TRADEOS_API_BASE` at the local
metrics-api public-intel route. Do not publish local origins in consumer app
configuration.

## Read Endpoints

```text
GET /sources/health
GET /digest-inputs
GET /candidates
GET /thesis-candidates
GET /thesis-checkpoint-candidates
GET /thesis-outcome-followup-candidates
GET /thesis-watchlist
GET /thesis-watchlist-pulse-inputs
GET /supported-universe-digest-inputs
GET /thesis-feedback
GET /theses/{thesis_id}
GET /theses/{thesis_id}/events
GET /theses/{thesis_id}/checkpoints
GET /theses/{thesis_id}/evidence
GET /theses/{thesis_id}/publications
GET /proofs/{public_claim_id}
GET /attestations/{domain}/{date}
```

## Write Endpoints

```text
POST /claims
POST /claim-outcomes
POST /conversions
POST /thesis-events
POST /thesis-publications
POST /thesis-checkpoints
POST /thesis-evidence
POST /thesis-outcomes
```

Generic `POST /feedback` is planned, but the current kit maps feedback to
durable or shadow write paths:

- digest/evidence feedback -> `POST /conversions`
- claim feedback -> `POST /claim-outcomes`
- thesis feedback -> `POST /thesis-outcomes`

## Required Write Headers

```text
idempotency-key: globally unique key for safe retry
authorization: Bearer <optional key>
content-type: application/json
```

Public reads and feedback writes work without a key. Use
`TRADEOS_PUBLIC_INTEL_KEY` only when TradeOS has issued one for app
attribution.

App-key endpoints:

```text
POST   /api-keys
GET    /api-keys
POST   /api-keys/{key_id}/rotate
DELETE /api-keys/{key_id}
GET    /app-attribution
```

App-key management requires a signed-in TradeOS account bearer token. Most
builders should use the TradeOS Developer Keys dashboard. Automation can call
these endpoints directly when it has a trusted account token. `GET
/app-attribution` accepts the optional public-intel app key and returns whether
the app key is valid.

The app-key secret is returned once at creation or rotation. Existing secrets
cannot be retrieved.

Key creation and write routes may return:

```text
401 invalid public-intel app key
403 email verification required, revoked key, suspended key, or expired key
409 active app-key limit reached
429 rate limit reached; follow Retry-After
```

## Feedback Provenance Fields

Feedback write payloads may include provenance fields:

```text
feedback_source: human | human_assisted | agent | automation | hybrid
automation_level: none | assisted | automated | autonomous
agent_id
agent_run_id
agent_model
agent_confidence
provenance_note
```

These fields help TradeOS weight feedback correctly. Clients should report
provenance, not credit entitlement. TradeOS decides credit server-side.

## Public Boundary

Responses are public-intelligence evidence. They are not personalized financial
advice, trade instructions, raw premium exports, or execution data.

The public API is the free discovery and integration surface. Server-side rate
limits and abuse controls may apply. Paid TradeOS resources, including x402-paid
machine access, are documented separately from this public-intel base URL.

See [Access And Payments](access-and-payments.md) for starter quota, feedback
credit expiry, and x402 links.
