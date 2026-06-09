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

## Why This Is Big Enough To Care

Do not sell this as "TradeOS prevents $X of losses." The stronger point is that
builders are packaging products into a market where weak context already maps
to large loss pools, compliance work, operating drag, and broken user trust.

Public category anchors:

- The FBI's 2025 Internet Crime Report counted more than 1 million internet
  crime complaints and more than $20 billion in reported losses. Complaints with
  a cryptocurrency nexus reached 181,565 and more than $11 billion in reported
  losses.
- Chainalysis projected that 2025 crypto scams and fraud could exceed
  $17 billion as more illicit wallet addresses are identified.
- TRM Labs estimated that illicit cryptocurrency flows reached $158 billion in
  2025.
- Gartner says poor data quality costs organizations at least $12.9 million per
  year on average. IBM also reported that over a quarter of organizations
  estimate more than $5 million in annual losses from poor data quality, with
  7% reporting $25 million or more.

Those numbers are not claims that TradeOS would have prevented those losses.
They show that source-grounded data intelligence is large enough for serious
buyers to budget around. The public kit's narrow claim is that builders can
reduce weak-context workflows by using source-grounded intelligence, token
identity, freshness, caveats, feedback IDs, and audit trails before a local
recommendation or action workflow.

Sources: [FBI 2025 IC3 Annual Report](https://www.fbi.gov/file-repository/2025_ic3report.pdf),
[FBI 2025 cryptocurrency and AI scams release](https://www.fbi.gov/news/press-releases/cryptocurrency-and-ai-scams-bilk-americans-of-billions),
[Chainalysis 2026 Crypto Crime Report: Scams](https://www.chainalysis.com/blog/crypto-scams-2026/),
[TRM Labs 2026 Crypto Crime Report key insights](https://www.trmlabs.com/resources/blog/2026-crypto-crime-report-key-insights-trm-identifies-record-usd-158-billion-in-illicit-crypto-flows-in-2025-reversing-a-multi-year-decline),
[Gartner data quality overview](https://www.gartner.com/en/data-analytics/topics/data-quality),
[IBM cost of poor data quality](https://www.ibm.com/think/insights/cost-of-poor-data-quality).

## The Agent Economy Multiplier

The agent economy is not fully at scale yet. That is why builders should care
about the data intelligence layer before autonomous workflows become normal.
The risk increases when agents move from answering questions into routing
workflows, calling tools, coordinating with other agents, and handing context to
systems that can take local action.

A stale dashboard card may affect one review. A stale agent-ready intelligence
packet can be reused across bots, alerts, API calls, provider routes, and
autonomous workflows before a person notices the context was weak.

As autonomy increases, the cost of missing data intelligence scales with:

- action volume;
- value touched per action;
- tool and API permissions;
- downstream agent or provider reuse;
- speed of propagation;
- strength of human approval and rollback controls.

```text
Potential agentic exposure =
  action volume x value per action x autonomy level x context-failure rate x blast-radius factor
```

That is the real builder opportunity. TradeOS-like intelligence gives builders
a pre-action evidence packet they can package into monitoring, validation,
approval, review, and private workflow products before users trust agents with
larger responsibilities.

Agentic AI references: [McKinsey data foundations for agentic AI at scale](https://www.mckinsey.com/capabilities/mckinsey-technology/our-insights/building-the-foundations-for-agentic-ai-at-scale),
[McKinsey agentic AI mesh](https://www.mckinsey.com/capabilities/quantumblack/our-insights/seizing-the-agentic-ai-advantage),
[PwC rise and risks of agentic AI](https://www.pwc.com/us/en/industries/tmt/library/trust-and-safety-outlook/rise-and-risks-of-agentic-ai.html),
[Deloitte agentic AI insights](https://www.deloitte.com/us/en/what-we-do/capabilities/applied-artificial-intelligence/articles/agentic-ai-insights.html),
[KPMG AI governance for the agentic AI era](https://kpmg.com/kpmg-us/content/dam/kpmg/pdf/2025/ai-governance-for-agentic-ai-era.pdf).

## Magnitude Anchors

Use customer-level exposure math after the category-scale anchor:

```text
Potential exposure = workflow value touched x context-risk rate x avoidable-context factor
```

Useful anchors:

| Builder workflow | Context failure | Budget anchor |
|---|---|---:|
| Agent or community product influences $100 million/year of watchlisted decision value | 1% context-risk rate and 25% avoidable through better identity, freshness, and evidence | $250,000/year of reviewable exposure |
| Protocol, fund, or treasury team monitors $50 million of liquidity-sensitive exposure | 10% adverse event where stale identity, liquidity, or source context contributes 20% | $1,000,000 exposure under review |
| Source network routes $1 billion/year of provider-backed intelligence responses | 20 bps of dispute, review, false-positive, or trust friction, with 25% reducible through better evidence packets | $500,000/year operating exposure |
| Team has 5 analysts manually validating context 10 hours/week each at $120/hour | Repeated manual research instead of reusable evidence memory | ~$312,000/year |
| Builder product has $100,000 MRR | 20% churn after users stop trusting an under-sourced bot or dashboard | $20,000 MRR / $240,000 ARR |

The important point is not that TradeOS guarantees those savings. The important
point is that once a builder touches real assets, user trust, compliance review,
or recurring paid workflows, source intelligence becomes budget-grade
infrastructure instead of a nice-to-have data feature.

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
