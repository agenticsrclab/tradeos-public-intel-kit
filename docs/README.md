# TradeOS Public Intelligence Kit Docs

This directory explains how to build, ship, monetize, and safely operate
products on top of the TradeOS crypto market Data Intelligence OS.

TradeOS is the crypto-market vertical of a broader source-grounded Data
Intelligence OS strategy. For the business overview, start with
[TradeOS Business Thesis](tradeos-business-thesis.md).

The canonical builder story is:

```text
Use TradeOS free.
Earn Data Intel Credits by improving intelligence quality.
Build and earn on public intelligence.
Pay when you need private intelligence products, scale, alerts, automation, or data rights.
```

Use the docs below to map that story into Data Intelligence OS positioning,
setup, APIs, feedback provenance, monetizable products, and paid boundaries.

The flagship product model is private and self-hosted:

```text
TradeOS supplies intelligence.
The Symbol Cockpit runs where the trader controls the keys.
Future feasibility, EA/risk, execution, and ops modules stay local.
```

Start with the path that matches what you are trying to do.

## Fast Paths

| Goal | Start Here | Then Read |
| --- | --- | --- |
| Understand the business thesis | [TradeOS Business Thesis](tradeos-business-thesis.md) | [Problem Space](problem-space.md), [Data Intelligence Product Model](marketplace-model.md), [Use Cases](use-cases.md) |
| Understand the problem and cost | [Problem Space](problem-space.md) | [Data Intelligence Product Model](marketplace-model.md), [Use Cases](use-cases.md) |
| Understand the repo layout | [Repository Layout](repository-layout.md) | [Architecture](architecture.md), [Distribution Setup Guide](distribution-setup-guide.md) |
| Get API keys or request scale | [Getting API Keys And Requesting Scale](getting-api-keys-and-scale.md) | [Integration Keys And URLs](integration-keys-and-urls.md), [API Keys And Feedback Provenance](api-keys-and-feedback-provenance.md) |
| Configure runtime URLs, SMTP, and webhooks | [Integration Keys And URLs](integration-keys-and-urls.md) | [Distribution Setup Guide](distribution-setup-guide.md), [API Keys And Feedback Provenance](api-keys-and-feedback-provenance.md) |
| Build the flagship consumer app | [Flagship Symbol Cockpit](flagship-symbol-cockpit.md) | [Symbol Cockpit And Action Agent](symbol-cockpit-agent.md), [Action Intents](action-intents.md), [Safety Boundaries](safety-boundaries.md) |
| Preview public Fusion Signals | [Public Fusion Signal Cockpit Preview](public-fusion-signal-cockpit-preview.md) | [Data Intel Credit Loop](feedback-credit-loop.md), [Paid Boundaries](paid-boundaries.md), [Safety Boundaries](safety-boundaries.md) |
| Confirm cockpit symbol coverage | [Symbol Intelligence Coverage](symbol-intelligence-coverage.md) | [Flagship Symbol Cockpit](flagship-symbol-cockpit.md), [Integration Keys And URLs](integration-keys-and-urls.md) |
| Understand the intelligence product thesis | [Data Intelligence Product Model](marketplace-model.md) | [Use Cases](use-cases.md), [Monetization Guide](monetization.md) |
| Try the kit as a builder | [Distribution Setup Guide](distribution-setup-guide.md) | [Public Intel API](public-intel-api.md), [MCP Tools](mcp-tools.md) |
| Build a bot quickly | [Market Briefing Bot](market-briefing-bot.md) | [Data Intel Credit Loop](feedback-credit-loop.md), [Safety Boundaries](safety-boundaries.md) |
| Build saved watchlists | [Public Intel API](public-intel-api.md) | [Use Cases](use-cases.md), [Access And Payments](access-and-payments.md) |
| Add TradeOS to an agent host | [MCP Tools](mcp-tools.md) | [Architecture](architecture.md), [API Keys And Feedback Provenance](api-keys-and-feedback-provenance.md) |
| Find product ideas | [Use Cases](use-cases.md) | [Monetization Guide](monetization.md), [Builder Revenue Playbook](builder-revenue-playbook.md) |
| Earn as a builder on TradeOS | [Earn as a Builder: Commercial Distribution Field Guides](commercial-distribution/README.md) | [Service Packaging Checklist](commercial-distribution/service-packaging-checklist.md), [Access And Payments](access-and-payments.md) |
| Understand access and paid upgrades | [Access And Payments](access-and-payments.md) | [Paid Boundaries](paid-boundaries.md) |
| Publish or operate the repo | [Production Readiness](production-readiness.md) | [Consumer E2E](consumer-e2e.md) |

