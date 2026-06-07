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
GET /watchlist-capabilities
GET /tokens/{token_ref}/watchlist-snapshot
GET /theses/{thesis_id}
GET /theses/{thesis_id}/events
GET /theses/{thesis_id}/checkpoints
GET /theses/{thesis_id}/evidence
GET /theses/{thesis_id}/publications
GET /proofs/{public_claim_id}
GET /attestations/{domain}/{date}
```

`GET /tokens/{token_ref}/watchlist-snapshot` is public and bounded. It returns
normalized watchlist context for one token: risk state, opportunity state,
thesis state, severity, scores, drivers, freshness, limitations, and a safety
notice. It is useful for bots, dashboards, and research workflows that need
token-aware context without storing user state.

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

Account-owned watchlist endpoints:

```text
POST   /watchlists
GET    /watchlists
GET    /watchlists/{watchlist_id}
PATCH  /watchlists/{watchlist_id}
DELETE /watchlists/{watchlist_id}
POST   /watchlists/{watchlist_id}/items
DELETE /watchlists/{watchlist_id}/items/{item_id}
GET    /watchlists/{watchlist_id}/state
GET    /watchlists/{watchlist_id}/events
POST   /watchlists/{watchlist_id}/feedback
POST   /watchlists/{watchlist_id}/notification-channels
GET    /watchlists/{watchlist_id}/notification-channels
POST   /watchlists/{watchlist_id}/deliveries/trigger
GET    /watchlists/{watchlist_id}/deliveries
```

These routes require a signed-in TradeOS account bearer token. If a builder app
also has `TRADEOS_PUBLIC_INTEL_KEY`, send it in:

```text
X-TradeOS-Public-Intel-Key: <public-intel app key>
```

That lets TradeOS attribute feedback and app usage while the user keeps control
of their watchlists.

Delivery trigger evaluates stored watchlist events against stored channels and
writes delivery audit rows. In-app delivery is available immediately. Verified
email delivery requires the signed-in account email to be verified and SMTP to
be configured by TradeOS. Webhook delivery is gated by explicit channel consent
and TradeOS server-side enablement.

Generic `POST /feedback` is planned, but the current kit maps feedback to
durable or shadow write paths:

- digest/evidence feedback -> `POST /conversions`
- claim feedback -> `POST /claim-outcomes`
- thesis feedback -> `POST /thesis-outcomes`
- watchlist feedback -> `POST /watchlists/{watchlist_id}/feedback`

## Required Write Headers

```text
idempotency-key: globally unique key for safe retry
authorization: Bearer <optional key>
content-type: application/json
```

Public reads and feedback writes work without a key. Use
`TRADEOS_PUBLIC_INTEL_KEY` only when TradeOS has issued one for app
attribution.

For dashboard and CLI key setup steps, see
[Getting API Keys And Requesting Scale](getting-api-keys-and-scale.md).

App-key endpoints:

```text
POST   /api-keys
GET    /api-keys
POST   /api-keys/{key_id}/rotate
DELETE /api-keys/{key_id}
GET    /app-attribution
POST   /quota-requests
```

App-key management requires a signed-in TradeOS account bearer token. Most
builders should use the TradeOS Developer Keys dashboard. Automation can call
these endpoints directly when it has a trusted account token. `GET
/app-attribution` accepts the optional public-intel app key and returns whether
the app key is valid.

The app-key secret is returned once at creation or rotation. Existing secrets
cannot be retrieved.

`POST /quota-requests` requires a signed-in, email-verified TradeOS account. It
records a project review request for higher public quota or paid evaluation.

## Quota Policy

Public reads return quota information under `access_control`:

```json
{
  "access_control": {
    "rate_limit_status": {
      "quota_profile": "anonymous_preview|starter|baseline|earned|reviewed_project|limited",
      "minute_limit": 30,
      "hour_limit": 300,
      "day_limit": 1000,
      "symbol_cardinality_day_limit": 50
    },
    "quota_policy": {
      "refresh_reason": "recent useful feedback refreshed public quota",
      "review_request_endpoint": "/v1/public-intel/quota-requests",
      "paid_upgrade_note": "Production scale requires x402 payment or a TradeOS entitlement."
    }
  }
}
```

Default profiles:

| Profile | Reads/min | Reads/hour | Reads/day | Symbols/day |
| --- | ---: | ---: | ---: | ---: |
| Anonymous preview | 2 | 10 | 20 | 3 |
| Builder baseline | 5 | 50 | 100 | 10 |
| Builder starter/earned | 10 | 100 | 250 | 20 |
| Reviewed project | 20 | 200 | 500 | 40 |

Data Intel Credits and app keys do not unlock paid resources. Use x402, paid API
entitlement, or a TradeOS contract for machine-scale reads, alerts, exports,
historical replay, private intelligence products, premium automation, or data rights.

At launch, free public reads are counted as one read unit per request. The API
returns the current policy in `access_control.quota_policy.read_unit_policy`.

## Watchlist SDK Example

```ts
import { TradeOSPublicIntelClient } from "@tradeos/public-intel-sdk";

const client = new TradeOSPublicIntelClient({
  apiKey: process.env.TRADEOS_PUBLIC_INTEL_KEY,
  accountToken: process.env.TRADEOS_ACCOUNT_TOKEN,
});

const publicSnapshot = await client.getTokenWatchlistSnapshot("VVV", {
  mode: "trader",
  chain: "8453",
});

const created = await client.createWatchlist({
  name: "Long-term portfolio risks",
  mode: "investor",
});
const watchlistId = String(created.watchlist.watchlist_id);

await client.addWatchlistItem(watchlistId, {
  symbol: "VVV",
  chain: "8453",
});

const state = await client.getWatchlistState(watchlistId);

await client.createWatchlistNotificationChannel(watchlistId, {
  channelKind: "in_app",
  target: "tradeos-dashboard",
  minSeverity: "watch",
  digestFrequency: "realtime",
});

const deliveryRun = await client.triggerWatchlistDeliveries(watchlistId, {
  channelKinds: ["in_app"],
  minSeverity: "watch",
});

const deliveryAudit = await client.listWatchlistDeliveries(watchlistId);
```

Use public snapshots for keyless demos. Use account-owned watchlists when a user
needs saved lists, in-app state, events, channels, and feedback.

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

Responses are public-intelligence evidence. The API itself does not place
trades, hold keys, return raw premium exports, or provide execution data.
Private self-hosted applications may turn this evidence into trade/action
recommendations when they make assumptions, freshness, risk, and execution
ownership visible.

The public API is the free discovery and integration surface. Server-side rate
limits and abuse controls may apply. Paid TradeOS resources, including x402-paid
machine access, are documented separately from this public-intel base URL.

See [Access And Payments](access-and-payments.md) for starter quota, feedback
credit expiry, and x402 links.
