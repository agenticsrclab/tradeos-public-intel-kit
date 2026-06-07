# Symbol Cockpit And Action Agent

The TradeOS Symbol Cockpit is the flagship consumer workflow for this kit and
the clearest way to productize TradeOS intelligence:

```text
Enter a symbol -> get the good, bad, ugly, verdict, evidence, and next action.
```

The cockpit is meant to be private and self-hosted by the individual operator.
It can run on the operator's local machine, private server, internal quant
workstation, or agent host. TradeOS supplies the source-grounded intelligence layer.
The operator owns the runtime, private intelligence context, model key, bot
logic, account connectors, and execution stack.

That is the core product promise:

```text
TradeOS supplies intelligence.
The cockpit runs where the trader controls the keys.
Recommendations happen locally.
Execution, if enabled, is optional and user-owned.
```

## Current Trading-Intelligence Coverage

The current full trading-intelligence cockpit universe is **21 symbols**:

```text
BTC, ETH, SOL, ADA, DOGE, XRP, DOT, POL, LINK, UNI, VVV, KTA,
AVAX, NEAR, ARB, OP, SUI, APT, INJ, TIA, FET
```

In TradeOS service configs those appear as `BTCUSDT`, `ETHUSDT`, and the same
USDT-style forms; ingestion also maps them to Coinbase forms such as
`BTC-USD`. This 21-symbol set is the shared core across market ingestion,
price forecasts, directional bias, and dashboard forecast accuracy.

The cockpit accepts arbitrary symbols, but symbols outside this core should be
treated as **partial discovery/risk coverage** unless returned evidence proves
otherwise. Non-core assets may have token-discovery, token-risk, thesis,
public-candidate, or watchlist evidence. They should not be shown as having the
same forecast, directional-bias, and trading-evidence depth as the 21-symbol
core.

For the full table and operator rules, see
[Symbol Intelligence Coverage](symbol-intelligence-coverage.md).

## Why This Exists

SDKs and MCP tools are useful, but most traders do not ask for an SDK first.
They ask:

```text
Is this symbol good, bad, ugly, buy, sell, avoid, or watch?
```

The Symbol Cockpit turns TradeOS intelligence into a readable decision packet:

- a verdict;
- a trade/action recommendation;
- good drivers;
- bad drivers;
- ugly risks;
- confidence and freshness;
- evidence references;
- limitations;
- next steps;
- feedback buttons.

This is the point of the cockpit: it should help a user decide whether to buy,
sell, trim, avoid, watch, or pass. The boundary is execution and custody.
TradeOS does not hold keys or place orders. In a self-hosted deployment, the
self-hosted operator can combine TradeOS evidence with their own private rules,
wallet context, model key, and execution stack.

The cockpit also emits a non-executable action intent through
`@tradeos/action-intent`. That intent is a review artifact, not an order. It
does not include venue, account, size, order type, route, calldata, or an
execute URL. The operator must choose those locally before any paper or live
adapter can act.

The private self-hosted model should be presented as a feature, not a caveat.
Crypto traders and builders are sensitive to custody, key leakage, private
strategy, and account control. The cockpit gives them an actionable agent
without asking them to move those responsibilities into TradeOS.

## Cockpit Output Shape

Example for a long-tail token:

```json
{
  "symbol": "VVV",
  "chain": "8453",
  "verdict": "avoid_new_long",
  "action": "watch_or_trim",
  "recommendation_type": "trade_preflight",
  "confidence": 0.71,
  "good": [
    "Momentum improved versus the prior watch window.",
    "Sector interest remains above baseline."
  ],
  "bad": [
    "Fusion agreement degraded across proactive and reactive reads.",
    "Liquidity depth is not strong enough for aggressive entry."
  ],
  "ugly": [
    "Flow stress evidence is elevated.",
    "Recent drawdown follow-through has not fully stabilized."
  ],
  "next_steps": [
    "Avoid new long until flow stress normalizes.",
    "If already exposed, consider trimming or tightening risk controls.",
    "Set an alert for flow-stress normalization and fusion recovery."
  ],
  "evidence_refs": [
    "market_pulse:global:24h",
    "fusion:VVV:latest",
    "vpin:VVV:24h"
  ],
  "limitations": [
    "Self-hosted recommendation. Operator controls execution, sizing, custody, and risk."
  ]
}
```

