# AntSeed Field Guide

This is a sanitized field guide for publishing a TradeOS-backed intelligence
service as an AntSeed provider. It is based on the TradeOS setup reviewed on
June 7, 2026 and removes live seller IDs, wallet secrets, RPC URLs, identity
keys, and host-specific values.

Use AntSeed when the product should look like an AI Agent or OpenAI-compatible
provider service that buyers can call with prompts or structured JSON.

Official docs to re-check before launch:

```text
https://antseed.com/docs/
https://antseed.com/docs/overview/
```

## Product Fit

Recommended provider type:

```text
AI Agent
```

Recommended service:

```text
tradeos-crypto-intelligence-agent
```

Best first products:

- token risk report;
- token discovery and onchain triage;
- market pulse;
- order-flow stress;
- signal evidence packet;
- forecast path context;
- dataset concierge.

Do not lead with raw inference or raw market data resale. TradeOS value is the
derived intelligence, evidence, confidence, and safety boundary.

## Runtime Shape

AntSeed calls an OpenAI-compatible TradeOS provider service:

```text
AntSeed buyer
  -> AntSeed provider routing and payment
  -> TradeOS crypto-intelligence-agent
  -> TradeOS internal intelligence services
  -> read-only response
```

The provider service exposes:

```text
GET  /health
GET  /readyz
GET  /.well-known/agent.json
GET  /v1/models
GET  /v1/provider/service
POST /v1/chat/completions
POST /v1/intelligence
```

## Local Setup

Create the private env file:

```bash
cd tradeos-antseed-agent
cp .env.example .env.agent.local
openssl rand -hex 32
```

Set the generated value as:

```text
TRADEOS_AGENT_SHARED_SECRET=<generated secret>
TRADEOS_X402_AGENT_SHARED_SECRET=<same generated secret if running x402 beside it>
```

Start the core provider runtime:

```bash
docker compose -f compose.yaml up -d crypto-intelligence-agent
```

Health check:

```bash
curl -fsS http://127.0.0.1:18091/health
curl -fsS http://127.0.0.1:18091/.well-known/agent.json | python -m json.tool
```

Example local intelligence call:

```bash
curl -sS http://127.0.0.1:18091/v1/intelligence \
  -H "Authorization: Bearer ${TRADEOS_AGENT_SHARED_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{
    "request_type": "market_pulse",
    "symbol": "BTCUSDT",
    "output": "machine_actionable_json"
  }' | python -m json.tool
```

## Provider Config Shape

Public-safe provider metadata:

```json
{
  "name": "TradeOS Crypto Intelligence",
  "type": "AI Agent",
  "baseUrl": "https://your-domain.example/v1",
  "auth": "Authorization: Bearer <provider secret>",
  "service": "tradeos-crypto-intelligence-agent",
  "categories": ["crypto", "research", "risk", "signals", "agent-tools"],
  "safety": "Read-only research. No execution, custody, copy trading, or personalized financial advice."
}
```

Keep the provider secret server-side. If AntSeed needs an OpenAI-compatible API
key, use the same value as the internal provider auth secret or a dedicated
provider secret, then rotate it if exposed.

## Seller Identity And Stake

Use wrapper scripts so the CLI uses the intended identity and does not silently
create or switch to a default local identity.

Status:

```bash
./scripts/antseed-seller-status.sh
```

Register:

```bash
./scripts/antseed-seller-register.sh
```

Stake:

```bash
./scripts/antseed-seller-stake.sh 10
```

Start seller mode:

```bash
./scripts/antseed-seller-start.sh
```

The field setup used a detached process supervisor for the seller and a private
Base mainnet RPC. Public RPCs can lag or make the first reserve/channel flow
look stuck.

Use redacted env examples:

```text
ANTSEED_IDENTITY_HEX=<seller identity secret>
ANTSEED_SELLER_NAME=<public seller name>
ANTSEED_SELLER_ADDRESS=<public seller wallet>
ANTSEED_P2P_PORT=<forwarded TCP/UDP port if required>
```

Do not commit `ANTSEED_IDENTITY_HEX`, wallet private keys, custom RPC URLs, seed
phrases, or seller signing material.

## Pricing

Use token-meter prices only as the settlement mechanism. Buyer-facing copy
should describe the product value:

| Product | Pricing Posture |
| --- | --- |
| Market pulse or VPIN quick check | low-cost utility read |
| Token risk report | entry paid diligence |
| Token discovery ranking | higher-value recurring research |
| Signal evidence packet | premium evidence and validation |
| Dataset concierge | lead-gen for private or enterprise data |

Re-check AntSeed protocol fees, payout rate, stake requirement, and provider
configuration before each mainnet launch. Treat old fee and stake numbers as
field notes, not permanent constants.

## Buyer Test

Run a local consumer smoke test before relying on marketplace traffic:

```bash
python scripts/antseed-local-consumer-smoke.py
```

Then test through AntSeed buyer tooling with a small prompt:

```text
Analyze BTCUSDT current market pulse. Return machine-actionable JSON with
verdict, confidence, risk flags, evidence, and next checks. No trade execution.
```

## Known Pitfalls

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| Status command creates or uses the wrong identity | CLI defaulted to a local identity | Use the wrapper scripts and require `ANTSEED_IDENTITY_HEX`. |
| First buyer reserve/channel hangs | Slow or lagging Base RPC | Use a private/custom Base RPC and verify wallet balances. |
| Provider responds but buyers see weak value | Listing is too broad or generic | Package one concrete intelligence product with a clear output schema. |
| Marketplace prompts ask for trades | Buyer expects an execution agent | Refuse execution/custody/copy-trading and return research-only output. |
| Token pricing feels confusing | Token-meter settlement hides report value | Add plain buyer-facing price examples and output samples. |

## Acceptance Criteria

The AntSeed provider path is ready when:

- `crypto-intelligence-agent` health and agent card endpoints pass;
- the provider service refuses execution and custody prompts;
- AntSeed seller status uses the intended identity;
- stake and seller process are confirmed in the platform;
- a buyer smoke request returns a useful JSON or markdown report;
- logs redact buyer peer IDs, private account data, and raw private payloads;
- public listing copy preserves read-only safety boundaries.
