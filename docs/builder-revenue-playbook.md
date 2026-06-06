# Builder Revenue Playbook

This playbook is for builders who want to turn TradeOS public intelligence into
a product people can pay for.

TradeOS does not sell guaranteed trading returns through this kit. The public
kit helps builders sell workflows around source-backed market context:
monitoring, summaries, proof, validation, community tools, and explainability.

## The Commercial Rule

```text
Do not sell "API access" as the product.
Sell the workflow the API makes possible.
```

Customers pay when the product saves time, reduces monitoring burden, makes
market context easier to explain, creates proof they can share, or gives them an
outside benchmark for their own system.

## Where Builders And TradeOS Both Win

```text
1. Builder ships a useful workflow with free public intelligence.
2. Builder gets users, feedback, and revenue from packaging/distribution.
3. Users submit structured feedback through stable TradeOS IDs.
4. TradeOS improves the public signal surface.
5. Successful workflows need more volume, history, alerts, automation, or premium data.
6. Builder or customer upgrades to paid TradeOS, x402, or enterprise access.
```

## Feature Unlock Loop

From the kit perspective, the builder product should expose features in layers.
The local SDK, MCP server, and CLI stay thin; TradeOS service access determines
what data and capabilities are available.

```text
Free builder product
  uses public kit reads and feedback writes
        |
        v
User feedback
  creates stable quality labels and optional credit signals
        |
        v
TradeOS account/session reconciliation
  can grant temporary dashboard-only depth
        |
        v
Paid builder product tier
  adds delivery, saved workflow, reports, dashboards, or integrations
        |
        v
TradeOS paid/x402/enterprise access
  unlocks premium machine data, scale, automation-safe reads, exports, or validation
```

Builder-facing tiering:

| Tier | User Gets | Builder Gets | TradeOS Gets |
| --- | --- | --- | --- |
| Free public | digest, candidates, proof lookup, basic feedback | top-of-funnel product and usage data | broader distribution and feedback labels |
| Feedback credit | temporary dashboard depth where enabled | stronger engagement loop | quality signal for public intelligence |
| Builder paid tier | saved workflows, scheduled posts, reports, widgets, community analytics | subscription or license revenue | branded distribution and upgrade demand |
| TradeOS paid/x402 | premium market pulse, validation API, automation-safe reads, paid resources | richer product surface | paid machine access revenue |
| Enterprise/private | custom universe, exports, replay datasets, support | larger customer contracts | enterprise revenue and data partnerships |

The kit should make those upgrade points clear in product copy, but the builder
should not claim that feedback credits unlock paid API calls or that the public
kit includes premium historical datasets.

## Account Strategy For Builder Products

Do not force a TradeOS account before the user sees value. Use the lightest
identity mode that supports the feature.

| Product Stage | TradeOS Account Needed? | Suggested Flow |
| --- | --- | --- |
| Demo or public lead magnet | no | public reads, anonymous feedback, BYOK LLM if needed |
| Builder production app | builder TradeOS account | server-side `TRADEOS_PUBLIC_INTEL_KEY` for app attribution |
| User credit loop | yes, if the user wants durable TradeOS credits | offer "link TradeOS" after feedback has value |
| Builder monetized SaaS | builder pays TradeOS | keep paid API/x402 credentials server-side and charge customers in the builder product |
| Power-user agent/tool | user may bring TradeOS access | user configures their own x402 payment or paid entitlement |
| Enterprise workflow | customer or builder contract | API key, contract entitlement, support, private integration |

The strongest conversion path is usually:

```text
try without account
see useful intelligence
submit feedback
link TradeOS to earn credits
pay builder for workflow
builder upgrades TradeOS for premium data or scale
```

## Launch Recipes

### 1. Paid Market Briefing

Buyer:

```text
traders
analysts
paid communities
fund research teams
token ecosystem operators
```

Free hook:

```text
weekly public digest
top market changes
public source refs and caveats
```

Paid product:

```text
daily briefing
member-only archive
watchlist commentary
community Q&A
feedback-ranked topics
```

Use public kit for:

```text
/digest-inputs
/candidates
/thesis-watchlist
source_snapshot_refs
confidence and freshness metadata
feedback writes
```

TradeOS paid trigger:

```text
custom universe
higher refresh rate
premium market pulse
team access
```

### 2. Community Market Bot

Buyer:

```text
Discord communities
Telegram groups
DAOs
research servers
creator communities
```

