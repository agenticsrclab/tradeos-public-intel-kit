# TradeOS Local Execution Gateway

Phase 4 expansion point for execution adapters. The current implementation is
paper-only by design:

- no live exchange, wallet, or broker adapters;
- entries require `account_gates_applied=true`;
- local kill switch blocks entries;
- fills are deterministic and tagged `venue=paper`;
- live mode is explicitly rejected.

Environment contract:

| Variable | Default | Meaning |
| --- | --- | --- |
| `EXECUTION_GATEWAY_BIND_HOST` | `127.0.0.1` | Reserved bind host for a local HTTP wrapper. |
| `EXECUTION_GATEWAY_PORT` | `18130` | Local module port. |
| `EXECUTION_MODE` | `paper` | Only `paper` is supported in this kit. |

Live adapters should be added in a separate security-reviewed module/profile.
