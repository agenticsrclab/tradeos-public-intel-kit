# MCP Tools

The MCP server is read-mostly. Write tools are limited to feedback and
account-authorized watchlist operations.

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
tradeos.watchlist_capabilities
tradeos.get_token_watchlist_snapshot
```

## Feedback Tools

```text
tradeos.submit_thesis_feedback
tradeos.submit_claim_outcome_feedback
tradeos.submit_digest_feedback
tradeos.submit_watchlist_feedback
```

## Account Watchlist Tools

```text
tradeos.list_watchlists
tradeos.create_watchlist
tradeos.add_watchlist_item
tradeos.get_watchlist_state
tradeos.list_watchlist_events
tradeos.list_watchlist_deliveries
tradeos.trigger_watchlist_deliveries
```

These require `TRADEOS_ACCOUNT_TOKEN`. If `TRADEOS_PUBLIC_INTEL_KEY` is also
configured, watchlist feedback carries builder attribution through
`X-TradeOS-Public-Intel-Key`.

`tradeos.trigger_watchlist_deliveries` evaluates current watchlist events
against stored notification channels and records delivery audit rows. It does
not create new channels, place trades, or bypass TradeOS channel consent.

## Run Locally

```bash
TRADEOS_API_BASE=https://api.tradeos.tech/v1/public-intel \
TRADEOS_ACCOUNT_TOKEN=<optional account token for watchlist tools> \
TRADEOS_PUBLIC_INTEL_KEY=<optional app key for attribution> \
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

Watchlist tools expose research awareness and user-owned saved state. They do
not place orders, connect exchanges, or turn TradeOS context into a personalized
instruction.