## Recommended Reading Order

1. [TradeOS Business Thesis](tradeos-business-thesis.md) explains what business
   TradeOS is in, who it serves, how the public-to-paid model works, and why it
   is one crypto-market vertical rather than the entire Source Intelligence
   Network strategy.
2. [Problem Space](problem-space.md) explains why agents, bots, dashboards, and
   cockpits need source-grounded market intelligence before they recommend,
   summarize, or route local workflows.
3. [Repository Layout](repository-layout.md) explains what each app, package,
   module, example, and infra folder owns.
4. [Integration Keys And URLs](integration-keys-and-urls.md) gives the TradeOS,
   Venice, SMTP, local runtime, and e2e configuration checklist.
5. [Getting API Keys And Requesting Scale](getting-api-keys-and-scale.md)
   gives the shortest dashboard, CLI, optional key, and scale-request path.
6. [Flagship Symbol Cockpit](flagship-symbol-cockpit.md) explains what the
   flagship private self-hosted app is, what value it gives consumers, how to
   read it, and how to bring it online.
7. [Symbol Intelligence Coverage](symbol-intelligence-coverage.md) defines the
   current 21-symbol cockpit trading-intelligence universe and the boundary for
   partial discovery/risk coverage.
8. [Public Fusion Signal Cockpit Preview](public-fusion-signal-cockpit-preview.md)
   defines the public `/fusion` queue/detail/feedback pattern and the
   direction-only boundary for redacted Signal Cockpit reads.
9. [Data Intelligence Product Model](marketplace-model.md) explains the supply, demand,
   feedback, and paid-depth loop behind the Data Intelligence OS distribution kit.
10. [Architecture](architecture.md) explains the shape of the kit and the
   boundary between TradeOS-hosted intelligence and builder-owned apps.
11. [Action Intents](action-intents.md) defines the non-executable bridge between
   cockpit recommendations, local policy gates, paper execution, and independent
   executor experiments.
12. [Distribution Setup Guide](distribution-setup-guide.md) shows the practical
   install, environment, app-key, MCP, and CLI setup.
13. [Public Intel API](public-intel-api.md) lists the public read and feedback
   write endpoints.
14. [API Keys And Feedback Provenance](api-keys-and-feedback-provenance.md)
   explains app-key attribution, key management, and feedback source metadata.
15. [Data Intel Credit Loop](feedback-credit-loop.md) explains how human, agentic,
   and automated feedback should be reported and weighted.
16. [Safety Boundaries](safety-boundaries.md) defines what this public kit must
   not claim or do.

## Build And Integrate

- [Problem Space](problem-space.md): why TradeOS-like source-grounded market
  intelligence matters for agents, bots, dashboards, and private cockpits.
- [TradeOS Business Thesis](tradeos-business-thesis.md): business overview
  for what business TradeOS is in, who it serves, and how it stays separate from
  trading, custody, and the broader Source Intelligence Network strategy.
- [Flagship Symbol Cockpit](flagship-symbol-cockpit.md): the consumer-facing
  guide to what the private self-hosted cockpit is, how users read it, what
  dependencies it needs, and how to bring it online.
- [Public Fusion Signal Cockpit Preview](public-fusion-signal-cockpit-preview.md):
  the public `/fusion` page pattern for a symbol queue, selected signal detail,
  redacted direction-only reads, and signal-quality feedback.
- [Symbol Cockpit And Action Agent](symbol-cockpit-agent.md): the flagship
  private self-hosted technical reference for good/bad/ugly verdicts,
  recommendation inboxes, watchlist scanners, bot preflight, local operations,
  privacy modes, and implementation notes.
- [Action Intents](action-intents.md): non-executable action context that can
  feed local review, policy gates, paper execution, and independent executor
  experiments without making TradeOS an order router.