Free hook:

```text
/market command
bounded public digest
proof lookup for public claims
```

Paid product:

```text
scheduled digests
role-gated commands
saved watchlists
community analytics
feedback leaderboard
```

Use public kit for:

```text
MCP tools
/digest-inputs
/proofs/{public_claim_id}
/conversions
/claim-outcomes
```

TradeOS paid trigger:

```text
high-volume reads
remote bridge when available
alert delivery
team/API entitlement
```

### 3. Watchlist Monitoring SaaS

Buyer:

```text
research teams
active traders
token teams
analyst creators
market operators
```

Free hook:

```text
sample public watchlist
freshness and caveat display
manual feedback buttons
```

Paid product:

```text
saved watchlists
team seats
change history
notification workflows
review notes
```

Use public kit for:

```text
/candidates
/thesis-watchlist
/thesis-feedback
generated_at
source_snapshot_refs
```

TradeOS paid trigger:

```text
webhooks
custom watchlists
alert delivery
premium evidence depth
```

### 4. Tradebot Context Plugin

Buyer:

```text
bot builders
quant developers
advanced automation builders
internal trading infrastructure teams
```

Free hook:

```text
attach public digest context to a bot report
show caveats and invalidation notes
summarize why a thesis may be stale or weak
```

Paid product:

```text
bot plugin
explainability layer
risk review dashboard
post-trade journal context
private integration support
```

Use public kit for:

```text
/digest-inputs
/candidates
/thesis-watchlist
freshness
confidence
invalidation notes
```

TradeOS paid trigger:

```text
automation-safe API access
private regimes
premium context
webhooks
enterprise support
```

Boundary:

```text
The public kit does not place trades and should not be sold as an execution signal.
```

### 5. Quant Validation Pack

Buyer:

```text
quant funds
prop shops
market makers
signal vendors
research desks
```

Free hook:

```text
live public examples
schema integration
sample disagreement review
```

Paid product:

```text
historical export
validation report
replayable evaluation
benchmark dashboard
enterprise API
```

Use public kit for:

```text
public candidates and live schema examples
public thesis and claim outcome shapes
feedback labels
evidence freshness
```

TradeOS paid trigger:

```text
historical datasets
validation API
replayable datasets
private features
enterprise contract
```

Boundary:

```text
The public kit proves the workflow shape. Production validation data is a paid TradeOS surface.
```

### 6. Claim And Proof Reputation Pages

Buyer:

```text
analyst creators
research groups
token communities
fund marketing teams
data publications
```

Free hook:

```text
public claim lookup
proof state
source refs
```

Paid product:

```text
creator profile
proof-backed report pages
outcome tracker
reputation tooling
team analytics
```

Use public kit for:

```text
/proofs/{public_claim_id}
/claim-outcomes
/thesis-outcomes
source refs
feedback writes
```

TradeOS paid trigger:

```text
paid proof tooling
team analytics
bulk claim management
enterprise reporting
```

### 7. Market Context Widget

Buyer:

```text
wallets
portfolio dashboards
token discovery products
data portals
trading education platforms
```

Free hook:

```text
small public market context panel
freshness indicator
source-backed caveats
```

Paid product:

```text
B2B widget license
premium context panel
API subscription
customer-specific integration
```

Use public kit for:

```text
/sources/health
/digest-inputs
/thesis-watchlist
source_snapshot_refs
confidence and caveats
```

TradeOS paid trigger:

```text
higher volume
premium depth
custom universe
service-level support
```

## Pricing Levers Builders Can Use

```text
seats
communities or workspaces
saved watchlists
scheduled reports
alert destinations
history depth
export jobs
validation runs
private integrations
support tier
```

## Feedback Loop To Capture

Every product should capture structured feedback when possible:

```text
useful
not_useful
too_early
too_late
false_positive
missed_move
confusing_explanation
evidence_too_thin
```

That feedback gives the builder a product-quality signal and gives TradeOS
better labels for improving public intelligence.

## Copy Builders Can Use

```text
Powered by TradeOS public intelligence.
Source-backed market context with freshness, confidence, caveats, and feedback.
Not financial advice. No trade execution.
```

```text
Turn market evidence into a paid workflow: briefings, bots, watchlists,
validation, proof pages, and context widgets.
```

```text
Start with public intelligence. Upgrade when you need production volume,
alerts, exports, automation-safe access, or premium validation data.
```
