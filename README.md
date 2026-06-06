# TradeOS Public Intelligence Kit

Build market intelligence products on top of [TradeOS public evidence](https://tradeos.tech/market).

This kit gives builders source-backed public market context, MCP tools, SDKs,
and bring-your-own-key agent examples. TradeOS hosts the intelligence API. Users
bring their own model provider when they want LLM summaries, so you can build
agents and products without sending inference cost to TradeOS.

The practical idea is simple: use the free public kit to prove a customer
workflow, charge for the packaging around it, and upgrade to paid TradeOS when
the workflow needs scale, automation, premium data, exports, alerts, or x402
machine access.

## Explore TradeOS

- [TradeOS app](https://tradeos.tech): product entry point.
- [Live market intelligence](https://tradeos.tech/market): public market pulse,
  digest context, evidence cards, and feedback entry points.
- [Ask TradeOS](https://tradeos.tech/ask): public-intelligence questions grounded
  in TradeOS evidence.
- [Developer Keys](https://tradeos.tech/developer/api-keys): create app keys for
  attribution and feedback provenance.
- [Review Lab](https://tradeos.tech/review): label public evidence and see how
  feedback fits into the credit loop.
- [How TradeOS Works](https://tradeos.tech/how-it-works): product background and
  safety boundaries.
- [Public docs](https://tradeos.tech/docs/): deeper TradeOS documentation.

## Domain Space

TradeOS sits in the public market-intelligence layer for crypto and on-chain
markets. The kit is for builders who need current, source-backed market context
inside products, bots, dashboards, agent workflows, research tools, and
validation systems.

This is not an exchange connector or an execution framework. It is an evidence
and feedback layer:

- public digest inputs, candidates, watchlists, thesis records, proof lookups,
  caveats, freshness, source refs, and invalidation notes;
- SDK, CLI, and MCP surfaces that agent hosts and apps can consume;
- structured feedback writes with provenance so TradeOS can learn which public
  intelligence was useful, early, late, thin, or confusing;
- a free-to-paid path where successful builder workflows can graduate to paid
  TradeOS data, exports, alerts, validation APIs, x402 machine access, or
  enterprise integrations.

## Motivation And Background

Most market tools force builders into one of two weak choices: ship generic LLM
summaries with no durable evidence, or spend months building data pipelines
before they can test whether users care. TradeOS public intelligence is meant to
sit between those extremes.

The motivation for this kit is to let developers build useful products first:

- get live public market evidence without operating the TradeOS core stack;
- ground LLM and agent answers in bounded source-backed context;
- keep model inference BYOK so builders and users control their own provider
  cost;
- collect structured feedback from humans, agents, and automation;
- give TradeOS a credit/reputation loop while giving builders product ideas
  they can monetize.

The commercial loop is intentional: builders use public intelligence to create
products that make money, users send feedback that improves the intelligence
surface, and TradeOS earns when those products need production-grade depth,
scale, or paid machine access.

## Venice AI Ecosystem Fit

This kit is designed to be useful in a Venice AI or any OpenAI-compatible BYOK
ecosystem because it gives agents something concrete to reason over. The model
provider handles inference; TradeOS provides public market evidence, stable
target IDs, caveats, and feedback endpoints.

For a Venice-powered app, this enables:

- **grounded market answers**: the CLI and bot examples fetch TradeOS evidence
  first, then ask a Venice-compatible model to summarize it;
- **user-paid inference**: builders do not need TradeOS to subsidize LLM calls;
  users or app operators bring their own Venice key;
- **agent-native distribution**: MCP tools let local agent hosts read market
  context and submit structured feedback;
- **ecosystem feedback**: apps can report whether an answer, digest, thesis, or
  evidence packet was useful, creating a loop that improves TradeOS public
  intelligence over time;
- **clear safety boundaries**: the kit avoids custody, exchange credentials,
  order placement, and personalized financial advice, which makes it suitable
  for research, monitoring, education, validation, and workflow products.

The ecosystem value is that Venice-compatible agents get a live public market
memory and feedback loop, while TradeOS gains distribution, labels, and demand
signals for paid data products.

## What You Can Build

- Paid crypto research products that use TradeOS evidence as the intelligence
  layer.
- Subscription communities with TradeOS-powered market digest bots and feedback
  loops.
- Watchlist and alert products that turn public thesis/candidate data into
  paid monitoring workflows.
- Tradebot intelligence layers that make an existing bot more context-aware
  with market state, caveats, thesis changes, and invalidation notes.
- Quant validation workflows where a shop prototypes against public candidates
  and upgrades for paid history, regimes, outcomes, and validation data.
- Creator tools that generate source-backed newsletters, threads, or briefings.
- Claim/proof pages for analysts who want auditable public calls and outcome
  tracking.
- Research copilots that answer questions from current TradeOS public evidence.
- Portfolio context widgets that explain market state without giving trade
  instructions.
- Feedback loops where users label useful, early, late, thin, or confusing
  intelligence and help improve the public signal surface.

More examples: [Use Cases](docs/use-cases.md)

Feedback and provenance model:
[Feedback Credit Loop](docs/feedback-credit-loop.md)

## How Builders Make Money

Customers usually do not pay for "an API" by itself. They pay for time saved,
monitoring they trust, better context inside an existing workflow, proof they
can share, or validation that helps them decide whether their own system is
working.

Use TradeOS public intelligence as the evidence layer, then sell one of these
packages:

| Paid Package | Customer Pain | What The Builder Sells | TradeOS Upgrade Trigger |
| --- | --- | --- | --- |
| Research digest | too much noisy market information | edited briefings, archive, member access | more volume, custom universe, paid market pulse |
| Community bot | generic bots cannot answer market context | server commands, scheduled summaries, member feedback | high-volume reads, remote bridge when available, team access |
| Watchlist monitor | users miss thesis degradation or stale evidence | saved lists, change tracking, alerts, dashboard seats | alert delivery, webhooks, custom watchlists |
| Tradebot context layer | bot decisions are hard to explain or stress-test | caveats, regime context, invalidation notes, post-trade review | automation-safe API, private forecasts, premium context |
| Quant validation pack | shops need outside labels to benchmark signals | exports, disagreement reports, replay/evaluation workflows | historical datasets, validation API, enterprise contract |
| Claim/proof page | analysts need auditable calls | public profile, proof pages, outcome tracking | paid proof tooling, team/creator analytics |

The public kit lets builders reach a useful demo quickly. Paid TradeOS starts
when their customers ask for production-grade volume, automation, history,
delivery, private context, or explicit paid entitlement.

Concrete launch recipes: [Builder Revenue Playbook](docs/builder-revenue-playbook.md)

Setup and key-management path: [Distribution Setup Guide](docs/distribution-setup-guide.md)

## Monetizable Product Ideas

This kit is not a trading bot. The commercial opportunity is building products
that package TradeOS public intelligence into useful workflows:

| Product | Who Pays | TradeOS Intelligence Used | Revenue Model |
| --- | --- | --- | --- |
| Paid research digest | Traders, analysts, funds, communities | digest inputs, source refs, caveats, confidence | subscription newsletter or member tier |
| Discord/Telegram market bot | token communities, DAOs, trading groups | market digest, candidates, watchlist, feedback labels | SaaS bot fee or community upsell |
| Watchlist monitor | active researchers and token teams | thesis watchlist, invalidation notes, freshness | paid dashboard, saved watchlists, alerts |
| Tradebot intelligence layer | bot builders, quant developers | public digest context, candidates, invalidation notes; paid regimes/private context | paid plugin, private integration, premium bot tier |
| Quant validation dataset | quant shops, funds, research teams | public schema/live samples; paid historical outcomes, regimes, evidence history | paid data export, validation API, enterprise contract |
| Claim/proof explorer | analysts, creators, research desks | public claims, proof status, outcome feedback | creator page, paid reports, reputation tooling |
| Market context widget | wallets, dashboards, data portals | public digest, risk caveats, source snapshots | B2B widget/API subscription |
| Feedback-powered community ranking | research communities | stable target IDs, feedback writes, accepted labels | premium community analytics |

TradeOS provides the evidence layer. Builders monetize packaging,
distribution, workflow, audience, validation, and feedback loops. TradeOS
monetizes the production layer when successful products need paid data,
entitlements, x402, exports, alerts, automation, or enterprise support.

The public kit is the integration and discovery surface. Live execution,
automation, high-volume validation, historical exports, custom watchlists, and
private forecasts belong in paid TradeOS surfaces.

More detail: [Monetization Guide](docs/monetization.md) and
[Builder Revenue Playbook](docs/builder-revenue-playbook.md)

## Why Builders Use It

- **Public intelligence, not raw data plumbing**: consume bounded digest,
  candidate, thesis, proof, and evidence surfaces.
- **Commercially useful context**: turn TradeOS evidence into paid reports,
  community bots, dashboards, widgets, bot intelligence layers, quant validation
  workflows, and analyst products.
- **Agent-native**: plug into Claude Desktop, Cursor, local MCP clients, or your
  own agent runtime.
- **BYOK inference**: Venice AI is the default OpenAI-compatible provider, and
  any compatible provider can be configured.
- **Feedback-aware**: every public object has stable IDs so useful feedback can
  become credit, quality signal, and product learning.
- **Clear safety boundary**: this kit does not place trades, accept exchange
  credentials, expose private telemetry, or provide personalized financial
  advice.

## Five-Minute Paths

### Run The Market Briefing Bot

This is the first recommended bot to fork: a source-backed Discord/Telegram
market briefing worker.

```bash
npm install
npm run build
npm run briefing-bot -- brief
```

That works without a TradeOS account and without an LLM key. It prints a
deterministic briefing from live public evidence.

Use Venice AI for a stronger natural-language brief:

```bash
export VENICE_API_KEY=...
npm run briefing-bot -- brief
```

Test the post path locally without Discord or Telegram:

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

```bash
npm install -g @tradeos/public-intel-agent-cli

VENICE_API_KEY=your_venice_key \
tradeos-intel ask "What changed in crypto market stress?"
```

Fetch evidence without an LLM:

```bash
tradeos-intel digest --limit 5
tradeos-intel watchlist --limit 5
```

Submit feedback:

```bash
tradeos-intel feedback \
  --target-id digest_123 \
  --target-type digest \
  --label useful \
  --note "Clear and timely"
```

### Add TradeOS To An MCP Host

Claude Desktop example:

```json
{
  "mcpServers": {
    "tradeos-public-intel": {
      "command": "npx",
      "args": ["-y", "@tradeos/public-intel-mcp-server"],
      "env": {
        "TRADEOS_API_BASE": "https://api.tradeos.tech/v1/public-intel"
      }
    }
  }
}
```

The MCP server is stdio-based today. The reserved hosted MCP endpoint is:

```text
https://mcp.tradeos.tech/public-intel
```

It will become the zero-local-infrastructure path after the hosted HTTP MCP
bridge is deployed.

### Use The TypeScript SDK

```bash
npm install @tradeos/public-intel-sdk
```

```ts
import { TradeOSPublicIntelClient } from "@tradeos/public-intel-sdk";

const client = new TradeOSPublicIntelClient();

const digest = await client.getMarketDigest({ limit: 5 });

await client.submitDigestFeedback({
  targetType: "digest",
  targetId: "digest_123",
  label: "useful",
  optionalNote: "The caveats were clear.",
});
```

### Use The Python SDK

```bash
pip install tradeos-public-intel
```

```python
from tradeos_public_intel import TradeOSPublicIntelClient

client = TradeOSPublicIntelClient()
digest = client.get_market_digest(limit=5)
```

Python 3.11 or newer is required.

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

## Contribute Apps, Tools, And Services

This kit is meant to be a builder surface, not just a client library. TradeOS
welcomes contributions that help developers turn public intelligence into useful
products and send structured feedback back to the intelligence loop.

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

## Public API

Default production base URL:

```text
https://api.tradeos.tech/v1/public-intel
```

Useful public reads:

```text
GET /sources/health
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
```

More detail: [Public API](docs/public-intel-api.md)

## Access, Credits, And Payment

The kit follows the same TradeOS free-to-paid pattern:

| Layer | What It Unlocks | Expiry / Boundary |
| --- | --- | --- |
| Free public kit | bounded public reads and structured feedback writes | server-side rate limits may apply |
| Anonymous starter ask | 3 public-intelligence questions | anonymous/session quota boundary |
| Signed-in starter ask | 20 public-intelligence questions | expires 7 days from first activation |
| Feedback credits | dashboard-only depth such as longer history, deeper evidence, more symbols, and more public refreshes | 30-day unlock by default |
| Paid TradeOS | automation, alerts, exports, premium data, validation APIs, enterprise access | paid entitlement or x402 payment |

Credits and starter quota do not unlock x402 calls, bulk exports, raw premium
data, webhooks, bot automation, execution, custody, private forecasts, or
personalized financial advice.

Free public API reads do not have a credit-style expiry. The explicit time
boxes are signed-in starter ask access for 7 days and feedback-credit dashboard
depth for 30 days by default.

x402 is the paid machine-payment path for TradeOS paid resources. Public x402
discovery starts at:

```text
https://tradeos.tech/.well-known/x402.json
https://tradeos.tech/x402/v1/listings
https://tradeos.tech/x402/v1/openapi.json
```

More detail: [Access And Payments](docs/access-and-payments.md)

## Account And API Key Model

Builders and users should not need a TradeOS account just to try the public kit.

| Mode | Who Needs A TradeOS Account? | Credential | What It Enables |
| --- | --- | --- | --- |
| Public trial | nobody | none | bounded public reads and feedback writes |
| Builder app attribution | builder | optional `TRADEOS_PUBLIC_INTEL_KEY` | app identity, abuse controls, support, potential higher public limits |
| User credit linking | end user only if they want TradeOS credit/dashboard benefits | TradeOS sign-in or linked user/session identity | starter quota and feedback-credit reconciliation |
| Builder-paid product | builder | paid API key, contract entitlement, or x402 wallet/payment | premium resources inside the builder's product |
| User-paid agent/tool | end user | their own TradeOS entitlement or x402 payment | user brings paid access to a third-party tool |

Default flow:

```text
No account -> try public kit -> submit feedback anonymously
Builder gets traction -> register app / configure optional public key
User wants credits -> link or sign in with TradeOS
Workflow needs premium data -> builder or user pays through x402/API entitlement
```

The best SaaS pattern is usually builder-paid: the builder keeps TradeOS
credentials server-side, charges their own customers, and upgrades TradeOS when
their product needs paid features. User-paid works better for developer tools,
agents, and power-user workflows where the user intentionally brings their own
TradeOS entitlement or x402 wallet.

TradeOS can issue public-intel app keys for signed-in, email-verified builder
accounts. The normal path is the TradeOS Developer Keys dashboard. The CLI can
validate `TRADEOS_PUBLIC_INTEL_KEY` and can manage app keys when
`TRADEOS_ACCOUNT_TOKEN` is set for trusted automation:

```bash
tradeos-intel auth
tradeos-intel keys create --app-name my-public-intel-app
tradeos-intel keys list
tradeos-intel keys revoke --key-id pubkey_...
```

Existing app-key secrets are not retrievable. Create or rotate a key, copy the
one-time secret, and keep it server-side.

Feedback can identify whether a label came from a human, human-assisted agent,
agent, or automation. TradeOS should weight those differently: linked human
feedback can earn normal dashboard credits, while raw agent/automation feedback
is still valuable for quality, attribution, and app reputation but should not
earn the same user credit by default.

More detail: [API Keys And Feedback Provenance](docs/api-keys-and-feedback-provenance.md)

## Feature Unlock Loop

From this kit's perspective, more features come from TradeOS service access, not
from hidden local code in the SDK/MCP/CLI.

```text
1. Builder installs the free kit.
2. Builder ships public features using digest, candidates, watchlist, proof, and feedback writes.
3. End users interact with the builder product and submit structured feedback.
4. TradeOS uses stable target IDs to reconcile feedback, quality signals, and dashboard credits.
5. Credits can unlock temporary dashboard-only depth for the user.
6. When the workflow needs production features, the builder calls paid TradeOS/x402 surfaces.
7. TradeOS checks entitlement or payment and returns the premium feature data.
8. The builder product exposes the paid feature to its customer.
```

Feature sources:

| Feature Type | How The Builder Gets It | Example |
| --- | --- | --- |
| Free public features | included in this kit against `api.tradeos.tech/v1/public-intel` | digest, candidates, watchlist, proofs, feedback writes |
| Package improvements | upgrade npm/PyPI packages when TradeOS ships new public tools | new SDK helper, MCP tool, CLI command |
| Feedback-credit depth | server-side TradeOS account/session credit reconciliation | more dashboard history, deeper evidence, more public refreshes |
| Paid machine features | x402 payment or paid API entitlement | premium market pulse, validation API, automation-safe reads |
| Enterprise features | contract/API key/private deployment | custom universe, bulk exports, replay datasets, support |

The local kit should make the upgrade path visible, but it should not pretend to
unlock paid data by itself. Paid features come from TradeOS authorization,
x402 payment, or enterprise entitlement.

## Repository Layout

- `packages/sdk-js`: TypeScript SDK.
- `packages/sdk-python`: Python SDK.
- `packages/mcp-server`: stdio MCP server for local agent hosts.
- `apps/tradeos-agent-cli`: BYOK CLI for evidence reads, Venice-backed asks,
  and feedback writes.
- `apps/market-briefing-bot`: Discord, Telegram, and stdout market briefing bot
  powered by TradeOS public evidence.
- `examples`: Claude Desktop, Cursor, Venice, and generic OpenAI-compatible
  configuration.
- `docs`: architecture, use cases, monetization, builder revenue playbook, API,
  API keys and feedback provenance, MCP tools, feedback loop, access and
  payments, paid boundaries, safety boundaries, production readiness, and
  consumer e2e notes.

## Product Boundary

```text
Free: consume source-backed TradeOS public intelligence.
Starter ask: 3 anonymous questions or 20 signed-in questions for 7 days.
Feedback credits: earn 30-day dashboard depth by improving intelligence quality.
BYOK agents: users pay their own inference provider.
Paid TradeOS: automate, query at scale, export, alert, validate, and build on premium data.
```

## Safety Boundary

This kit does not place trades, provide personalized financial advice, accept
exchange credentials, or expose raw private telemetry. Public intelligence is
descriptive evidence, not an instruction to buy, sell, or allocate capital.

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

See [Consumer E2E](docs/consumer-e2e.md).

Before making the repository public, run the publish gate in
[Production Readiness](docs/production-readiness.md).

## TradeOS Links

- [Homepage](https://tradeos.tech)
- [Market dashboard](https://tradeos.tech/market)
- [Ask TradeOS](https://tradeos.tech/ask)
- [Developer Keys](https://tradeos.tech/developer/api-keys)
- [Public machine-readable docs](https://tradeos.tech/llms.txt)
- [x402 discovery](https://tradeos.tech/.well-known/x402.json)
- [x402 listings](https://tradeos.tech/x402/v1/listings)
