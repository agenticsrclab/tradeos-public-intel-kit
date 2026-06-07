# TradeOS Public Intelligence Kit Docs

This directory explains how to build, ship, monetize, and safely operate
products on top of the TradeOS crypto intelligence marketplace.

The canonical builder story is:

```text
Use TradeOS free.
Give useful feedback to unlock more public depth.
Build products on public intelligence.
Pay when you need scale, alerts, automation, private context, or data rights.
```

Use the docs below to map that story into marketplace positioning, setup, APIs,
feedback provenance, monetizable products, and paid boundaries.

Start with the path that matches what you are trying to do.

## Fast Paths

| Goal | Start Here | Then Read |
| --- | --- | --- |
| Understand the marketplace thesis | [Marketplace Model](marketplace-model.md) | [Use Cases](use-cases.md), [Monetization Guide](monetization.md) |
| Try the kit as a builder | [Distribution Setup Guide](distribution-setup-guide.md) | [Public Intel API](public-intel-api.md), [MCP Tools](mcp-tools.md) |
| Build a bot quickly | [Market Briefing Bot](market-briefing-bot.md) | [Feedback Credit Loop](feedback-credit-loop.md), [Safety Boundaries](safety-boundaries.md) |
| Build saved watchlists | [Public Intel API](public-intel-api.md) | [Use Cases](use-cases.md), [Access And Payments](access-and-payments.md) |
| Add TradeOS to an agent host | [MCP Tools](mcp-tools.md) | [Architecture](architecture.md), [API Keys And Feedback Provenance](api-keys-and-feedback-provenance.md) |
| Find product ideas | [Use Cases](use-cases.md) | [Monetization Guide](monetization.md), [Builder Revenue Playbook](builder-revenue-playbook.md) |
| Understand access and paid upgrades | [Access And Payments](access-and-payments.md) | [Paid Boundaries](paid-boundaries.md) |
| Publish or operate the repo | [Production Readiness](production-readiness.md) | [Consumer E2E](consumer-e2e.md) |

## Recommended Reading Order

1. [Marketplace Model](marketplace-model.md) explains the supply, demand,
   feedback, and paid-depth loop behind the distribution kit.
2. [Architecture](architecture.md) explains the shape of the kit and the
   boundary between TradeOS-hosted intelligence and builder-owned apps.
3. [Distribution Setup Guide](distribution-setup-guide.md) shows the practical
   install, environment, app-key, MCP, and CLI setup.
4. [Public Intel API](public-intel-api.md) lists the public read and feedback
   write endpoints.
5. [API Keys And Feedback Provenance](api-keys-and-feedback-provenance.md)
   explains app-key attribution, key management, and feedback source metadata.
6. [Feedback Credit Loop](feedback-credit-loop.md) explains how human, agentic,
   and automated feedback should be reported and weighted.
7. [Safety Boundaries](safety-boundaries.md) defines what this public kit must
   not claim or do.

## Build And Integrate

- [Distribution Setup Guide](distribution-setup-guide.md): environment setup,
  public API base URL, Developer Keys flow, CLI, MCP, and app examples.
- [Public Intel API](public-intel-api.md): endpoint reference for public reads,
  watchlist snapshots, account-owned watchlists, feedback writes, app-key
  management, and provenance fields.
- [MCP Tools](mcp-tools.md): local stdio MCP tool list and hosted bridge status.
- [Architecture](architecture.md): system flow for SDKs, CLI, MCP, BYOK models,
  and feedback writes.
- [Market Briefing Bot](market-briefing-bot.md): Discord, Telegram, cron, and
  stdout bot setup.

## Monetize And Package

- [Marketplace Model](marketplace-model.md): the canonical thesis for TradeOS
  as a crypto intelligence marketplace and this repo as the builder
  distribution layer.
- [Use Cases](use-cases.md): product categories builders can ship with TradeOS
  public intelligence.
- [Monetization Guide](monetization.md): how builders can package evidence,
  workflow, audience, validation, and feedback into paid products.
- [Builder Revenue Playbook](builder-revenue-playbook.md): concrete launch
  recipes, pricing ideas, and upgrade triggers.
- [Access And Payments](access-and-payments.md): free public usage, starter ask
  quota, feedback credits, x402, and paid TradeOS surfaces.
- [Paid Boundaries](paid-boundaries.md): what is intentionally outside the free
  public kit.

## Feedback, Safety, And Trust

- [Feedback Credit Loop](feedback-credit-loop.md): stable target IDs, feedback
  provenance, dashboard credits, and app reputation.
- [API Keys And Feedback Provenance](api-keys-and-feedback-provenance.md):
  builder app keys, secret handling, and source weighting.
- [Safety Boundaries](safety-boundaries.md): no execution, no custody, no
  personalized financial advice, and no private telemetry exposure.
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
- [Watchlist Intelligence](https://tradeos.tech/watchlists)
- [Ask TradeOS](https://tradeos.tech/ask)
- [Developer Keys](https://tradeos.tech/developer/api-keys)
- [Public API base](https://api.tradeos.tech/v1/public-intel/sources/health)
