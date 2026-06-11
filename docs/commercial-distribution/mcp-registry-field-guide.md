# Official MCP Registry Field Guide

The Official MCP Registry is a discovery layer for MCP server metadata. It does
not replace TradeOS paid access, x402 settlement, API entitlements, or builder
contracts. Use it to help agent hosts discover the public-intel MCP adapter, then
route premium depth through existing TradeOS paid boundaries.

## TradeOS Public-Intel Entry

```text
Registry name: io.github.agenticsrclab/tradeos-public-intel-mcp
Package: @tradeos/public-intel-mcp-server
Repository: https://github.com/agenticsrclab/tradeos-public-intel-kit
Package path: packages/mcp-server
Transport: stdio
```

This uses the existing `agenticsrclab` GitHub namespace because the public kit is
already distributed from that org. Use a custom `tradeos.tech` reverse-DNS name
only after the domain verification flow is set up and there is a reason to move
away from the GitHub namespace.

## Safe Listing Boundary

The public listing may advertise:

- source-backed market digest and candidate reads;
- symbol thesis, evidence packet, claim proof, and watchlist snapshot tools;
- feedback writes with optional app-key attribution;
- account-owned watchlist reads and delivery audit when the user supplies an
  account token.

The listing must not advertise:

- order placement or exchange connectivity;
- custody, managed accounts, copy trading, or personalized financial advice;
- raw private telemetry, model-control internals, exports, alert automation, or
  premium data without paid entitlement;
- the reserved hosted MCP URL before it is live.

## Publish Flow

1. Keep `packages/mcp-server/package.json` `mcpName` equal to
   `packages/mcp-server/server.json` `name`.
2. Run:

   ```bash
   npm --workspace @tradeos/public-intel-mcp-server run registry:check
   npm --workspace @tradeos/public-intel-mcp-server run test
   npm --workspace @tradeos/public-intel-mcp-server run build
   ```

3. Publish the package version to npm:

   ```bash
   cd packages/mcp-server
   npm publish --access public
   ```

   The MCP Registry validates npm ownership through the package metadata. If
   TradeOS does not control the `@tradeos` npm scope, update the package name
   before the first publish and keep `server.json` `packages[0].identifier`
   synchronized.

4. Validate, authenticate, and publish the registry metadata:

   ```bash
   mcp-publisher validate
   mcp-publisher login github
   mcp-publisher publish
   ```

5. Verify registry search:

   ```bash
   curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.agenticsrclab/tradeos-public-intel-mcp"
   ```

## GitHub Actions Path

The public kit includes `.github/workflows/publish-mcp-registry.yml`.

For automated release:

1. Add repository secret `NPM_TOKEN` with permission to publish
   `@tradeos/public-intel-mcp-server`.
2. Confirm GitHub Actions has `id-token: write` permission available for OIDC.
3. Push a tag shaped like:

   ```bash
   git tag mcp-public-intel-v0.1.0
   git push origin mcp-public-intel-v0.1.0
   ```

The workflow builds/tests the MCP package, publishes the npm artifact, logs into
the MCP Registry with GitHub OIDC, and publishes `server.json`.

For a manual registry-only retry, run the workflow from GitHub Actions with
`publish_npm=false` after confirming the same package version is already public
on npm.
