# TradeOS Public Intelligence Kit

Build source-grounded crypto market Data Intelligence products on top of
[TradeOS public evidence](https://tradeos.tech/market).

This repo gives builders SDKs, MCP tools, a BYOK agent CLI, runnable bots, and
the blueprint for the flagship TradeOS app pattern: a **private self-hosted
Symbol Cockpit**.

TradeOS hosts the intelligence API. The cockpit is an individual private-use
control plane: it runs on the self-hosted operator's own machine, server, quant
workstation, or agent host. It can recommend buy, sell, trim, avoid, watch, or
pass decisions from TradeOS evidence plus local rules, while keys, custody,
portfolio context, approvals, and execution stay in that operator's environment.

Builders can package or extend this pattern for users to self-host. They should
not operate the cockpit as a managed account service, collect customer exchange
credentials, custody customer assets, or place orders for customers.

That private self-hosted model is the product advantage. Traders get an
actionable agent. Builders get a product they can ship. TradeOS stays the
source-grounded intelligence product layer instead of becoming a custodian,
broker, or hosted order router.

Think of TradeOS as a crypto market Data Intelligence OS:

- TradeOS supplies the source-backed intelligence layer.
- Builders package that intelligence into briefings, bots, watchlists,
  dashboards, validation packs, proof pages, and widgets.
- Users and builder apps send structured feedback that improves intelligence
  quality and provenance.
- Paid TradeOS, x402, or enterprise access starts when a product needs scale,
  alerts, automation, premium history, private intelligence products,
  validation APIs, or explicit data rights.

The practical loop is simple:

```text
Use TradeOS free.
Earn Data Intel Credits by improving intelligence quality.
Build products on public intelligence.
Pay when you need private intelligence products, scale, alerts, automation, or data rights.
```

Use the free public kit to prove a workflow. Charge for the packaging around
that workflow. Submit feedback with provenance so TradeOS can improve the
intelligence layer. Upgrade to paid TradeOS when the product needs production
volume, alerts, automation, premium history, private intelligence products,
validation APIs, x402 machine access, explicit data rights, or enterprise
support.

## At A Glance

| Topic | Default |
| --- | --- |
| Public API | `https://api.tradeos.tech/v1/public-intel` |
| Public reads | no TradeOS account required, server-side limits apply |
| Saved watchlists | require a signed-in TradeOS account token |
| Builder attribution | optional `TRADEOS_PUBLIC_INTEL_KEY` |
| LLM inference | BYOK, [Venice AI](https://venice.ai/pricing) or any OpenAI-compatible provider |
| Paid machine access | x402 payment or TradeOS entitlement |
| Flagship model | individual private-use, self-hosted Symbol Cockpit over TradeOS intelligence |
| Cockpit trading-intelligence universe | 21 symbols today; see [Symbol Intelligence Coverage](docs/symbol-intelligence-coverage.md) |
| Safety boundary | actionable recommendations are allowed; TradeOS does not custody keys, manage accounts, place orders, or support third-party account management |

## What This Is

TradeOS sits in the public market-intelligence layer for crypto and on-chain
markets. This kit is the builder distribution surface for that Data Intelligence OS: it
helps products discover, consume, package, and send feedback on current,
source-backed market context inside bots, dashboards, agent workflows, research
products, validation systems, and paid communities.

It is an evidence and feedback layer:

- public digest inputs, candidates, watchlists, thesis records, proof lookups,
  caveats, freshness, source refs, and invalidation notes;
- symbol-cockpit and action-agent patterns for turning evidence into
  good/bad/ugly verdicts, watchlist recommendations, and bot preflight checks;
- non-executable action intents that carry evidence-backed action context into
  local review, policy gates, paper execution, or independent executor
  experiments without becoming orders;
- TypeScript and Python SDKs for apps and services;
- a stdio MCP server for local agent hosts such as Claude Desktop and Cursor;
- a BYOK CLI that can ask Venice AI or another OpenAI-compatible model over
  TradeOS evidence;
- a market briefing bot that can post to stdout, Discord, or Telegram;
- structured feedback writes with provenance so TradeOS can learn which public
  intelligence was useful, early, late, thin, or confusing.

It is not a TradeOS-hosted broker, custody product, managed account service, or
order router. Builders can wire the open-source kit into local bot, preflight,
or execution stacks, but exchange keys, approvals, sizing rules, and custody
stay with the self-hosted operator using it for their own account context. If a
builder collects customer credentials, controls customer accounts, or runs
execution for other people, that builder has created a separate managed trading
service outside this kit's supported boundary.

Action intents are the bridge, not the executor. They are marked
`non_executable`, require operator review, and deliberately omit venue, account,
size, order type, route, calldata, transaction body, and execute URL fields.

In practical terms:

```text
TradeOS Data Intelligence OS -> intelligence, evidence, data, feedback IDs
Symbol Cockpit -> private local recommendation and decision runtime
Local modules -> feasibility, EA/risk, execution adapters, ops dashboard
```

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
- **Sell privacy as the feature**: ship a cockpit that customers can run on
  their own box, with their own model key, exchange keys, approval policy,
  portfolio context, and audit logs.
- **Close the loop**: send human, agent, or automation feedback back to TradeOS
  with provenance.
- **Scale cleanly**: graduate from public reads to paid TradeOS data, x402, or
  enterprise access when the workflow needs scale, alerts, automation, private
  intelligence products, or data rights.

## What You Can Build

| Product | Who Pays | What You Package | TradeOS Upgrade Trigger |
| --- | --- | --- | --- |
| Private symbol cockpit | active traders, research desks, token teams | good/bad/ugly verdicts, recommendation inbox, watchlist scanners | alerts, private intelligence context, larger universe, premium history |
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
private intelligence products, or explicit paid entitlement.

More product detail:

- [Repository Layout](docs/repository-layout.md)
- [Integration Keys And URLs](docs/integration-keys-and-urls.md)
- [Symbol Cockpit And Action Agent](docs/symbol-cockpit-agent.md)
- [Symbol Intelligence Coverage](docs/symbol-intelligence-coverage.md)
- [Data Intelligence Product Model](docs/marketplace-model.md)
- [Use Cases](docs/use-cases.md)
- [Monetization Guide](docs/monetization.md)
- [Builder Revenue Playbook](docs/builder-revenue-playbook.md)

## Flagship: Symbol Cockpit

The fastest consumer story is:

```text
Give TradeOS a symbol.
TradeOS returns the good, bad, ugly, verdict, evidence, and an action
recommendation.
```

Example cockpit language:

```text
VVV: avoid new long.
Good: momentum improved and sector interest remains present.
Bad: fusion agreement degraded and liquidity depth is thin.
Ugly: flow stress is elevated during broader market risk.
Recommendation: avoid a fresh long; if already exposed, consider trim or tighter
risk controls until flow stress normalizes and fusion recovers.
Feedback: useful / wrong / late / missing context.
```

This cockpit can run privately in the operator's self-hosted deployment. Local
watchlists, strategy notes, wallet context, bot rules, and logs stay local
unless the operator chooses to send feedback or authenticated context to
TradeOS. TradeOS sees the public-intelligence queries and paid scopes the
runtime sends.

That is why the cockpit is useful: it is not only a market summary. It is a
self-hosted decision layer that can recommend buy, sell, trim, avoid, watch, or
pass based on TradeOS evidence plus the operator's local rules. The self-hosted
operator owns what happens next.

This is the flagship architecture TradeOS wants builders to copy:

```text
TradeOS public or paid intelligence
        |
        v
Private self-hosted cockpit
        |
        v
Non-executable action intent -> local feasibility gate -> local EA/risk gate
        |
        v
Optional local execution adapter
        |
        v
User-owned wallet, exchange, or broker account
```

Future open-source modules can add feasibility checks, expected-advantage
checks, execution adapters, and a light operations dashboard. The control plane
still belongs to the self-hosted operator, not TradeOS.

## Five-Minute Paths

Clone and build from source:

```bash
git clone git@github.com:agenticsrclab/tradeos-public-intel-kit.git
cd tradeos-public-intel-kit
npm install
npm run build
```

### Run The Symbol Cockpit

The flagship self-hosted app now lives in `apps/symbol-cockpit` and exposes the
web/API/worker runtime described in the cockpit ADR.

```bash
export TRADEOS_PUBLIC_INTEL_KEY=<optional-public-intel-app-key>
npm run symbol-cockpit
```

Open `http://127.0.0.1:18100`, or run the app-level Compose stack:

```bash
cd apps/symbol-cockpit
cp .env.example .env
docker compose up
docker compose --profile risk up
docker compose --profile execution up
```

CLI and MCP consumers can use the same cockpit contracts:

```bash
npm run cli -- cockpit VVV --chain 8453 --mode trader
npm run cli -- preflight VVV --action buy --chain 8453
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
| Data Intel Credit linking | TradeOS sign-in or linked session identity | starter quota and DTI credit reconciliation |
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

Public API quota is earned, not unlimited:

| Profile | Reads/min | Reads/hour | Reads/day | Symbols/day | Path |
| --- | ---: | ---: | ---: | ---: | --- |
| Anonymous preview | 2 | 10 | 20 | 3 | try the kit without an account |
| Builder baseline | 5 | 50 | 100 | 10 | app key after starter expiry |
| Builder starter/earned | 10 | 100 | 250 | 20 | 7-day starter key or recent useful feedback |
| Reviewed project | 20 | 200 | 500 | 40 | submit `POST /quota-requests` and get operator approval |

Feedback writes are bounded too: app-key writes default to 10/minute and 100/day;
anonymous writes default to 5/minute per IP. App keys provide attribution and
reputation, not paid entitlement. Data Intel Credits unlock dashboard-only
depth; paid/x402 access is required for private intelligence products, scale,
alerts, exports, replay, automation, or data rights.

At launch, each free public read counts as one read unit. Batch, history,
export, alert, private-intelligence, and machine-scale surfaces are paid/x402
or entitlement-gated rather than stretched into the free public API.

Free public access is best-effort promotional access: no SLA, no guaranteed
availability, no cash value, and it may be rate-limited, changed, paused,
degraded, or revoked to protect TradeOS infrastructure. The free public pool is
capped separately so paid/x402/contract capacity can be preserved.

GUI Ask TradeOS follows the same conservative loop: 3 anonymous questions, 10
signed-in starter questions for 7 days, and 5-question feedback packs earned
with DTI credits.

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
| Earned public quota | useful app-attributed feedback or approved quota request | public read depth for real builder products |
| Feedback-credit depth | TradeOS account/session credit reconciliation | dashboard-only history, evidence depth, and review capacity |
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

Builder access:

```text
POST /api-keys          create an attributed builder key
POST /quota-requests    request reviewed public quota or paid evaluation
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

This kit can produce trade/action recommendation cards, but it does not place
trades from TradeOS infrastructure, accept exchange credentials, custody assets,
expose raw private telemetry, or guarantee that a token is safe. Execution,
allocation, approvals, and exchange keys belong in the individual operator's
private self-hosted environment.

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
