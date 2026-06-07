# Marketplace Model

TradeOS is a crypto intelligence marketplace. The public kit is the
builder distribution layer for that marketplace: it lets apps, agents, bots,
dashboards, and research products consume public intelligence, package it into
workflows customers can use, and return feedback with provenance.

The marketplace model has four parts:

| Part | Meaning | Public Kit Role |
| --- | --- | --- |
| Intelligence supply | TradeOS source-backed evidence, candidates, thesis records, proof state, caveats, freshness, and stable IDs | expose public-safe reads through SDKs, CLI, and MCP |
| Product demand | builders, analysts, communities, agents, token teams, funds, wallets, and dashboards that need market context | make integration fast enough to build sellable products |
| Feedback quality loop | human, agentic, or automated labels on stable public targets | write provenance-rich feedback so TradeOS can improve quality and credit eligible users |
| Paid depth | scale, alerts, automation-safe reads, premium history, validation APIs, private context, data rights, and enterprise support | route successful workflows to paid TradeOS, x402, or enterprise access |

## Builder Mental Model

```text
TradeOS supplies the intelligence layer.
The builder sells the workflow around the intelligence.
Customers pay for saved time, monitoring, proof, validation, or integration.
Feedback improves intelligence quality and can create dashboard credit signals.
Paid TradeOS starts when the workflow needs production depth, scale, or rights.
```

The product should not be "API access." It should be a workflow customers
already understand:

```text
market briefing
community bot
watchlist monitor
alert workflow
token context widget
claim/proof page
analyst notebook
tradebot context layer
quant validation pack
```

## Public To Paid Path

```text
1. Builder proves a workflow with free public intelligence.
2. Users consume the product and submit structured feedback.
3. TradeOS reconciles stable target IDs into quality signals and credits.
4. The builder monetizes packaging, workflow, distribution, and support.
5. The workflow upgrades to paid TradeOS, x402, or enterprise access when it
   needs more symbols, refresh, alerts, automation, validation, exports, private
   context, or explicit data rights.
```

## What Belongs In The Marketplace

Use the public kit for:

```text
source-backed context
freshness and caveats
candidate and thesis discovery
token watchlist snapshots
public proof lookups
feedback collection
builder attribution
agent and bot grounding
```

Use paid or private TradeOS for:

```text
high-volume production reads
premium market pulse
alert delivery and webhooks
automation-safe APIs
historical exports and replay datasets
private forecasts or context
custom universes
enterprise contracts and data rights
```

Do not use the marketplace framing to imply guaranteed trading performance,
personalized financial advice, custody, exchange connectivity, raw private
telemetry, or trade execution.
