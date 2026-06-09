# Public Fusion Signal Cockpit Preview

`https://tradeos.tech/fusion` is the public, redacted Signal Cockpit preview.
It gives visitors symbol-level signal context they can judge and label without
turning TradeOS into a hosted executor, broker, custody product, or managed
account service.

The public preview should be useful enough for a consumer to answer:

- what symbol is active;
- whether the current read leans long, short, neutral, review, watch, or
  stand-aside;
- how confident and fresh the read is;
- which high-level drivers explain why it fired;
- what would invalidate the read;
- whether quality checks, agreement, or flow stress weaken the read;
- how to submit feedback on direction quality, freshness, confidence, missing
  context, risk understatement, or confusing explanation.

It should not expose the private cockpit's execution context.

## Layout Pattern

The public `/fusion` page follows the same broad interaction pattern as
`/discover`:

```text
left rail: symbol and signal queue
right pane: selected signal detail, evidence summary, invalidation, feedback
```

This keeps the first screen concrete. A user sees the symbols first, selects
one, reviews the current signal packet, and can immediately label whether the
read was useful, stale, overconfident, thin, or missing context.

Avoid redundant tab sets such as Pulse, Validation, Access, or generic Review
tabs on the public Fusion page. Public users need a queue, a selected signal
detail, and feedback intake. Deeper review tasks belong in Review Lab or paid
private products.

## Public Value

The public preview may show:

- symbol;
- direction or bias;
- horizon;
- confidence or confidence band;
- freshness;
- high-level agreement or disagreement state;
- why-fired notes;
- invalidation notes;
- quality and risk flags;
- redacted evidence references;
- stable feedback target IDs;
- feedback labels and optional notes.

Good public language:

```text
SOL has a short-bias signal on the current horizon, but agreement is weak and
flow stress is elevated. Treat this as a review signal, not an execution
instruction.
```

Bad public language:

```text
Sell SOL now at this price with this stop and take-profit.
```

## Safety Boundary

The public boundary is directional intelligence only:

```text
public_signal_boundary: direction_only_not_execution
execution_fields_exposed: false
```

The public preview must not expose or claim:

- `buy_now` or `sell_now` labels;
- entries;
- stops;
- take-profit levels;
- position size;
- leverage;
- order type;
- venue, route, account, or execution adapter;
- automation or alert delivery;
- paid/private signal diagnostics;
- execution-sensitive feature detail;
- portfolio state;
- exchange credentials;
- executable action intents.

The private self-hosted cockpit may produce actionable recommendations for the
operator's own review environment. The public Fusion preview should stop at
direction, confidence, caveats, invalidation, and feedback.

## Endpoint Boundary

The app surface can use a TradeOS app route such as:

```text
GET /api/public/fusion-signals
```

That route is a public app endpoint, not part of the public-intel API base at
`https://api.tradeos.tech/v1/public-intel` unless TradeOS intentionally releases
it there later.

A compliant public response should carry explicit boundary metadata similar to:

```json
{
  "execution_fields_exposed": false,
  "public_signal_boundary": "direction_only_not_execution",
  "display_policy": {
    "execution_cta_allowed": false,
    "disallowed_public_labels": ["buy_now", "sell_now"]
  }
}
```

Builders should preserve these flags if they embed, summarize, or screenshot
the public Fusion preview.

## Feedback Intake

The public Fusion preview should collect feedback against stable target IDs.
Useful labels include:

- useful;
- stale;
- overconfident;
- wrong_direction;
- too_early;
- too_late;
- missing_context;
- risk_understated;
- confusing_explanation;
- evidence_too_thin.

Feedback improves signal-quality review and can support public Data Intel
Credit flows, but it does not authorize execution, unlock paid/private
diagnostics, or grant production API scale.

## Upgrade Boundary

Paid, x402, private, or enterprise access is the path for:

- larger symbol universes;
- deeper history;
- private Signal Fusion traces;
- raw thresholds and feature values;
- alert delivery;
- API delivery;
- replay and validation datasets;
- automation-safe reads;
- private cockpit context;
- enterprise data rights.

The public page attracts users by showing enough symbol-level signal quality to
judge TradeOS. The private and paid surfaces remain the place for deeper traces,
workflow automation, alerts, exports, and execution-aware local tooling.
