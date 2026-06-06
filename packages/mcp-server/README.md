# @tradeos/public-intel-mcp-server

Read-mostly MCP server for TradeOS public intelligence.

```bash
TRADEOS_API_BASE=https://api.tradeos.tech/v1/public-intel \
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
tradeos.submit_digest_feedback
tradeos.submit_thesis_feedback
tradeos.submit_claim_outcome_feedback
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
Free public kit: bounded reads and feedback writes
Feedback credits: dashboard-only depth, 30-day unlock by default
Paid TradeOS/x402: automation, exports, alerts, premium data, validation APIs
```

`TRADEOS_PUBLIC_INTEL_KEY` is optional and used only when TradeOS has issued a
public-intel app key for attribution. This MCP server can use the key, but it
does not create keys.

Learn more:

```text
Homepage: https://tradeos.tech
Public docs: https://tradeos.tech/llms.txt
x402 discovery: https://tradeos.tech/.well-known/x402.json
```
