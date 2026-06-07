# Repository Layout

This page is the map for the distribution kit. Start here when you want to know
which folder owns which product surface, which code is reusable, and where to
make changes.

## Top Level

| Path | What It Is | Change It When |
| --- | --- | --- |
| `apps/` | Runnable applications and product examples. | You are changing user-facing workflows, CLIs, bots, or dashboards. |
| `packages/` | Reusable SDKs, contracts, connectors, and local libraries. | You are changing shared behavior used by multiple apps. |
| `modules/` | Self-hosted local runtime modules for policy, risk, ops, execution, and notifications. | You are changing cockpit control-plane behavior. |
| `examples/` | Small integration examples for model providers and agent hosts. | You are showing a narrow provider or host setup. |
| `infra/` | Local Docker and Compose building blocks. | You are changing self-hosted deployment scaffolding. |
| `docs/` | Builder, product, API, safety, and operations documentation. | You are explaining how to build, ship, or operate with TradeOS. |
| `.github/workflows/` | CI and release checks. | You are changing automated validation. |

## Applications

| Path | Purpose | Primary Commands |
| --- | --- | --- |
| `apps/symbol-cockpit` | Flagship private self-hosted Symbol Cockpit: web UI, API, worker, local action agent, paper execution, ops, and alerts. | `npm run symbol-cockpit`, `npm run symbol-cockpit:e2e` |
| `apps/tradeos-agent-cli` | BYOK command-line agent for digests, watchlists, cockpit verdicts, preflight, feedback, and model-backed answers. | `npm run cli -- --help` |
| `apps/market-briefing-bot` | Runnable stdout, Discord, or Telegram market briefing bot. | `npm run briefing-bot -- brief` |
| `apps/example-next-dashboard` | Frontend dashboard example that keeps keys out of browser code. | App-specific README |

Use `apps/symbol-cockpit` as the reference when building the flagship consumer
experience. It demonstrates the recommended private control-plane split:

```text
TradeOS intelligence API
  -> local cockpit API and UI
  -> local feasibility and EA/risk checks
  -> local paper execution gateway
  -> local ops dashboard, audit, and notifications
```

## Shared Packages

| Path | Purpose |
| --- | --- |
| `packages/sdk-js` | TypeScript/JavaScript client for the public-intel API. |
| `packages/sdk-python` | Python client for the public-intel API. |
| `packages/mcp-server` | Stdio MCP server exposing TradeOS tools to local agent hosts. |
| `packages/cockpit-core` | Symbol Cockpit packet, recommendation card, bot preflight, recipes, IDs, and scoring contracts. |
| `packages/policy-core` | Approval requests, kill switch, feasibility policy, account gates, and execution actionability. |
| `packages/tradeos-connectors` | TradeOS public-intel aggregation and Venice/OpenAI-compatible action-agent connector. |

Keep shared contracts in `packages/` when more than one app or module needs the
same behavior. Keep app-specific orchestration in `apps/`.

## Runtime Modules

| Path | Purpose |
| --- | --- |
| `modules/feasibility` | Local Tier 1/Tier 2 feasibility service over `policy-core`. |
| `modules/ea-risk` | Expected-advantage and risk helper for cockpit packets. |
| `modules/execution-gateway` | Paper-only execution gateway. Live execution is intentionally excluded. |
| `modules/ops-dashboard` | Local ops snapshot contract for recommendations, approvals, notifications, kill switch, and audit. |
| `modules/notification-router` | Local stdout, webhook, and email delivery for recommendation cards. |

These modules are deliberately local-first. They are the pieces a builder can
swap, harden, or deploy privately while continuing to use TradeOS as the
intelligence source.

## Integration Examples

| Path | Purpose |
| --- | --- |
| `examples/venice` | Venice AI BYOK setup with the kit defaults. |
| `examples/openai-compatible` | Generic OpenAI-compatible model provider setup. |
| `examples/claude-desktop` | MCP configuration for Claude Desktop. |
| `examples/cursor` | MCP configuration for Cursor. |

Provider examples should stay small and focused. Product workflows belong in
`apps/`; reusable provider code belongs in `packages/tradeos-connectors`.

## Infrastructure

| Path | Purpose |
| --- | --- |
| `infra/compose/postgres.yml` | Optional local Postgres building block. |
| `infra/compose/redis.yml` | Optional local Redis building block. |
| `infra/compose/mcp.yml` | Optional local MCP service building block. |
| `infra/compose/observability.yml` | Optional observability building block. |
| `infra/docker/node-workspace.Dockerfile` | Shared Node workspace image. |
| `apps/symbol-cockpit/docker-compose.yml` | App-level cockpit topology with optional risk and execution profiles. |

The app-level Compose file is the fastest way to run the cockpit. The `infra/`
files are reusable pieces for builders who want a larger local topology.

## Documentation

| Path | Purpose |
| --- | --- |
| `docs/integration-keys-and-urls.md` | Where to get keys, which URLs to use, and how to configure SMTP. |
| `docs/distribution-setup-guide.md` | Step-by-step setup path for the kit. |
| `docs/symbol-cockpit-agent.md` | Product and runtime guide for the flagship cockpit. |
| `docs/public-intel-api.md` | Public-intel endpoint reference. |
| `docs/mcp-tools.md` | MCP tool reference and host setup. |
| `docs/safety-boundaries.md` | Custody, execution, privacy, and claim boundaries. |
| `docs/consumer-e2e.md` | Consumer-facing validation flow. |

If a new page helps a first-time builder orient faster, link it from
`docs/README.md` and the root `README.md`.

## Common Workflows

Install and build everything:

```bash
npm install
npm run build
```

Run unit tests and typechecks:

```bash
npm test --workspaces --if-present
npm run typecheck --workspaces --if-present
```

Run the flagship cockpit:

```bash
npm run symbol-cockpit
```

Run cockpit headless e2e tests:

```bash
npm run symbol-cockpit:e2e
```

Run the CLI:

```bash
npm run cli -- --help
```

Run the market briefing bot:

```bash
npm run briefing-bot -- brief
```

## Where To Make A Change

| Goal | Edit |
| --- | --- |
| Add a new TradeOS public-intel SDK method | `packages/sdk-js`, `packages/sdk-python`, tests, docs |
| Add a new MCP tool | `packages/mcp-server`, tests, `docs/mcp-tools.md` |
| Change cockpit verdict packet shape | `packages/cockpit-core`, SDK/CLI/MCP consumers, docs |
| Change non-executable action intent shape | `packages/action-intent`, `apps/symbol-cockpit`, `docs/action-intents.md` |
| Change local feasibility or execution policy | `packages/policy-core`, `modules/feasibility`, `modules/execution-gateway` |
| Change the cockpit UI or API route | `apps/symbol-cockpit/src/web`, `apps/symbol-cockpit/src/api`, e2e tests |
| Add notification delivery behavior | `modules/notification-router`, `modules/ops-dashboard`, cockpit runtime tests |
| Add a model-provider integration | `packages/tradeos-connectors`, `examples/`, setup docs |

Default rule: keep credentials, account state, private strategy, exchange keys,
and model keys server-side. Browser code should call a builder-owned backend,
not TradeOS or model providers directly with secrets.
