# Paid Boundaries

The public kit is designed to spread TradeOS public intelligence without giving
away paid data products.

The public value ladder is:

```text
Use TradeOS free.
Give useful feedback to unlock more public depth.
Build products on public intelligence.
Pay when you need scale, alerts, automation, private context, or data rights.
```

## Free/Public

- bounded market digest;
- public candidates;
- public thesis watchlist;
- source snapshot references;
- public claim proof status;
- structured feedback writes.

Builders may monetize products built on top of these public surfaces, such as
newsletters, community bots, dashboards, widgets, tradebot context layers, quant
validation previews, and reputation pages. They must keep the safety boundary
clear: public intelligence is descriptive evidence, not personalized advice or
execution.

The free public kit is a discovery and integration surface. Server-side rate
limits and abuse controls may apply, but the public SDK/CLI/MCP packages should
stay easy to run without payment setup.

Ask-style products should mirror the current TradeOS starter quota:

| User State | Starter Access | Expiry |
| --- | --- | --- |
| Anonymous visitor | 3 public-intelligence questions | Session or anonymous quota boundary |
| Signed-in starter user | 20 public-intelligence questions | 7 days from first quota activation |

Feedback credits are separate from starter ask quota. Current dashboard credit
pattern:

| Credit Type | Unlock | Expiry |
| --- | --- | --- |
| Welcome credits | dashboard-only depth for new signed-in users | 6 credits at account start |
| Feedback credits | longer history, deeper evidence, more symbols, more public refreshes, limited previews | 30 days by default |

Expired credit unlocks fall back to free public limits.

## Paid TradeOS

- high-volume API;
- raw data exports;
- private forecasts;
- raw VPIN/features;
- historical validation datasets;
- replayable evaluation datasets;
- regime/stress validation APIs;
- webhooks;
- bot automation;
- x402 paid calls;
- custom watchlists;
- enterprise/private deployments.

Credits and starter quota must not unlock paid TradeOS surfaces.

## x402 Payment Boundary

x402 is the paid machine-payment path for TradeOS paid resources. It is not an
internal dependency of the free public-intel kit, and the free kit should not
hide payment behavior behind its examples.

Public x402 discovery surfaces:

```text
https://tradeos.tech/.well-known/x402.json
https://tradeos.tech/x402
https://tradeos.tech/x402/v1/listings
https://tradeos.tech/x402/v1/samples
https://tradeos.tech/x402/v1/openapi.json
https://tradeos.tech/x402/v1/marketplace-listing-pack.json
```

Paid API consumers should expect paid resources to use explicit entitlement and
`402 Payment Required` behavior. Retail users, prepaid credits, team plans, and
enterprise contracts can use TradeOS paid product flows outside this public kit.

More detail: [Access And Payments](access-and-payments.md).
