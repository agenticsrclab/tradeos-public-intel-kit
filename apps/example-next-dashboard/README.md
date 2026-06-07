# Example Dashboard

This folder is reserved for the optional public dashboard example from the ADR.
It should demonstrate how a builder turns TradeOS marketplace intelligence into
a customer-facing workflow without exposing secrets or private data.
The core end-to-end path in this repository is:

```text
TradeOS public-intel API -> SDK -> MCP server / BYOK CLI -> feedback writes
```

The dashboard example should stay client-safe:

- never request model provider API keys in browser code;
- never expose private TradeOS API keys;
- use a server-side route for any BYOK inference call;
- only render public intelligence and feedback-credit state.

Recommended future scaffold:

```bash
npx create-next-app@latest apps/example-next-dashboard --ts --eslint --app
```
