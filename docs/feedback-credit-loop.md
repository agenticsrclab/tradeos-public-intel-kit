# Data Intel Credit Loop

TradeOS Data Intel Credits connect public intelligence, human review, and
builder applications without turning feedback into trading authority,
transferable assets, or paid infrastructure access.

The loop:

```text
Read evidence -> label a stable target -> preserve provenance -> quality review -> DTI credit or app reputation -> better dashboard and data quality
```

## Human App Model

In the TradeOS app, people use the loop this way:

1. Open the public market dashboard.
2. Create an account for starter Ask TradeOS access and welcome DTI credits.
3. Verify email ownership so future feedback has stronger human provenance.
4. Review specific evidence such as market cards, VPIN incidents, forecast
   panels, directional-bias views, fusion signals, EA-quality views, digest
   items, token-risk notes, or thesis tasks.
5. Submit a contextual label and optional note.
6. Wait for duplicate, abuse, and quality checks.
7. Redeem approved DTI credits for temporary dashboard depth.

Free public market intelligence remains available when a credit unlock expires.

## Credit Ladder

The user-facing TradeOS Data Intel Credit model is:

| Step | User action | Credit or access effect | Expiry |
| --- | --- | --- | --- |
| Start anonymous | Open the public dashboard | Read public market state and ask 3 public-intelligence questions | Session or anonymous quota boundary |
| Create account | Sign in to TradeOS | 6 welcome DTI credits and 10 signed-in starter Ask questions | Ask starter lasts 7 days |
| Give useful feedback | Label a unique evidence target with honest provenance | 3 DTI credits after quality checks | DTI credits remain in the ledger until spent or revoked |
| Redeem 3 DTI credits | Choose a light dashboard unlock | Faster refresh, more public symbols, longer history, deeper evidence, Token Discovery detail, Fusion Lite detail, or more saved views | 7 days by default |
| Redeem 6 DTI credits | Choose a deeper review or preview unlock | Limited paid-preview cards, Forecast Lab, Bias/Fusion Review, EA Entry Quality, Symbol Story, Token Cycle, Digest/Thesis Review, or +5 Ask questions | 7 days by default |
| Unlock expires | Stop contributing or let the grant lapse | Fall back to free public limits | Immediate after expiry |

The point is simple: users start with enough DTI credits to try depth, earn
more by helping validate specific evidence, and spend DTI credits only on
dashboard-style depth. DTI credits are account-based app credits, not paid API
entitlement or transferable assets.

Free, starter, and feedback-earned access is best-effort promotional access:
no SLA, no guaranteed availability, no cash value, and it may be rate-limited,
changed, paused, degraded, or revoked to protect TradeOS infrastructure. Paid,
x402, or contract access is the path for reliable production scale.

## Builder Model

Builders should preserve stable target IDs and provenance. A feedback event
should make it clear what was reviewed, who or what produced the label, and how
automated the workflow was.

Recommended steps:

1. Use the public API, SDK, CLI, or MCP server.
2. Keep stable target IDs on digests, thesis cards, evidence cards, alerts, bot
   answers, and dashboard widgets.
3. Submit feedback with `feedback_source`, `automation_level`, client app,
   client version, and an idempotency key.
4. Use a verified TradeOS account when creating public-intelligence app keys.
5. Keep direct human labels separate from human-assisted labels, agent labels,
   automation labels, and hybrid workflows.

## Feedback Labels

```text
useful
not_useful
too_early
too_late
false_positive
missed_move
confusing_explanation
evidence_too_thin
state_still_pressing
state_rebounded
state_stabilized
state_uncertain
```

## Feedback Event Shape

```json
{
  "target_type": "digest",
  "target_id": "digest_123",
  "label": "useful",
  "optional_note": "Clear and timely",
  "consent_for_dataset_use": true,
  "anonymous_session_id_or_user_id": "session_abc",
  "client_app": "tradeos-agent-cli",
  "client_version": "0.1.0",
  "feedback_source": "human",
  "automation_level": "none",
  "agent_id": "",
  "agent_run_id": "",
  "agent_model": "",
  "idempotency_key": "tradeos_public_intel_..."
}
```

## Feedback Provenance

