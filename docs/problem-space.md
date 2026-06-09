# Problem Space

The public kit exists because AI agents and builder products need more than a
generic model answer or a chart. They need source-grounded market intelligence
before they summarize, recommend, route, or hand context to a local workflow.

TradeOS-like data is the layer that keeps that workflow reviewable:

```text
identity -> evidence -> freshness -> risk -> caveats -> recommendation context -> audit trail
```

Without that layer, a bot, dashboard, digest, or private cockpit can look useful
while still being stale, symbol-confused, under-sourced, or impossible to audit.

## Cost Of Missing TradeOS-Like Intelligence

| Missing layer | Builder failure mode | User cost |
|---|---|---|
| Token identity | The product routes a symbol to the wrong token, chain, or contract. | Copycat-token confusion, false confidence, and bad watchlists. |
| Freshness | The product repeats old evidence as current. | Late alerts, stale recommendations, and missed material changes. |
| Source evidence | The product cannot show why an answer was produced. | Lower trust, harder review, and weaker dispute handling. |
| Risk context | The product omits liquidity, sellability, uncertainty, or caveats. | Unsafe action framing and fragile workflows. |
| Watchlist memory | The product forces users to repeat manual checks. | Missed changes and no recurring review habit. |
| Feedback IDs | Labels cannot be attached to the exact TradeOS object the user saw. | No compounding intelligence quality or app reputation. |
| Audit trail | Outputs cannot be reconstructed later. | Harder incident analysis and lower operator confidence. |

## Why Builders Should Care

Builders do not need to sell raw endpoint access. They can sell the workflow
around source-grounded intelligence:

- private self-hosted symbol cockpits;
- paid digests and market briefings;
- community bots;
- watchlist monitors and alert workflows;
- bot preflight and validation reports;
- proof pages and feedback analytics;
- market context widgets.

TradeOS supplies the intelligence, source refs, freshness, caveats, target IDs,
feedback loop, and paid-depth path. The builder supplies packaging, audience,
workflow, privacy posture, and distribution.

## Boundary

The public kit is not a TradeOS-hosted broker, custodian, managed-account
service, or order router. Builders may turn TradeOS evidence into local
recommendations, but exchange keys, account control, custody, sizing,
approvals, and execution remain with the self-hosted operator or a separate
product outside this kit's supported boundary.
