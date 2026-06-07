# Flagship Product: Symbol Cockpit

The TradeOS Symbol Cockpit is the flagship product pattern in this kit. It is a
private self-hosted decision cockpit that turns TradeOS source-grounded market
intelligence into a readable symbol packet:

```text
symbol -> good / bad / ugly -> verdict -> evidence -> next action -> feedback
```

It is built for operators and builders who want a useful crypto intelligence
product without sending exchange keys, wallet keys, portfolio state, strategy
memory, or execution control to TradeOS.

## What It Is

The Symbol Cockpit is a local web/API runtime in `apps/symbol-cockpit`. A user
enters a symbol and the cockpit calls TradeOS public intelligence, applies local
recipes and optional local gates, and returns a recommendation card.

The card can say things such as:

```text
buy candidate
watch
avoid new long
trim or reduce
exit or sell candidate
insufficient evidence
```

Those are local review recommendations, not TradeOS-hosted orders. The cockpit
can help a user decide what deserves attention, but the user still owns final
approval, sizing, execution, custody, and risk.

## Who It Helps

| Consumer | Value |
| --- | --- |
| Active trader | Faster symbol review without uploading keys or strategy memory. |
| Token team | Source-grounded read on risk, liquidity stress, identity, and market context. |
| Research desk | Repeatable good/bad/ugly review packets with evidence refs and caveats. |
| Paid community | A private cockpit, watchlist, or bot preflight product that feels concrete to members. |
| Bot builder | A local preflight gate that explains why a proposed trade looks risky or unsupported. |

## Consumer Value

The cockpit gives users a practical answer to a common question:

```text
Does this symbol look good, bad, ugly, actionable, risky, stale, or too thin to trust?
```

It creates value by combining:

- TradeOS market intelligence and evidence refs;
- token identity and source coverage discipline;
- local verdict recipes;
- optional local feasibility and expected-advantage/risk checks;
- private local watchlists, notes, logs, and approval rules;
- feedback buttons tied to stable target IDs.

The key product advantage is private control. TradeOS supplies intelligence.
The cockpit runs where the user controls keys, rules, approvals, and execution.

## How To Read The App

### Verdict

The verdict is the top-level read. It should be direct but reviewable:

```text
buy candidate
watch
avoid new long
trim or reduce
exit or sell candidate
insufficient evidence
```

Treat the verdict as a prompt for review, not an order.

### Good, Bad, Ugly

The cockpit organizes drivers into three groups:

| Section | Meaning |
| --- | --- |
| Good | Constructive evidence such as better momentum, stronger agreement, improving risk, or supportive sector context. |
| Bad | Weakening evidence such as degraded agreement, thin liquidity, stale source coverage, or poor setup quality. |
| Ugly | Higher-conviction risk such as flow stress, identity risk, sellability issues, or risk that should block aggressive action. |

### Confidence And Freshness

Confidence summarizes how much the current evidence supports the verdict.
Freshness tells the user whether the read depends on current or stale evidence.
Low confidence or stale evidence should push the user toward `watch`,
`insufficient evidence`, or manual review.

### Evidence Refs

Evidence refs are stable pointers to the TradeOS context behind the read. They
make the packet reviewable and give feedback a precise target.

Examples:

```text
market_pulse:global:24h
fusion:VVV:latest
vpin:VVV:24h
watchlist_snapshot:VVV:latest
```

### Next Action

The next action explains what a user might review next:

```text
avoid new long until flow stress normalizes
review weaker exposure
watch for fusion recovery
run bot preflight before entry
request deeper evidence
```

The cockpit should show assumptions, caveats, and invalidation. It should not
promise returns, hide uncertainty, or place trades from TradeOS infrastructure.

### Feedback Buttons

Feedback buttons let a user label the exact card they saw:

```text
useful
wrong
too early
too late
missed move
evidence too thin
```

Feedback can improve TradeOS intelligence quality, app reputation, and eligible
Data Intel Credit flows. DTI credits remain account-based credits inside
TradeOS dashboards and apps; they do not unlock paid APIs, x402, exports,
automation, execution, or private data rights.

## How To Bring It Online

### System Requirements

Recommended local requirements:

| Requirement | Recommendation |
| --- | --- |
| Node.js | Node 20 or newer. |
| npm | npm 10 or newer. |
| Browser | Current Chrome, Edge, Safari, or Firefox. |
| Network | Outbound HTTPS access to `https://api.tradeos.tech/v1/public-intel`. |
| Docker | Optional, Docker 24 or newer for Compose topology. |
| Memory | 2 GB free memory for the local cockpit runtime; more if running optional modules. |

The cockpit is designed to run on a laptop, private server, quant workstation,
or agent host. It does not require a GPU.

### Required Dependency

The only required external service for the basic cockpit is:

```text
https://api.tradeos.tech/v1/public-intel
```

Keyless public reads work with server-side limits. A
`TRADEOS_PUBLIC_INTEL_KEY` is optional and recommended for builder attribution,
app reputation, support, and higher-trust production usage.

### Optional Dependencies

| Dependency | Purpose |
| --- | --- |
| `TRADEOS_PUBLIC_INTEL_KEY` | App attribution, abuse controls, app reputation, and potential quota review. |
| Venice or OpenAI-compatible key | BYOK action-agent explanations over TradeOS evidence. |
| SMTP settings | Operator alert emails for recommendation review. |
| Docker Compose | Local multi-service topology. |
| Local modules | Feasibility, EA/risk, paper execution gateway, ops dashboard, and notification router. |