Feedback source must be explicit:

```text
human
human_assisted
agent
automation
hybrid
```

Recommended treatment:

| Feedback Class | Credit Use | Access Window |
| --- | --- | --- |
| linked verified human | eligible for normal DTI credit | 7 days by default |
| linked unverified human | quality signal; not trusted validation until verified | none or conservative |
| linked human-assisted | partial to full credit after validation | 7 days by default |
| anonymous human | quality signal; reconcile later if linked | none until linked |
| verified agent | app reputation or limited app preview | 7 days after calibration |
| raw automation | telemetry only | none by default |

Agentic and automated feedback is valuable, but it should be credited
differently. It can improve QA, detect stale evidence, measure model
disagreement, and build app reputation. It should not receive the same user
DTI credit as linked human feedback unless TradeOS validates the source and policy.

## Builder App Quota

Builder app quota uses app reputation, not personal user credit.

| App state | API behavior |
| --- | --- |
| Anonymous preview | tiny keyless public read/write limits |
| Verified starter key | 7-day starter public quota |
| Baseline key | conservative quota after starter expiry |
| Earned key | starter-level quota refreshed by useful app-attributed feedback |
| Reviewed project | higher quota after `POST /v1/public-intel/quota-requests` and operator approval |
| Paid/entitled project | private intelligence products, scale, alerts, automation, exports, or data rights |

Public read responses expose the active profile in
`access_control.rate_limit_status.quota_profile`. Builders should use that value
for product messaging instead of guessing which plan they are on.

## Credit Boundary

DTI credits are separate from starter question quota. Starter ask access mirrors
the current TradeOS pattern:

| User State | Starter Access | Expiry |
| --- | --- | --- |
| Anonymous visitor | 3 public-intelligence questions | Session or anonymous quota boundary |
| Signed-in starter user | 10 public-intelligence questions | 7 days from first quota activation |
| DTI question pack | 5 extra public-intelligence questions | Earned with Data Intel Credits |

Current Data Intel Credit pattern:

```text
New signed-in account: 6 welcome DTI credits
Feedback-earned depth unlock: 7 days by default
Expired unlock: fall back to free public limits
```

DTI credits may unlock dashboard-only capacity:

| Cost | Unlock family | Examples |
| ---: | --- | --- |
| 3 DTI credits | Light dashboard depth | Faster public refresh, more symbols, 30-day public history, deeper evidence cards, Token Discovery detail, Fusion Lite detail, saved-view slots |
| 6 DTI credits | Review and preview depth | Limited paid-preview cards, Forecast Lab, Bias/Fusion Review, EA Entry Quality, Symbol Story Deep Dive, Token Cycle Review, Digest/Thesis Review |
| 6 DTI credits | Ask extension | 5 extra read-only public-intelligence questions |

DTI credits must not unlock:

- raw exports;
- bulk API access;
- webhooks;
- bot automation;
- production x402 access;
- private forecasts;
- execution behavior;
- exchange connectivity;
- enterprise data.

DTI credits and starter quota do not unlock x402 calls. Paid machine access
belongs to TradeOS x402 resources and paid entitlement flows.

## Builder Examples

Human label from a community dashboard:

```bash
tradeos-intel feedback \
  --target-id digest_123 \
  --target-type digest \
  --label useful \
  --feedback-source human \
  --automation-level none \
  --anonymous-session-id user_abc \
  --note "Clear caveats and useful risk context"
```

Human-assisted label from a bot where a person confirms the suggestion:

```bash
tradeos-intel feedback \
  --target-id thesis_456 \
  --target-type thesis \
  --label evidence_too_thin \
  --feedback-source human_assisted \
  --automation-level assisted \
  --agent-model venice-compatible-model \
  --note "Agent flagged weak source coverage; moderator agreed"
```

Automation label from a scheduled outcome check:

```bash
tradeos-intel feedback \
  --target-id thesis_456 \
  --target-type thesis \
  --label too_late \
  --feedback-source automation \
  --automation-level automated \
  --provenance-note "Scheduled outcome check after 24h move window"
```

More detail: [Access And Payments](access-and-payments.md) and
[API Keys And Feedback Provenance](api-keys-and-feedback-provenance.md).
