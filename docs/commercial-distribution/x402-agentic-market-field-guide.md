# x402 / Agentic.Market Field Guide

This is a sanitized field guide for publishing TradeOS-backed intelligence as
pay-per-call HTTP resources through x402 discovery, Coinbase/CDP facilitator
mode, Agentic.Market-style discovery, and other x402 directories.

It is based on the TradeOS x402 setup reviewed on June 7, 2026 and removes live
API credentials, buyer private keys, and private wallet material.

Official docs and discovery surfaces to re-check before launch:

```text
https://docs.cdp.coinbase.com/x402/
https://www.coinbase.com/developer-platform/discover/launches/agentic-market
https://tradeos.tech/.well-known/x402.json
```

## Product Fit

Use x402 when the product is a paid HTTP call:

```text
POST /x402/v1/intelligence/{service_id}
```

Good x402 products:

- `tradeos-token-risk`
- `tradeos-token-discovery`
- `tradeos-risk-gated-discovery`
- `tradeos-signal-evidence-pack`
- `tradeos-forecast-path-context`
- `tradeos-market-pulse-pro`
- `tradeos-vpin-stress`
- `tradeos-dataset-package-scope`

x402 is the cleanest path for agents, backends, and marketplaces that want to
pay once for a machine-readable response.

## Live Proof