- [Repository Layout](repository-layout.md): folder-by-folder guide to apps,
  packages, modules, examples, infra, docs, and common change locations.
- [Integration Keys And URLs](integration-keys-and-urls.md): where to get or
  configure TradeOS keys, Venice keys, SMTP credentials, provider URLs, local
  runtime URLs, and e2e envs.
- [Getting API Keys And Requesting Scale](getting-api-keys-and-scale.md): short
  dashboard and CLI steps for TradeOS app keys, optional provider keys, reviewed
  quota requests, and paid/x402 upgrade boundaries.
- [Symbol Intelligence Coverage](symbol-intelligence-coverage.md): the current
  21-symbol cockpit trading-intelligence universe, plus the boundary for
  partial discovery/risk-only symbols.
- [Distribution Setup Guide](distribution-setup-guide.md): environment setup,
  public API base URL, Developer Keys flow, CLI, MCP, and app examples.
- [Public Intel API](public-intel-api.md): endpoint reference for public reads,
  watchlist snapshots, account-owned watchlists, feedback writes, app-key
  management, and provenance fields.
- [MCP Tools](mcp-tools.md): local stdio MCP tool list and hosted bridge status.
- [Architecture](architecture.md): system flow for SDKs, CLI, MCP, BYOK models,
  private local control planes, feedback, and paid upgrades.
- [Market Briefing Bot](market-briefing-bot.md): Discord, Telegram, cron, and
  stdout bot setup.

## Monetize And Package

- [Data Intelligence Product Model](marketplace-model.md): the canonical thesis for TradeOS
  as a crypto market Data Intelligence OS and this repo as the builder
  distribution layer.
- [TradeOS Business Thesis](tradeos-business-thesis.md): the public business
  overview and market-opportunity boundary for the TradeOS vertical.
- [Use Cases](use-cases.md): product categories builders can ship with TradeOS
  public intelligence.
- [Monetization Guide](monetization.md): how builders can package evidence,
  workflow, audience, validation, and feedback into paid products.
- [Builder Revenue Playbook](builder-revenue-playbook.md): concrete launch
  recipes, pricing ideas, and upgrade triggers.
- [Earn as a Builder: Commercial Distribution Field Guides](commercial-distribution/README.md):
  sanitized setup guides for packaging TradeOS-backed intelligence into paid
  services, workflows, agents, vertical apps, and marketplace listings on
  Virtuals ACP, AntSeed, x402 directories, and Agentic.Market-style discovery.
- [Access And Payments](access-and-payments.md): free public usage, earned app
  quota, quota review requests, starter ask quota, DTI credits, x402, and
  paid TradeOS surfaces.
- [Paid Boundaries](paid-boundaries.md): what is intentionally outside the free
  public kit.

## Feedback, Safety, And Trust

- [Data Intel Credit Loop](feedback-credit-loop.md): stable target IDs, feedback
  provenance, Data Intel Credits, and app reputation.
- [API Keys And Feedback Provenance](api-keys-and-feedback-provenance.md):
  builder app keys, secret handling, and source weighting.
- [Safety Boundaries](safety-boundaries.md): actionable recommendations are
  allowed, but TradeOS does not execute, custody assets, hold exchange keys, or
  expose private telemetry.
- [Public Fusion Signal Cockpit Preview](public-fusion-signal-cockpit-preview.md):
  public signal quality preview, feedback labels, and execution-field boundary.
- [Consumer E2E](consumer-e2e.md): external-consumer test flow that was run
  before publish.

## Publish And Operate

- [Production Readiness](production-readiness.md): canonical endpoints,
  durability checks, CI gate, and secret handling.
- [Consumer E2E](consumer-e2e.md): live consumer surfaces verified from fresh
  tarball installs.

## Live TradeOS Links

- [TradeOS app](https://tradeos.tech)
- [Live market intelligence](https://tradeos.tech/market)
- [Fusion Signals](https://tradeos.tech/fusion)
- [Watchlist Intelligence](https://tradeos.tech/watchlists)
- [Ask TradeOS](https://tradeos.tech/ask)
- [Developer Keys](https://tradeos.tech/developer/api-keys)
- [Public API base](https://api.tradeos.tech/v1/public-intel/sources/health)
