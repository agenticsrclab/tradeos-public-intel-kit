# Paid Boundaries

The public kit is designed to spread TradeOS public intelligence without giving
away paid data products.

The public value ladder is:

```text
Use TradeOS free.
Earn Data Intel Credits by improving intelligence quality.
Build products on public intelligence.
Pay when you need private intelligence products, scale, alerts, automation, or data rights.
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
validation previews, and reputation pages. They may also build private
self-hosted cockpits that turn evidence into buy, sell, trim, avoid, watch, or
pass recommendations. They must keep the safety boundary clear: TradeOS
supplies intelligence and feedback paths, while execution, custody, exchange
keys, and final approvals stay with the self-hosted operator.

The free public kit is a discovery and integration surface. Server-side rate
limits and abuse controls may apply, but the public SDK/CLI/MCP packages should
stay easy to run without payment setup.

Default public API limits are deliberately conservative:

| Profile | Reads/min | Reads/hour | Reads/day | Symbols/day |
| --- | ---: | ---: | ---: | ---: |
| Anonymous preview | 2 | 10 | 20 | 3 |
| Builder baseline | 5 | 50 | 100 | 10 |
| Builder starter/earned | 10 | 100 | 250 | 20 |
| Reviewed project | 20 | 200 | 500 | 40 |

Useful app-attributed feedback can refresh public quota, and a real product can
request reviewed quota through `POST /v1/public-intel/quota-requests`. Scale,
alerts, exports, replay, automation-safe reads, private intelligence products,
and data rights belong on the paid/x402 or entitlement side of the boundary.

Ask-style products should mirror the current TradeOS starter quota:

| User State | Starter Access | Expiry |
| --- | --- | --- |
| Anonymous visitor | 3 public-intelligence questions | Session or anonymous quota boundary |
| Signed-in starter user | 10 public-intelligence questions | 7 days from first quota activation |
| DTI question pack | 5 extra public-intelligence questions | Earned with Data Intel Credits |

Each free public API read counts as one launch read unit. Weighted public read
accounting is not enabled yet; heavier batch, history, export, alert, and
machine-scale surfaces are paid/x402 or entitlement-gated.

Data Intel Credits are separate from starter ask quota. Current DTI credit
pattern:

| Credit Type | Unlock | Expiry |
| --- | --- | --- |
| Welcome DTI credits | dashboard-only depth for new signed-in users | 6 credits at account start |
| Useful unique feedback | earns 3 DTI credits after quality checks | ledger balance until spent or revoked |
| 3-DTI unlocks | faster refresh, more symbols, longer history, deeper evidence, saved views | 7 days by default |
| 6-DTI unlocks | limited previews, review passes, Symbol Story, token/digest/thesis review, Ask pack | 7 days by default |

Expired credit unlocks fall back to free public limits.

Free public access is best-effort promotional access. It has no SLA, no
guaranteed availability, no cash value, and may be rate-limited, changed,
paused, degraded, or revoked to protect TradeOS infrastructure. Paid/x402 and
contract customers are the reserved-capacity path.

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

Credits, starter quota, earned app quota, and reviewed public quota must not
unlock paid TradeOS surfaces.

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