Recommended verdict vocabulary:

| Verdict | Meaning |
| --- | --- |
| `buy_candidate` | Evidence is supportive enough to consider entry if local risk rules also pass. |
| `watch` | Some constructive evidence exists, but conditions are not strong enough. |
| `avoid_new_long` | Risk or evidence disagreement argues against a fresh entry. |
| `trim_or_reduce` | Existing exposure deserves review because risk has worsened. |
| `exit_or_sell_candidate` | Evidence has deteriorated enough to consider exit under local rules. |
| `insufficient_evidence` | TradeOS cannot produce a useful read with current public evidence. |

Use direct but reviewable language. The cockpit can say "buy candidate,"
"avoid new long," "trim weaker exposure," or "exit candidate" when the evidence
supports it. It should also show assumptions, invalidation, freshness, and risk
notes. It should not say "you will make money," hide uncertainty, or place an
order from TradeOS infrastructure.

## Action Agent

The Action Agent is the local runtime around the cockpit.

Core parts:

- chat assistant grounded in TradeOS evidence;
- symbol cockpit;
- watchlist scanners;
- recommendation inbox;
- local feasibility and EA/risk gates when enabled;
- optional local operations dashboard;
- feedback buttons;
- app-key attribution;
- BYO model provider, with Venice AI as the default OpenAI-compatible path;
- MCP/SDK/API integration points;
- optional paid TradeOS, x402, or enterprise access for production depth.

The action inbox should emit cards such as:

| Card | Example |
| --- | --- |
| Avoid entry | "VVV has elevated flow stress and fusion disagreement. Avoid new long for now." |
| Reduce exposure | "Three watchlist tokens show stress during a broader selloff. Review weaker names." |
| Watch recovery | "Flow stress is cooling, but fusion agreement is not restored. Watch only." |
| Bot preflight fail | "Your bot wants to buy this token. TradeOS risk gate failed: liquidity stress plus token warning." |
| Higher-quality candidate | "This watchlist item has stronger fusion, bias, and sector context than peers." |

Every card should preserve a stable target ID and evidence references so users
can submit feedback against the exact recommendation they saw.

## Default Recipes

Start with recipes builders can explain to real users:

| Recipe | Consumer Value |
| --- | --- |
| Flow-stress watcher | Warns when VPIN or liquidity stress makes a token harder to trust. |
| Fusion quality watcher | Flags when proactive/reactive agreement degrades. |
| Broader selloff watcher | Explains when token weakness may be market-wide. |
| Sector pressure watcher | Shows whether the asset is fighting its sector. |
| Token-risk watcher | Surfaces tokenomics, liquidity, sellability, contract, or identity issues. |
| Forecast/bias divergence watcher | Warns when forecast, bias, and price action disagree. |
| Bot preflight gate | Lets a bot ask TradeOS whether a proposed trade has obvious intelligence risk. |
| Weekly thesis drift summary | Tells longer-term users what got better, worse, or stale. |

Investor mode should default to lower-noise risk and thesis drift. Trader mode
can include faster fusion, forecast, and invalidation checks.

## Privacy Modes

Self-hosting makes the runtime private by deployment, but API calls to TradeOS
still disclose the symbols and authenticated scopes requested. Make that clear
in your UI and docs.

| Mode | What Stays Local | What Goes To TradeOS |
| --- | --- | --- |
| Public Intel Mode | local UI state, optional notes | symbol, chain, horizon, public intelligence query |
| Private Local Mode | portfolio, strategy, bot rules, memory, logs, wallet context | generic symbol or market queries only |
| Attributed Feedback Mode | local private intelligence context unless included by the user | target ID, label, provenance, optional app/user attribution |
| Paid / Private Intelligence Mode | local runtime and execution keys | authenticated paid requests, entitlement context, explicit paid/private query scope |

