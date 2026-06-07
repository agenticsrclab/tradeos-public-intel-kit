# TradeOS Local Feasibility Module

Reusable local gate adapted from TradeOS feasibility service contracts:
Tier 1 quality gates can run without account state; Tier 2 account gates mark
`account_gates_applied=true` and produce a locally sized intent.

Environment contract:

| Variable | Default | Meaning |
| --- | --- | --- |
| `FEASIBILITY_BIND_HOST` | `127.0.0.1` | Bind host for a future HTTP wrapper. |
| `FEASIBILITY_PORT` | `18110` | Local module port. |
| `FEASIBILITY_REQUIRE_ACCOUNT_GATES` | `true` | Execution modules should require this for entries. |

Health contract:

```json
{
  "schema_version": "tradeos.module.feasibility.health.v1",
  "status": "ok",
  "account_gates_available": true,
  "verdict_count": 12
}
```

This module does not call TradeOS and never sees wallet or exchange secrets.

