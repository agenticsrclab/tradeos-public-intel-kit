# @tradeos/public-intel-mcp-server

Read-mostly MCP server for the TradeOS public Data Intelligence layer.

```bash
TRADEOS_API_BASE=https://api.tradeos.tech/v1/public-intel \
TRADEOS_ACCOUNT_TOKEN=<optional-account-token-for-watchlist-tools> \
TRADEOS_PUBLIC_INTEL_KEY=<optional-app-key-for-attribution> \
npx @tradeos/public-intel-mcp-server
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

The server does not place trades, accept exchange credentials, or expose private
TradeOS telemetry.

Access model:

```text
Free public kit: bounded reads, token snapshots, and feedback writes
Data Intel Credits: dashboard-only depth, 30-day unlock by default
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
x402 discovery: https://tradeos.tech/.well-known/x402.json
```
