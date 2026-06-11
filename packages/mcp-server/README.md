# @agenticsrclab/tradeos-public-intel-mcp-server

Read-mostly MCP server for the TradeOS public Data Intelligence layer.

Official MCP Registry name:

```text
io.github.agenticsrclab/tradeos-public-intel-mcp
```

```bash
TRADEOS_API_BASE=https://api.tradeos.tech/v1/public-intel \
TRADEOS_ACCOUNT_TOKEN=<optional-account-token-for-watchlist-tools> \
TRADEOS_PUBLIC_INTEL_KEY=<optional-app-key-for-attribution> \
npx @agenticsrclab/tradeos-public-intel-mcp-server
```

Use it from Claude Desktop, Cursor, or another stdio MCP client to give an agent
access to:

```text
tradeos.get_market_digest
tradeos.get_public_candidates
tradeos.get_thesis_watchlist
tradeos.get_symbol_thesis
tradeos.get_evidence_packet
tradeos.get_public_claim_proof
tradeos.watchlist_capabilities
tradeos.get_token_watchlist_snapshot
tradeos.list_watchlists
tradeos.create_watchlist
tradeos.add_watchlist_item
tradeos.get_watchlist_state
tradeos.list_watchlist_events
tradeos.list_watchlist_deliveries
tradeos.trigger_watchlist_deliveries
tradeos.submit_digest_feedback
tradeos.submit_thesis_feedback
tradeos.submit_claim_outcome_feedback
tradeos.submit_watchlist_feedback
```

Feedback tools accept optional provenance fields:

```text
feedbackSource: human | human_assisted | agent | automation | hybrid
automationLevel: none | assisted | automated | autonomous
agentId
agentRunId
agentModel
agentConfidence
```

`tradeos.get_credit_state` can return app reputation DTI for the configured
public-intel app key. It does not expose personal human DTI; human DTI remains a
signed-in TradeOS dashboard and Review Lab lifecycle.

The server does not place trades, accept exchange credentials, or expose private
TradeOS telemetry.

Access model:

```text
Free public kit: bounded reads, token snapshots, and feedback writes
Human DTI: public dashboard depth, public Ask packs, or read-only Review Lab where enabled
App reputation DTI: app-key feedback quality and quota confidence, not personal balance
Account token: saved watchlists, events, channels, delivery audit, and user-owned feedback
Paid TradeOS/x402: automation, exports, high-volume alerts, premium data, validation APIs
```

`TRADEOS_PUBLIC_INTEL_KEY` is optional and used only when TradeOS has issued a
public-intel app key for attribution. This MCP server can use the key, but it
does not create keys.

Watchlist tools require `TRADEOS_ACCOUNT_TOKEN`. They expose research awareness,
saved user state, and delivery audit only; they do not place trades or connect
exchanges.

Learn more:

```text
Homepage: https://tradeos.tech
Public docs: https://tradeos.tech/llms.txt
Key setup: https://github.com/agenticsrclab/tradeos-public-intel-kit/blob/main/docs/getting-api-keys-and-scale.md
x402 discovery: https://tradeos.tech/.well-known/x402.json
```

## Official MCP Registry Publishing

The registry metadata is in `server.json`. The package `mcpName` in
`package.json` must stay equal to `server.json.name`.

Local metadata check:

```bash
npm --workspace @agenticsrclab/tradeos-public-intel-mcp-server run registry:check
```

Publish prerequisites:

```text
GitHub namespace: io.github.agenticsrclab/*
NPM package: @agenticsrclab/tradeos-public-intel-mcp-server
MCP registry name: io.github.agenticsrclab/tradeos-public-intel-mcp
```

Manual publish from this directory after the npm package version is public:

```bash
mcp-publisher validate
mcp-publisher login github
mcp-publisher publish
```

CI publish uses `.github/workflows/publish-mcp-registry.yml` and GitHub OIDC for
the MCP Registry. The workflow still needs an `NPM_TOKEN` repository secret when
it is also publishing the npm package version. The npm package uses the
`@agenticsrclab` scope because that scope is controlled by the same public
distribution org used for GitHub registry authentication.
