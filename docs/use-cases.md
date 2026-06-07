# Use Cases

This kit is for builders who want market intelligence as a product ingredient,
not raw trading infrastructure. It is the builder-facing distribution layer of
the TradeOS crypto intelligence marketplace.

The public story is:

```text
Use TradeOS free.
Give useful feedback to unlock more public depth.
Build products on public intelligence.
Pay when you need scale, alerts, automation, private context, or data rights.
```

## Monetizable Products

These are commercial products a builder can sell using TradeOS public
intelligence. TradeOS supplies evidence, freshness, caveats, source refs, stable
IDs, and feedback write paths. The builder supplies packaging, audience,
workflow, and distribution.

The useful commercial framing is:

```text
TradeOS supplies the intelligence marketplace layer.
The builder sells the workflow around the evidence.
The customer pays for saved time, monitoring, proof, validation, or integration.
TradeOS gets paid when the workflow needs scale, automation, premium history, or x402.
```

## Fastest Paths To Revenue

Start with products where the customer already understands the budget.

| Build This | Sell To | Charge For | Use Public Kit For | Upgrade To Paid TradeOS When |
| --- | --- | --- | --- | --- |
| Paid digest | traders, analysts, paid communities | cadence, curation, archive, member access | digest, candidates, source refs, caveats | custom universe, premium pulse, higher refresh |
| Community bot | Discord/Telegram/Slack groups | install, premium commands, scheduled posts | MCP tools, digest, proof lookup, feedback | high-volume reads, remote bridge when available, alerts |
| Watchlist dashboard | research teams, token teams, active traders | seats, saved lists, monitoring workflow | token snapshots, account watchlists, events, freshness, feedback | webhooks, larger lists, custom universes, alert delivery |
| Bot context plugin | bot builders, quant developers | plugin license, risk overlay, review workflow | caveats, invalidation notes, public context | automation-safe API, private regimes, premium context |
| Validation report | quant shops, funds, signal vendors | benchmark report, export, review package | public schema, live examples, feedback labels | historical export, validation API, replay datasets |
| Proof page | analysts, creators, communities | profiles, public proof pages, reputation tooling | proof lookup, outcome feedback, source refs | team analytics, paid proof tooling |

The public kit should get a builder to a credible demo. Production revenue
usually starts when the builder wraps that demo in delivery, access control,
history, notifications, team workflow, or customer-specific interpretation.

For offer-by-offer launch recipes, see
[Builder Revenue Playbook](builder-revenue-playbook.md).

### Paid Research Digest

Sell a daily or weekly digest to paid subscribers.

Buyer:

```text
active crypto traders
analysts
fund research teams
paid Discord/Telegram communities
token ecosystem operators
```

TradeOS intelligence used:

```text
/digest-inputs
/candidates
source_snapshot_refs
confidence and freshness metadata
limitations and invalidation notes
```

Revenue model:

```text
paid newsletter
member-only community tier
research subscription
sponsored public digest with premium expansion
```

Why it can make money: builders can publish timely, source-backed market context
without building the evidence pipeline from scratch.

Safety boundary: present it as research context, not personalized trade advice
or a signal to buy/sell.

### Community Market Bot

Run a bot for Discord, Telegram, Slack, or Farcaster communities that answers
market questions and posts bounded digests.

Buyer:

```text
token communities
DAOs
trading groups
research servers
creator communities
```

TradeOS intelligence used:

```text
MCP tools
/digest-inputs
/thesis-watchlist
/proofs/{public_claim_id}
/conversions feedback writes
```

Revenue model:

```text
monthly bot subscription
server install fee
premium command tier
community analytics upsell
```

Why it can make money: communities already pay for bots, moderation tools, and
analytics. TradeOS gives the bot market intelligence instead of generic LLM
answers.

### Watchlist And Alert Dashboard

Build a dashboard that tracks token snapshots, account-owned watchlists,
invalidation notes, source freshness, notification targets, and feedback.

