# TradeOS Public Intelligence Kit

Build crypto market-intelligence products on top of
[TradeOS public evidence](https://tradeos.tech/market).

This repo gives builders SDKs, MCP tools, a BYOK agent CLI, and runnable bot
examples for the TradeOS public-intel API. TradeOS hosts the intelligence API.
Builders and users bring their own model provider key when they want LLM
summaries, with [Venice AI](https://venice.ai/pricing) as the default
OpenAI-compatible path.

The practical loop is simple:

```text
TradeOS evidence -> builder product -> user feedback -> better intelligence -> paid production access when scale is needed
```

Use the free public kit to prove a workflow. Charge for the packaging around
that workflow. Upgrade to paid TradeOS when the product needs scale,
automation, premium data, exports, alerts, validation APIs, x402 machine
access, or enterprise support.

## At A Glance

| Topic | Default |
| --- | --- |
| Public API | `https://api.tradeos.tech/v1/public-intel` |
| Public reads | no TradeOS account required, server-side limits apply |
| Saved watchlists | require a signed-in TradeOS account token |
| Builder attribution | optional `TRADEOS_PUBLIC_INTEL_KEY` |
| LLM inference | BYOK, [Venice AI](https://venice.ai/pricing) or any OpenAI-compatible provider |
| Paid machine access | x402 payment or TradeOS entitlement |
| Safety boundary | research context only, no execution or personalized financial advice |

## What This Is

TradeOS sits in the public market-intelligence layer for crypto and on-chain
markets. This kit is for builders who need current, source-backed market
context inside bots, dashboards, agent workflows, research products, validation
systems, and paid communities.

It is an evidence and feedback layer:

- public digest inputs, candidates, watchlists, thesis records, proof lookups,
  caveats, freshness, source refs, and invalidation notes;
- TypeScript and Python SDKs for apps and services;
- a stdio MCP server for local agent hosts such as Claude Desktop and Cursor;
- a BYOK CLI that can ask Venice AI or another OpenAI-compatible model over
  TradeOS evidence;
- a market briefing bot that can post to stdout, Discord, or Telegram;
- structured feedback writes with provenance so TradeOS can learn which public
  intelligence was useful, early, late, thin, or confusing.

It is not an exchange connector, custody product, trading bot, or execution
framework.

## Why Builders Use It

- **Ship faster**: start with bounded TradeOS evidence instead of building a
  market data pipeline first.
- **Ground agents**: give LLMs current evidence, caveats, stable IDs, and source
  references before they answer.
- **Control inference cost**: use [Venice AI](https://venice.ai/pricing) or
  another provider with your own key instead of asking TradeOS to sponsor model
  calls.
- **Build for money**: package the intelligence into products customers already
  understand, such as briefings, monitoring, validation, or research workflows.
- **Close the loop**: send human, agent, or automation feedback back to TradeOS
  with provenance.
- **Scale cleanly**: graduate from public reads to paid TradeOS data, x402, or
  enterprise access when the workflow proves demand.

## What You Can Build

| Product | Who Pays | What You Package | TradeOS Upgrade Trigger |
| --- | --- | --- | --- |
| Paid research digest | traders, funds, paid communities | edited briefings, archive, member access | more volume, custom universe, premium pulse |
| Discord or Telegram market bot | token communities, DAOs, trading groups | server commands, scheduled summaries, feedback loop | high-volume reads, hosted bridge, team access |
| Watchlist monitor | researchers, token teams, active traders | saved lists, risk changes, freshness, alerts, dashboard seats | alert delivery, webhooks, custom universes |
| Tradebot intelligence layer | bot builders, quant developers | regime context, caveats, invalidation notes, post-trade review | automation-safe API, private forecasts, premium context |
| Quant validation pack | quant shops, funds, signal vendors | outside labels, disagreement reports, replay/evaluation workflow | historical data, validation API, enterprise contract |
| Claim or proof explorer | analysts, creators, research desks | public profile, proof pages, outcome tracking | paid proof tooling, creator analytics |
| Market context widget | wallets, dashboards, data portals | risk caveats, digest context, source-backed snippets | B2B widget or API subscription |
| Feedback analytics | research communities, analyst teams | label collection, reviewer workflow, app reputation | team analytics, deeper evidence, paid exports |

The public kit is the integration and discovery surface. Paid TradeOS starts
when customers ask for production-grade volume, automation, history, delivery,
private context, or explicit paid entitlement.

More product detail:

- [Use Cases](docs/use-cases.md)
- [Monetization Guide](docs/monetization.md)
- [Builder Revenue Playbook](docs/builder-revenue-playbook.md)

## Five-Minute Paths

Clone and build from source:

```bash
git clone git@github.com:agenticsrclab/tradeos-public-intel-kit.git
cd tradeos-public-intel-kit
npm install
npm run build
```

### Run The Market Briefing Bot

This is the first recommended bot to fork: a source-backed market briefing
worker for stdout, Discord, or Telegram.

```bash
npm run briefing-bot -- brief
```

That works without a TradeOS account and without an LLM key. It prints a
deterministic briefing from live public evidence.

Use Venice AI for a stronger natural-language brief. Get a key from the
[Venice AI subscription page](https://venice.ai/pricing):

```bash
export VENICE_API_KEY=...
npm run briefing-bot -- brief
```

Test the post path locally:

```bash
TRADEOS_BRIEFING_PLATFORM=stdout npm run briefing-bot -- post
```

Post to Discord:

```bash
export TRADEOS_BRIEFING_PLATFORM=discord
export DISCORD_WEBHOOK_URL=...
export VENICE_API_KEY=...
npm run briefing-bot -- post
```

More detail: [Market Briefing Bot](docs/market-briefing-bot.md)

### Ask With The CLI

Fetch evidence without an LLM:

```bash
npm run cli -- digest --limit 5
npm run cli -- watchlist --limit 5
```

Ask a Venice-backed question. Get a key from the
[Venice AI subscription page](https://venice.ai/pricing):

```bash
export VENICE_API_KEY=...
npm run cli -- ask "What changed in crypto market stress?"
```

Submit feedback:

```bash
npm run cli -- feedback \
  --target-id digest_123 \
  --target-type digest \
  --label useful \
  --note "Clear and timely"
```

### Add TradeOS To An MCP Host

Run the local stdio MCP server from this repo:

```bash
TRADEOS_API_BASE=https://api.tradeos.tech/v1/public-intel \
npm --workspace @tradeos/public-intel-mcp-server run dev
```

Claude Desktop package-style configuration:

```json
{
  "mcpServers": {
    "tradeos-public-intel": {
      "command": "npx",
      "args": ["-y", "@tradeos/public-intel-mcp-server"],
      "env": {
        "TRADEOS_API_BASE": "https://api.tradeos.tech/v1/public-intel",
        "TRADEOS_PUBLIC_INTEL_KEY": "<optional-app-key>",
        "TRADEOS_ACCOUNT_TOKEN": "<optional-account-token-for-watchlists>"
      }
    }
  }
}
```

The MCP server is local stdio today. The reserved hosted MCP endpoint is:

```text
https://mcp.tradeos.tech/public-intel
```

It becomes the zero-local-infrastructure path after the hosted HTTP MCP bridge
is deployed.

More detail: [MCP Tools](docs/mcp-tools.md)

### Use The TypeScript SDK

Package install path after NPM publication, or when consuming a local tarball:

```bash
npm install @tradeos/public-intel-sdk
```

```ts
import { TradeOSPublicIntelClient } from "@tradeos/public-intel-sdk";

const client = new TradeOSPublicIntelClient();

const digest = await client.getMarketDigest({ limit: 5 });
const snapshot = await client.getTokenWatchlistSnapshot("VVV", {
  mode: "trader",
  chain: "8453",
});

await client.submitDigestFeedback({
  targetType: "digest",
  targetId: "digest_123",
  label: "useful",
  optionalNote: "The caveats were clear.",
});
```

### Use The Python SDK

Package install path after PyPI publication, or when consuming a local build:

```bash
pip install tradeos-public-intel
```

```python
from tradeos_public_intel import TradeOSPublicIntelClient

client = TradeOSPublicIntelClient()
digest = client.get_market_digest(limit=5)
snapshot = client.get_token_watchlist_snapshot("VVV", mode="trader", chain="8453")
```

Python 3.11 or newer is required.

### Try Saved Watchlists

Public token snapshots are keyless. Saved watchlists are user-owned state and
require a signed-in TradeOS account bearer token.

```bash
export TRADEOS_ACCOUNT_TOKEN=<signed-in-account-token>
export TRADEOS_PUBLIC_INTEL_KEY=<optional-builder-app-key>
```

```ts
import { TradeOSPublicIntelClient } from "@tradeos/public-intel-sdk";

const client = new TradeOSPublicIntelClient({
  accountToken: process.env.TRADEOS_ACCOUNT_TOKEN,
  apiKey: process.env.TRADEOS_PUBLIC_INTEL_KEY,
});

const created = await client.createWatchlist({
  name: "Portfolio risk monitor",
  mode: "investor",
});
const watchlistId = String(created.watchlist.watchlist_id);

await client.addWatchlistItem(watchlistId, { symbol: "VVV", chain: "8453" });
const state = await client.getWatchlistState(watchlistId);

await client.createWatchlistNotificationChannel(watchlistId, {
  channelKind: "in_app",
  target: "tradeos-dashboard",
  minSeverity: "watch",
  digestFrequency: "realtime",
});

await client.triggerWatchlistDeliveries(watchlistId, {
  channelKinds: ["in_app"],
  minSeverity: "watch",
});
```

The first-party watchlist GUI uses the same API:
[Watchlist Intelligence](https://tradeos.tech/watchlists)

## Access Model

Builders and users should not need a TradeOS account just to try the public kit.

| Mode | Credential | Enables |
| --- | --- | --- |
| Public trial | none | bounded public reads and feedback writes |
| Builder attribution | optional `TRADEOS_PUBLIC_INTEL_KEY` | app identity, abuse controls, support, potential higher public limits |
| User-owned watchlists | `TRADEOS_ACCOUNT_TOKEN` | saved lists, state, events, channels, delivery audit, watchlist feedback |
| Feedback credit linking | TradeOS sign-in or linked session identity | starter quota and feedback-credit reconciliation |
| Builder-paid product | paid API key, contract entitlement, or x402 wallet/payment | premium resources inside the builder product |
| User-paid agent/tool | user TradeOS entitlement or x402 payment | user brings paid access to a third-party tool |

Default flow:

```text
No account -> try public reads -> submit feedback anonymously
Builder gets traction -> register app / configure optional public key
User wants saved state -> sign in and connect an account token
Workflow needs premium data -> builder or user pays through x402/API entitlement
```

TradeOS can issue public-intel app keys for signed-in, email-verified builder
accounts. The normal path is the
[Developer Keys](https://tradeos.tech/developer/api-keys) dashboard. The CLI can
validate `TRADEOS_PUBLIC_INTEL_KEY` and can manage app keys when
`TRADEOS_ACCOUNT_TOKEN` is set for trusted automation:

```bash
npm run cli -- auth
npm run cli -- keys create --app-name my-public-intel-app
npm run cli -- keys list
npm run cli -- keys revoke --key-id pubkey_...
```

Existing app-key secrets are not retrievable. Create or rotate a key, copy the
one-time secret, and keep it server-side.

More detail:

- [Distribution Setup Guide](docs/distribution-setup-guide.md)
- [API Keys And Feedback Provenance](docs/api-keys-and-feedback-provenance.md)
- [Access And Payments](docs/access-and-payments.md)
- [Paid Boundaries](docs/paid-boundaries.md)

## Feature Unlock Loop

More features come from TradeOS service access, not from hidden local code in
the SDK, MCP server, CLI, or bot examples.

```text
1. Builder installs the free kit.
2. Builder ships public features using digest, candidates, watchlists, proofs, and feedback writes.
3. End users interact with the builder product and submit structured feedback.
4. TradeOS reconciles stable target IDs into quality signals and credits.
5. Credits can unlock temporary dashboard-only depth for the user.
6. When the workflow needs production features, the builder calls paid TradeOS/x402 surfaces.
7. TradeOS checks entitlement or payment and returns premium data.
8. The builder product exposes the paid feature to its customer.
```

| Feature Type | How The Builder Gets It | Example |
| --- | --- | --- |
| Free public features | included in this kit against `api.tradeos.tech/v1/public-intel` | digest, candidates, token snapshots, watchlist state, proofs, feedback writes |
| Package improvements | upgrade npm/PyPI packages when TradeOS ships public tools | SDK helper, MCP tool, CLI command |
| Feedback-credit depth | TradeOS account/session credit reconciliation | more dashboard history, deeper evidence, more public refreshes |
| Paid machine features | x402 payment or paid API entitlement | premium market pulse, validation API, automation-safe reads |
| Enterprise features | contract, API key, or private deployment | custom universe, bulk exports, replay datasets, support |

## Architecture

```text
Your app / agent / MCP host
        |
        | SDK, CLI, or MCP tools
        v
TradeOS public-intel API
        |
        | bounded public evidence, source refs, caveats, stable IDs
        v
Your product surface
        |
        | optional feedback writes
        v
TradeOS feedback-credit loop

Optional BYOK LLM path:

Your app / CLI -> Venice AI or another OpenAI-compatible provider
              -> answer grounded in TradeOS public evidence
```

More detail: [Architecture](docs/architecture.md)

## Repository Layout

- `packages/sdk-js`: TypeScript SDK.
- `packages/sdk-python`: Python SDK.
- `packages/mcp-server`: stdio MCP server for local agent hosts.
- `apps/tradeos-agent-cli`: BYOK CLI for evidence reads, Venice-backed asks,
  and feedback writes.
- `apps/market-briefing-bot`: Discord, Telegram, and stdout market briefing bot
  powered by TradeOS public evidence.
- `examples`: Claude Desktop and Cursor MCP configuration examples.
- `docs`: architecture, setup, use cases, monetization, API reference, MCP
  tools, feedback loop, access and payments, paid boundaries, safety
  boundaries, production readiness, and consumer E2E notes.

Start with the [docs index](docs/README.md).

## Public API

Default production base URL:

```text
https://api.tradeos.tech/v1/public-intel
```

Useful public reads:

```text
GET /sources/health
GET /watchlist-capabilities
GET /tokens/{token_ref}/watchlist-snapshot
GET /digest-inputs
GET /candidates
GET /thesis-watchlist
GET /thesis-feedback
GET /proofs/{public_claim_id}
```

Feedback writes:

```text
POST /conversions       digest/evidence feedback
POST /claim-outcomes    public claim feedback
POST /thesis-outcomes   thesis feedback
POST /watchlists/{watchlist_id}/feedback
```

More detail: [Public API](docs/public-intel-api.md)

## Contribute Apps, Tools, And Services

This kit is meant to be a builder surface, not just a client library. TradeOS
welcomes contributions that help developers turn public intelligence into
useful products and send structured feedback back to the intelligence loop.

Good contribution lanes:

| Lane | Examples |
| --- | --- |
| Apps and bots | Discord bot, Telegram bot, Slack bot, dashboard, newsletter worker, alert worker |
| Agent tools | MCP tools, Claude/Cursor configs, prompt packs, local agent workflows |
| SDK helpers | typed helpers, retry handling, examples, response formatters |
| Services and connectors | webhook relays, scheduled workers, Notion/Airtable/Slack/Discord bridges |
| Feedback loops | provenance adapters, human review UI, outcome label collectors |
| Builder docs | monetization recipes, integration walkthroughs, deployment notes |

The best contributions are small, runnable, and commercially useful: they help a
builder ship a workflow, keep secrets server-side, respect the safety boundary,
and make the TradeOS feedback loop stronger.

Start here: [Contributing](CONTRIBUTING.md)

## Safety Boundary

This kit does not place trades, provide personalized financial advice, accept
exchange credentials, expose raw private telemetry, or guarantee that a token is
safe. Public intelligence is descriptive evidence, not an instruction to buy,
sell, or allocate capital.

See [Safety Boundaries](docs/safety-boundaries.md).

## Verified Consumer Flow

Before publish, this kit was tested from fresh tarball installs as an external
consumer:

- CLI digest read.
- CLI Venice-backed `ask`.
- CLI feedback write.
- TypeScript SDK read and feedback write.
- stdio MCP initialize, tool listing, digest read, and feedback write.
- Python SDK read and feedback write.
- account signup, `VVV` watchlist state/events, in-app delivery audit,
  unverified-email skip audit, watchlist feedback, and archive against the
  public hosts.

See [Consumer E2E](docs/consumer-e2e.md).

Before making the repository public, run the publish gate in
[Production Readiness](docs/production-readiness.md).

## Explore TradeOS

- [TradeOS app](https://tradeos.tech)
- [Live market intelligence](https://tradeos.tech/market)
- [Watchlist Intelligence](https://tradeos.tech/watchlists)
- [Ask TradeOS](https://tradeos.tech/ask)
- [Developer Keys](https://tradeos.tech/developer/api-keys)
- [Review Lab](https://tradeos.tech/review)
- [How TradeOS Works](https://tradeos.tech/how-it-works)
- [Public docs](https://tradeos.tech/docs/)
- [Public machine-readable docs](https://tradeos.tech/llms.txt)
- [x402 discovery](https://tradeos.tech/.well-known/x402.json)
- [x402 listings](https://tradeos.tech/x402/v1/listings)
