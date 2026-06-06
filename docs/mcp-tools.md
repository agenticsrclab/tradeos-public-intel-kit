# MCP Tools

The MCP server is read-mostly. The only write tools submit feedback.

## Read Tools

```text
tradeos.get_market_digest
tradeos.get_public_candidates
tradeos.get_symbol_thesis
tradeos.get_thesis_watchlist
tradeos.get_evidence_packet
tradeos.get_public_claim_proof
tradeos.get_thesis_feedback
tradeos.get_credit_state
```

## Feedback Tools

```text
tradeos.submit_thesis_feedback
tradeos.submit_claim_outcome_feedback
tradeos.submit_digest_feedback
```

## Run Locally

```bash
TRADEOS_API_BASE=https://api.tradeos.tech/v1/public-intel \
npm --workspace @tradeos/public-intel-mcp-server run dev
```

## Hosted Remote MCP

TradeOS has reserved this remote MCP bridge hostname:

```text
https://mcp.tradeos.tech/public-intel
```

It is not the default consumer path until the hosted HTTP MCP bridge is
deployed. The local stdio MCP server remains the supported path for Claude
Desktop, Cursor, and other local agent hosts.

When live, the hosted MCP bridge should call the same public intelligence API:

```text
https://api.tradeos.tech/v1/public-intel
```

The open-source local MCP server is only an adapter; TradeOS still hosts the
intelligence API.

## Safety

The server does not expose tools for trading, exchange credentials, private
forecast data, raw VPIN/features, or portfolio state.