TradeOS exposes a public proof page at
[Platform Pulse](https://tradeos.tech/market).

The Platform Pulse section shows feedback-loop activity, x402 challenge demand,
rolling source attribution, and settlement health. Builders can use it in demos
to show that paid intelligence resources are being discovered and challenged by
humans, APIs, agents, and automation.

Keep the terminology exact:

- x402 challenges are unpaid demand or willingness-to-buy signals;
- verified payments are the closest gateway settlement signal;
- completed paid requests are delivered paid intelligence;
- source attribution uses salted fingerprints and does not expose raw IPs,
  wallet addresses, or payment IDs.

## Runtime Shape

```text
x402 buyer or agent
  -> x402-intelligence-gateway
  -> payment challenge or payment verification
  -> internal crypto-intelligence-agent
  -> paid JSON response
```

The gateway does not implement a second intelligence agent. It verifies payment
and forwards to the same internal intelligence runtime used by other channels.

## Local Services

Start the core agent and x402 gateway:

```bash
docker compose -f tradeos-antseed-agent/compose.yaml up -d \
  crypto-intelligence-agent \
  x402-intelligence-gateway
```

Health:

```bash
curl -fsS http://127.0.0.1:18091/health
curl -fsS http://127.0.0.1:18092/x402/v1/health | python -m json.tool
curl -fsS http://127.0.0.1:18092/.well-known/x402.json | python -m json.tool
curl -fsS http://127.0.0.1:18092/x402/v1/catalog | python -m json.tool
```

If facilitator credentials are missing in CDP mode, health should report
payments not ready and paid routes should fail closed instead of advertising a
resource that cannot settle.

## Environment Shape

Public-safe redacted example values:

```text
TRADEOS_X402_PUBLIC_BASE_URL=https://your-domain.example
TRADEOS_X402_AGENT_BASE_URL=http://crypto-intelligence-agent:18091
TRADEOS_X402_AGENT_SHARED_SECRET=<internal agent secret>
TRADEOS_X402_PROVIDER_MODE=cdp
TRADEOS_X402_PAY_TO_ADDRESS=<public seller wallet>
TRADEOS_X402_NETWORK=eip155:8453
TRADEOS_X402_ASSET=USDC
TRADEOS_X402_FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402
TRADEOS_X402_CHANNEL_ID=x402-direct
CDP_API_KEY_ID=<facilitator key id>
CDP_API_KEY_SECRET=<facilitator secret>
```

Keep CDP credentials and buyer signing keys in private env files or a secret
manager. They are facilitator or buyer credentials, not public listing fields.

## Public Discovery Endpoints

Publish stable public endpoints:

```text
https://your-domain.example/.well-known/x402.json
https://your-domain.example/x402
https://your-domain.example/x402/v1/catalog
https://your-domain.example/x402/v1/discovery/resources
https://your-domain.example/x402/v1/listings
https://your-domain.example/x402/v1/samples
https://your-domain.example/x402/v1/openapi.json
https://your-domain.example/x402/v1/marketplace-listing-pack.json
https://your-domain.example/x402/v1/agent-skill.json
https://your-domain.example/x402/v1/directory-submission-bundle.json
```

Sample endpoints should be synthetic or public-safe. Marketplace crawlers need
to inspect output shape without receiving live private payloads.

## Payment Behavior

An unpaid paid call should return `402 Payment Required` with a clear challenge.
After payment verification, the gateway forwards to the internal agent.

Smoke unpaid path:

```bash
curl -i http://127.0.0.1:18092/x402/v1/intelligence/tradeos-vpin-stress \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","output":"machine_actionable_json"}'
```

The path service ID is the billable product identity. The gateway should reject
requests where body `model` conflicts with the route service ID.

## Export Marketplace Artifacts

Generate submission files:

```bash
./scripts/x402-export-marketplace-submissions.py --base-url https://your-domain.example
```

Generate broader marketplace integrations:

```bash
./scripts/x402-marketplace-integrate.py --base-url https://your-domain.example
```

Expected artifact types:

- x402 manifest;
- marketplace listing pack;
- agent-skill manifest;
- directory submission bundle;
- OpenAPI document;
- ChatGPT Actions discovery OpenAPI;
- paid x402 Action template;
- MCP registry draft;
- generic x402 directory JSON;
- provider approval packet for restricted marketplaces.

## Known Target Submission

Dry-run all known automatic targets:

```bash
./scripts/x402-marketplace-integrate.py \
  --base-url https://your-domain.example \
  --auto-submit-known all
```

Submit only to targets where the platform supports safe API submission:

```bash
./scripts/x402-marketplace-integrate.py \
  --base-url https://your-domain.example \
  --auto-submit-known x402-list \
  --submit
```

For marketplaces that require API keys or paid listing transactions, pass those
values through environment variables and do not commit them:

```bash
X402_JOBS_API_KEY=<api-key> \
./scripts/x402-marketplace-integrate.py \
  --base-url https://your-domain.example \
  --auto-submit-known x402-jobs \
  --submit
```

```bash
AGORA402_LISTING_TX_HASH=<tx-hash> \
./scripts/x402-marketplace-integrate.py \
  --base-url https://your-domain.example \
  --auto-submit-known agora402 \
  --submit
```

## Agentic.Market And Coinbase/CDP Notes

For Coinbase/CDP facilitator mode:

- keep facilitator API credentials server-side;
- use Base USDC for launch unless the facilitator/listing supports another
  network and asset;
- make the pay-to wallet public in discovery metadata, but keep signer keys
  private;
- seed at least one bounded paid call after a new resource goes live so
  settlement and marketplace-quality systems can observe a successful request.

Seed calls should default to dry-run and require explicit execution:

```bash
./scripts/x402-paid-seed-calls.py \
  --base-url https://your-domain.example \
  --service-id tradeos-vpin-stress \
  --max-total-usd 1.00

./scripts/x402-paid-seed-calls.py \
  --base-url https://your-domain.example \
  --service-id tradeos-vpin-stress \
  --max-total-usd 1.00 \
  --execute
```

The execute path spends real funds and needs a funded buyer signer. Do not run
it from CI unless the wallet, spending cap, and service are intentionally scoped.

## Visibility Monitor

Run after publishing and weekly:

```bash
./scripts/x402-marketplace-rank-monitor.py --base-url https://your-domain.example
```

Check:

- manifest availability;
- listing pack availability;
- sample outputs;
- catalog resource count;
- marketplace search ranking for your canonical queries;
- stale or duplicate provider listings that require marketplace support.

## Known Pitfalls

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| Health says payments not ready | Facilitator credentials or pay-to address missing | Configure CDP/facilitator env or use mock mode locally. |
| Paid route returns 503 | Gateway refuses to advertise unsettled paid resource | Fix facilitator env before public testing. |
| Facilitator verify fails with `invalid_payload` | Payment payload does not match challenge, network, asset, amount, or resource | Rebuild the payment from the exact challenge and route. |
| Marketplace shows fewer resources than catalog | Crawler lag or metadata too large/noisy | Tighten listing metadata, seed a paid call, rerun visibility monitor, then contact support. |
| Duplicate stale provider listings | Old provider account or key owns listing | Ask marketplace support to delete or transfer stale listings. |
| Buyer wallet mismatch | Private key does not match configured buyer address | Refuse execution and correct buyer signing env. |

## Acceptance Criteria

The x402 path is ready when:

- public `.well-known/x402.json` is reachable;
- catalog, listings, samples, and OpenAPI endpoints are reachable;
- unpaid paid calls return a clear 402 challenge;
- a bounded paid buyer call completes;
- marketplace artifacts generate without secrets;
- listing copy is read-only and product-specific;
- the visibility monitor finds the expected resource count and search terms.
