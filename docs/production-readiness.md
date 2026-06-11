# Production Readiness

This checklist is for publishing and operating the TradeOS public intelligence
distribution kit.

## Canonical Endpoints

Use the public API host for external builders:

```text
https://api.tradeos.tech/v1/public-intel
```

The product site may also proxy same-origin browser requests through
`https://tradeos.tech/v1/public-intel`, but external examples should prefer the
API host.

The hosted MCP bridge hostname is reserved:

```text
https://mcp.tradeos.tech/public-intel
```

Until that bridge is deployed, the supported MCP path is local stdio:

```bash
npx @agenticsrclab/tradeos-public-intel-mcp-server
```

## Service Durability

Before public launch, verify the TradeOS production stack has supervised
restart behavior for:

- public-intel API origin;
- dashboard/product site origin;
- Postgres migrations and schema state;
- edge route process;
- log retention for auth, app-key, write-rate-limit, and feedback events.

The public API should return JSON for these smoke checks:

```bash
curl -fsS https://api.tradeos.tech/v1/public-intel/sources/health
curl -fsS https://api.tradeos.tech/v1/public-intel/app-attribution \
  -H 'authorization: Bearer invalid-public-intel-probe'
```

Expected app-attribution result for an invalid probe is HTTP 200 JSON with
`"valid": false`.

## Public Publish Gate

Run these checks before making the GitHub repository public:

```bash
npm ci
npm run build --workspaces
npm run typecheck --workspaces --if-present
npm run test --workspaces --if-present
PYTHONPATH=packages/sdk-python/src python3.11 -m pytest packages/sdk-python/tests -q
```

Any local-only examples that remain should be clearly labeled as local core
development, not public consumer configuration. The GitHub Actions
`public-scrub` job blocks common local-path and secret leaks.

## Secret Handling

Never commit `.env`, `.env.local`, provider keys, TradeOS account tokens, or
public-intel app-key secrets. App keys are returned once on creation or
rotation, and existing secrets are not retrievable.

If a test key is pasted into a ticket, chat, CI log, or issue, rotate it before
publishing.
