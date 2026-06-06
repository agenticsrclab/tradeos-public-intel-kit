# Feedback Credit Loop

TradeOS feedback credits connect public intelligence, human review, and builder
applications without turning feedback into trading authority or paid
infrastructure access.

The loop:

```text
Read evidence -> label a stable target -> preserve provenance -> quality review -> credit or app reputation -> better dashboard and data quality
```

## Human App Model

In the TradeOS app, people use the loop this way:

1. Open the public market dashboard.
2. Create an account for starter Ask TradeOS access and welcome dashboard
   credits.
3. Verify email ownership so future feedback has stronger human provenance.
4. Review specific evidence such as market cards, VPIN incidents, forecast
   panels, directional-bias views, fusion signals, EA-quality views, digest
   items, token-risk notes, or thesis tasks.
5. Submit a contextual label and optional note.
6. Wait for duplicate, abuse, and quality checks.
7. Redeem approved credits for temporary dashboard depth.

Free public market intelligence remains available when a credit unlock expires.

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
| linked verified human | eligible for normal dashboard credit | 30 days by default |
| linked unverified human | quality signal; not trusted validation until verified | none or conservative |
| linked human-assisted | partial to full credit after validation | 14-30 days |
| anonymous human | quality signal; reconcile later if linked | none until linked |
| verified agent | app reputation or limited app preview | 7-14 days after calibration |
| raw automation | telemetry only | none by default |

Agentic and automated feedback is valuable, but it should be credited
differently. It can improve QA, detect stale evidence, measure model
disagreement, and build app reputation. It should not receive the same user
credit as linked human feedback unless TradeOS validates the source and policy.

## Credit Boundary

Credits are separate from starter question quota. Starter ask access mirrors the
current TradeOS pattern:

| User State | Starter Access | Expiry |
| --- | --- | --- |
| Anonymous visitor | 3 public-intelligence questions | Session or anonymous quota boundary |
| Signed-in starter user | 20 public-intelligence questions | 7 days from first quota activation |

Current dashboard credit pattern:

```text
New signed-in account: 6 dashboard welcome credits
Feedback-earned depth unlock: 30 days by default
Expired unlock: fall back to free public limits
```

Credits may unlock dashboard-only capacity:

- more refreshes;
- more saved symbols;
- longer history windows;
- deeper public evidence cards;
- additional public Ask TradeOS question packs;
- limited preview depth for forecast, bias, fusion, EA-quality, digest, token,
  thesis, and review-lab surfaces.

Credits must not unlock:

- raw exports;
- bulk API access;
- webhooks;
- bot automation;
- production x402 access;
- private forecasts;
- execution behavior;
- exchange connectivity;
- enterprise data.

Credits and starter quota do not unlock x402 calls. Paid machine access belongs
to TradeOS x402 resources and paid entitlement flows.

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
