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

## Magnitude Anchors

Do not sell this as "TradeOS prevents $X of losses." Sell it as exposed
workflow risk:

```text
Potential impact = exposed capital x adverse move x avoidable-context factor
```

Useful anchors:

| Builder workflow | Context failure | Practical impact |
|---|---|---:|
| Private cockpit monitors $250,000 of active exposure | Wrong or stale token read plus 20% adverse move | $50,000 |
| Research desk monitors $5,000,000 of watchlist exposure | Stale watchlist/risk context plus 10% adverse move | $500,000 |
| Fund or protocol team watches $20,000,000 of liquidity-sensitive exposure | Weak source, identity, or liquidity review plus 25% adverse move | $5,000,000 |
| Team has 2 analysts manually validating context 10 hours/week each at $100/hour | Repeated manual research instead of reusable evidence memory | ~$104,000/year |
| Builder product has $30,000 MRR | 20% churn after users stop trusting an under-sourced bot or dashboard | $6,000 MRR / $72,000 ARR |

External category anchors make the problem easier to understand. FBI IC3
reported 149,686 cryptocurrency-related complaints and $9.3 billion in losses
for 2024. TRM Labs reported $2.2 billion stolen in crypto hacks and exploits in
2024, with an average hack size around $14 million. Chainalysis also estimated
$2.2 billion in stolen funds across 303 hacking incidents in 2024.

Those numbers are not claims that TradeOS would have prevented those losses.
They show that the market category has real economic weight. The public kit's
narrow claim is that builders can reduce weak-context workflows by using
source-grounded intelligence, token identity, freshness, caveats, feedback IDs,
and audit trails before a local recommendation or action workflow.

Sources: [FBI IC3 2024 Annual Report](https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf),
[TRM Labs 2025 Crypto Crime Report excerpt](https://www.trmlabs.com/resources/blog/category-deep-dive-2-2-billion-was-stolen-in-crypto-related-hacks-in-2024),
[Chainalysis 2025 Crypto Crime Report excerpt](https://www.chainalysis.com/blog/crypto-hacking-stolen-funds-2025/).

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