### Quick Start

From the repository root:

```bash
npm install
export TRADEOS_PUBLIC_INTEL_KEY=<optional-public-intel-app-key>
npm run symbol-cockpit
```

Open:

```text
http://127.0.0.1:18100
```

Health check:

```bash
curl http://127.0.0.1:18100/healthz
```

### App-Level Setup

```bash
cd apps/symbol-cockpit
cp .env.example .env
npm install
npm run dev:api
```

The default `.env.example` starts with a small sample watchlist:

```text
VVV,BTC,ETH,SOL
```

The full current cockpit trading-intelligence universe is:

```text
BTC, ETH, SOL, ADA, DOGE, XRP, DOT, POL, LINK, UNI, VVV, KTA,
AVAX, NEAR, ARB, OP, SUI, APT, INJ, TIA, FET
```

Symbols outside that set can still return partial discovery or risk evidence,
but should not be presented as having the same full forecast, bias, and
trading-evidence depth.

### Docker Compose

```bash
cd apps/symbol-cockpit
cp .env.example .env
docker compose up
```

Optional local risk modules:

```bash
docker compose --profile risk up
```

Optional paper execution gateway:

```bash
docker compose --profile execution up
```

The execution gateway in this kit is paper-only. It rejects live mode, requires
local account gates for entries, and respects the local kill switch.

## Runtime Surfaces

| Surface | Default Port | Purpose |
| --- | ---: | --- |
| Cockpit API and web UI | `18100` | Main local runtime and browser app. |
| Optional static web server | `18101` | Separate static server when needed. |
| Feasibility module | `18110` | Local gate for setup/account feasibility contracts. |
| EA/Risk module | `18120` | Local expected-advantage and risk gate. |
| Paper execution gateway | `18130` | Paper-only fills and execution-boundary tests. |
| Ops dashboard helper | local module | Recommendation, approval, audit, and kill-switch snapshots. |

## Key Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `TRADEOS_API_BASE` | No | Defaults to `https://api.tradeos.tech/v1/public-intel`. |
| `TRADEOS_PUBLIC_INTEL_KEY` | No | Optional app attribution key. |
| `LLM_PROVIDER` | No | Defaults to `venice`. |
| `OPENAI_BASE_URL` | No | OpenAI-compatible model endpoint. |
| `VENICE_API_KEY` or `OPENAI_API_KEY` | No | BYOK model inference for action-agent explanations. |
| `TRADEOS_AGENT_MODEL` | No | Model name for the BYOK action agent. |
| `COCKPIT_BIND_HOST` | No | Defaults to `127.0.0.1`. |
| `COCKPIT_API_PORT` | No | Defaults to `18100`. |
| `COCKPIT_WATCHLIST` | No | Symbols scanned by the local worker. |
| `COCKPIT_SUBMIT_FEEDBACK` | No | Defaults to `false`; controls automated feedback writes. |
| `COCKPIT_ALERT_EMAIL_ENABLED` | No | Enables operator alert emails. |
| `SMTP_*` / `COCKPIT_SMTP_*` | No | SMTP settings for operator alerts. |
| `EXECUTION_MODE` | No | Only `paper` is supported in this kit. |

Keep keys in `.env`, shell exports, a deployment secret store, or CI secrets.
Do not commit `.env` files, model-provider keys, TradeOS account tokens,
exchange keys, or wallet keys.

## Test And Verification

Run unit tests for the cockpit package:

```bash
npm --workspace @tradeos/symbol-cockpit run test
```

Run typecheck:

```bash
npm --workspace @tradeos/symbol-cockpit run typecheck
```

Run headless UI/API integration tests:

```bash
npm --workspace @tradeos/symbol-cockpit run e2e:headless
```

Run a live local e2e sweep against a running cockpit:

```bash
npm --workspace @tradeos/symbol-cockpit run e2e:live
```

Feedback writes are skipped by default in live e2e. Enable one feedback write
only when the target environment is meant to receive it:

```bash
COCKPIT_E2E_SUBMIT_FEEDBACK=true npm --workspace @tradeos/symbol-cockpit run e2e:live
```

## Safety Boundary

The cockpit is allowed to produce local recommendations such as `buy
candidate`, `watch`, `avoid new long`, `trim`, or `exit candidate` when the
evidence supports that language.

The cockpit must not:

- custody assets;
- ask for exchange or wallet private keys;
- run a third-party managed account service;
- promise returns;
- hide uncertainty;
- send local strategy notes to TradeOS unless the user explicitly includes them;
- treat DTI credits as paid API entitlement;
- route live orders through TradeOS infrastructure.

## Where To Go Next

- [Symbol Cockpit And Action Agent](symbol-cockpit-agent.md) for detailed
  runtime architecture, verdict vocabulary, privacy modes, and reference
  implementation notes.
- [Symbol Intelligence Coverage](symbol-intelligence-coverage.md) for the
  current 21-symbol full trading-intelligence universe.
- [Integration Keys And URLs](integration-keys-and-urls.md) for API keys,
  model-provider keys, SMTP, local runtime URLs, and e2e settings.
- [Action Intents](action-intents.md) for the non-executable bridge between
  recommendations and local operator workflows.
- [Safety Boundaries](safety-boundaries.md) for product claims, custody,
  execution, and managed-account limits.
