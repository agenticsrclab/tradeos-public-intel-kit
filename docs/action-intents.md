# Action Intents

Action intents are the compliance-safe bridge between a Symbol Cockpit
recommendation and any operator-owned action workflow.

An action intent is **not** an order, transaction, route, broker ticket, wallet
request, or execution instruction. It is a non-executable review artifact that
preserves the evidence, recommendation, risk flags, and required operator
choices.

```text
TradeOS evidence
  -> cockpit recommendation card
  -> non-executable action intent
  -> local feasibility / EA-risk gates
  -> operator approval
  -> paper-only gateway in this kit
  -> optional independent executor outside this kit
```

## Contract

`@tradeos/action-intent` emits `tradeos.action_intent.v1` payloads with these
hard boundaries:

- `non_executable: true`;
- `requires_operator_review: true`;
- the self-hosted operator must choose venue, account, size, order type,
  timing, approval, custody, and executor;
- prohibited executable fields include venue, account ID, wallet address,
  exchange, order type, quantity, notional, price, slippage, route, calldata,
  transaction body, and execute URL;
- TradeOS' role is intelligence and non-executable intent only;
- live execution is outside the public kit.

Example:

```json
{
  "schema_version": "tradeos.action_intent.v1",
  "non_executable": true,
  "requires_operator_review": true,
  "symbol": "VVV",
  "suggested_action": "avoid_new_long",
  "evidence_refs": ["market_pulse:global:24h", "fusion:VVV:latest"],
  "risk_flags": ["flow_stress_risk", "fusion_degraded"],
  "operator_must_choose": ["venue", "account", "size", "order_type", "timing", "approval", "custody", "executor"],
  "boundary": {
    "tradeos_role": "intelligence_and_non_executable_intent",
    "operator_role": "execution_sizing_custody_approvals_and_risk",
    "live_execution": "outside_public_kit",
    "third_party_executor": "independent_if_used"
  }
}
```

## What It Enables

Action intents let builders build useful action workflows without making TradeOS
an order router:

- review queues;
- paper trading;
- local approval workflows;
- local audit logs;
- third-party executor handoff experiments;
- post-action feedback and provenance.

The public kit only includes paper execution. Raw action intents are rejected by
the paper gateway because they must first pass local policy, account gates, and
operator approval.

## What It Must Not Become

Do not turn action intents into:

- TradeOS-hosted orders;
- executable calldata;
- broker or exchange order tickets;
- default routing to an executor;
- customer credential collection;
- account management;
- per-trade, spread, AUM, or execution-volume economics for TradeOS.

Independent live executors can consume the schema, but they are outside the
public kit. They own their own customer relationship, terms, approvals,
licensing, compliance, custody, routing, execution, losses, and support.
