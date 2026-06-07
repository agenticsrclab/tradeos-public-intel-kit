# TradeOS Local EA/Risk Module

Local expected-advantage gate for cockpit packets. It adapts TradeOS EA
concepts into a deterministic, dependency-light module: confidence threshold,
verdict gating, ugly-risk invalidation, and an expected-advantage score.

Environment contract:

| Variable | Default | Meaning |
| --- | --- | --- |
| `EA_RISK_BIND_HOST` | `127.0.0.1` | Bind host for a future HTTP wrapper. |
| `EA_RISK_PORT` | `18120` | Local module port. |
| `EA_RISK_MIN_CONFIDENCE` | `0.5` | Local pass threshold. |

No execution or custody happens here.