Buyer:

```text
research teams
active traders
token teams
market makers
analyst creators
```

TradeOS intelligence used:

```text
/watchlist-capabilities
/tokens/{token_ref}/watchlist-snapshot
/watchlists
/watchlists/{watchlist_id}/state
/watchlists/{watchlist_id}/events
/watchlists/{watchlist_id}/feedback
source_snapshot_refs, generated_at, freshness, confidence, limitations
```

Revenue model:

```text
SaaS subscription
paid saved watchlists
paid alerts
premium dashboard seats
```

Why it can make money: users pay to monitor what changed, what got weaker, and
what needs attention. TradeOS gives the dashboard a reasoned evidence layer.

Safety boundary: public kit data can power monitoring, context, and user-owned
saved state. It does not execute trades, collect exchange credentials, or make
personalized buy/sell instructions. High-volume alerting, custom universes,
webhooks, private forecasts, and premium history belong in paid TradeOS
surfaces.

Fast MVP:

```text
1. Use public token snapshots for a no-account preview.
2. Ask the user to connect a TradeOS account token for saved watchlists.
3. Let the user add symbols and review normalized state cards.
4. Record email or webhook targets as pending delivery preferences.
5. Send feedback on noisy or useful drivers to improve the intelligence loop.
```

### Tradebot Intelligence Layer

Make an existing tradebot smarter by adding TradeOS context before, during, or
after the bot's own decision process.

Buyer:

```text
bot builders
quant developers
trading infrastructure teams
advanced retail automation builders
research teams with internal execution systems
```

TradeOS intelligence used:

```text
/digest-inputs
/candidates
/thesis-watchlist
/thesis-feedback
regime and stress context when available through paid/private surfaces
invalidation notes
freshness and confidence metadata
```

Revenue model:

```text
paid bot plugin
premium bot tier
private TradeOS integration
research/risk overlay subscription
enterprise API contract
```

How it helps: the bot can use TradeOS intelligence as a context, risk, and
explainability layer. For example, it can display why a setup may be weaker,
whether evidence is stale, whether a thesis has degraded, or whether market
state is unfavorable.

Safety boundary: the public kit does not place trades and should not be marketed
as an execution signal. If a developer connects TradeOS context to live
automation, execution controls, high-volume feeds, and private forecasts belong
in paid/private TradeOS surfaces.

### Quant Validation Dataset

Sell data and validation workflows to quant shops that want to compare their own
signals against TradeOS intelligence and outcomes.

Buyer:

```text
quant funds
prop shops
research desks
data science teams
market makers
signal vendors
```

TradeOS intelligence used:

```text
public candidates and live schema examples
public thesis and claim outcome shapes
evidence freshness
signal-quality feedback labels
paid historical candidates and outcomes
paid regime labels and stress context
paid historical source snapshots
```

Revenue model:

```text
paid historical export
validation API
research data subscription
enterprise evaluation contract
benchmark/report package
```

How it helps: a quant shop can check whether its own system agrees or disagrees
with TradeOS public intelligence, where it missed regime shifts, where evidence
was early or late, and whether TradeOS labels explain drawdowns or false
positives.

Safety boundary: the public kit can demonstrate the schema and live public
surface. Historical depth, bulk exports, replayable datasets, private regimes,
raw features, and production validation APIs are paid TradeOS products.

### Claim And Proof Reputation Page

Create pages where analysts or communities publish claims and track proof or
outcome status.

Buyer:

```text
analysts
research creators
token communities
fund marketing teams
data publications
```

TradeOS intelligence used:

```text
/proofs/{public_claim_id}
/claim-outcomes
/thesis-outcomes
source refs
outcome feedback
```

Revenue model:

```text
creator subscriptions
paid analyst profile
proof-backed report pages
reputation tooling
```

Why it can make money: public calls are more valuable when they are auditable,
tracked, and easy to share.