Default rules:

- do not send private keys or exchange credentials to TradeOS;
- do not send strategy notes unless the user explicitly includes them;
- keep model-provider keys local or server-side;
- make feedback opt-in and provenance-rich;
- separate app attribution from user identity;
- show when a feature needs paid TradeOS, x402, or account authentication.

## How Builders Make Money

The cockpit gives builders a concrete product surface:

```text
TradeOS supplies intelligence.
The builder sells a private cockpit, watchlist, alerts, bot preflight, or team workflow.
```

Monetizable packages:

- private symbol cockpit for active traders;
- paid watchlist monitor for communities;
- token risk cockpit for token teams;
- bot preflight plugin for automated traders;
- quant validation dashboard for funds;
- team research inbox for analyst groups.

TradeOS gets paid when the product needs production volume, alert delivery,
webhooks, automation-safe reads, private intelligence context, premium history,
validation APIs, x402 resources, or data rights.

## Future Open-Source Ecosystem

The long-term ecosystem can grow in phases:

1. Public Intelligence Kit and Symbol Cockpit.
2. Bot preflight runtime.
3. Open-source feasibility, EA/risk, and light operations dashboard components.
4. Optional open-source execution adapters.

Even when execution adapters exist, TradeOS should remain the intelligence and
validation product layer. Users should own keys, approvals, bot logic, and
execution infrastructure.

Recommended control-plane shape:

```text
TradeOS intelligence API
        |
        v
Private self-hosted Symbol Cockpit
        |
        v
Local feasibility gate -> local EA/risk gate -> optional execution adapter
        |
        v
User-owned wallet, exchange, or broker account
```

## Reference Implementation

The distribution kit now includes a runnable reference implementation:

```text
apps/symbol-cockpit
  web UI, local API, scanner worker, app-level Docker Compose

packages/cockpit-core
  verdict packet, recommendation card, bot preflight, recipes

packages/policy-core
  local feasibility, account-gate, approval, kill switch, actionability logic

packages/tradeos-connectors
  TradeOS public-intel aggregation and Venice/OpenAI-compatible action agent

modules/feasibility
modules/ea-risk
modules/execution-gateway
modules/ops-dashboard
modules/notification-router
```

Run it locally:

```bash
export TRADEOS_PUBLIC_INTEL_KEY=<optional-public-intel-app-key>
npm run symbol-cockpit
```

Run headless integration tests for the web UI, API, recommendation inbox,
operator alert path, preflight, action agent, paper execution, kill switch, and
ops dashboard:

```bash
npm run symbol-cockpit:e2e
```

Operator review email alerts are disabled by default. Enable them with the same
shared SMTP settings used by the existing TradeOS services:

```bash
COCKPIT_ALERT_EMAIL_ENABLED=true
COCKPIT_ALERT_EMAIL_TO=tradeos.contact@gmail.com
COCKPIT_ALERT_EMAIL_MIN_SEVERITY=warning
COCKPIT_FEEDBACK_BASE_URL=https://tradeos.tech/feedback
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-user>
SMTP_PASSWORD=<smtp-password-or-app-password>
```

Email alerts include the recommendation, price at note when present in
evidence, target price when present in evidence, the driver groups that caused
the card, evidence refs, and buttons for structured feedback. The buttons open
`COCKPIT_FEEDBACK_BASE_URL` with stable target IDs and a suggested label; the
default hosted TradeOS page records normalized intelligence feedback. Builders
can replace this with their own hosted page or set `COCKPIT_PUBLIC_BASE_URL`
and point links to the self-hosted cockpit `/feedback` page.

See [Integration Keys And URLs](integration-keys-and-urls.md) for TradeOS,
Venice, SMTP, local runtime, and live e2e configuration.

Run the Compose topology:

```bash
cd apps/symbol-cockpit
cp .env.example .env
docker compose up
docker compose --profile risk up
docker compose --profile execution up
```

The execution gateway is paper-only. It rejects live mode, requires
`account_gates_applied=true` for entries, and respects the local kill switch.