### Market Context Widget

Embed a compact TradeOS-powered market context panel inside a wallet, portfolio
tracker, research portal, or token page.

Buyer:

```text
wallets
portfolio dashboards
data portals
token discovery products
trading education platforms
```

TradeOS intelligence used:

```text
/digest-inputs
/thesis-watchlist
/sources/health
confidence
caveats
source_snapshot_refs
```

Revenue model:

```text
B2B widget license
API subscription
paid embed
premium context panel
```

Why it can make money: products can add differentiated market context without
building and maintaining their own intelligence system.

### Feedback-Powered Research Community

Build a community where members earn status or credits by labeling whether
public intelligence was useful, early, late, thin, or confusing.

Buyer:

```text
research communities
creator communities
analyst groups
education platforms
```

TradeOS intelligence used:

```text
stable target IDs
/conversions
/claim-outcomes
/thesis-outcomes
feedback labels
source_snapshot_refs
```

Revenue model:

```text
premium community tier
research reputation scores
member analytics
credit-gated dashboard depth
```

Why it can make money: feedback turns passive content into a loop where users
help improve quality and get recognized for useful judgment.

## Research Copilot

Build a local or hosted assistant that answers:

```text
What changed in crypto market stress?
Which watchlist items have thin evidence?
What would invalidate this public thesis?
```

Recommended path:

```text
SDK or MCP -> digest/watchlist/proof reads -> BYOK LLM -> feedback labels
```

Why TradeOS helps: the assistant starts from bounded public evidence with
freshness, confidence, and limitations already attached.

## Community Digest Bot

Build a bot for Discord, Telegram, Slack, or newsletters that posts a concise
public market digest and asks members for structured feedback.

Recommended path:

```text
TypeScript SDK -> /digest-inputs -> channel formatter -> /conversions feedback
```

Feedback labels to capture:

```text
useful
confusing_explanation
evidence_too_thin
too_early
too_late
```

Why TradeOS helps: stable target IDs let community reactions become product
learning instead of throwaway chat messages.

## Token Watchlist Monitor

Render a watchlist view for tokens that need monitoring, with risk caveats,
drivers, and invalidation notes.

Recommended path:

```text
SDK -> /thesis-watchlist -> UI cards -> thesis feedback
```

Useful UI fields:

```text
symbol
chain_id
claim
confidence
freshness
source_snapshot_refs
invalidation
limitations
```

Why TradeOS helps: users can see why something is on a watchlist, not just that
it is on one.

## Claim Proof Explorer

Build a small app that lets users open public claims and inspect proof state,
source refs, and outcome feedback.

Recommended path:

```text
SDK -> /proofs/{public_claim_id} -> claim feedback
```

Why TradeOS helps: public claims become shareable and auditable without exposing
private TradeOS internals.

## Analyst Notebook

Use the Python SDK in notebooks or scheduled jobs to pull current public
context, tag observations, and submit feedback after review.

Recommended path:

```text
Python SDK -> digest/watchlist reads -> notebook review -> feedback write
```

Why TradeOS helps: analysts can work with a stable public API while TradeOS
continues to own source aggregation and evidence safety.

## Product Widget

Add a compact "market context" panel to a dashboard, portfolio product, wallet,
or research portal.

Recommended path:

```text
backend SDK call -> public digest/watchlist card -> feedback button
```

Safety copy should be clear:

```text
Public intelligence is descriptive evidence, not personalized financial advice
or a trade instruction.
```

Why TradeOS helps: the widget gives users context without asking your product to
build a market intelligence pipeline from scratch.

## What Not To Build With This Kit

Do not use the public kit for:

- trade execution;
- bot automation;
- private forecasts;
- exchange connectivity;
- raw data exports;
- high-volume paid API replacement;
- personalized financial advice.

Those belong in paid or private TradeOS surfaces with different authorization,
contracts, and controls.
