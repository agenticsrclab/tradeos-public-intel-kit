# Consumer E2E

This document records the public consumer flow tested before publish.

The test was run from fresh package tarball installs in a temporary directory,
not from workspace-local imports. A real Venice API key from the
[Venice AI subscription page](https://venice.ai/pricing) was used for the BYOK
LLM path, but the key was not printed or stored in the repository.

## Tested Surfaces

```text
@tradeos/public-intel-sdk
@tradeos/public-intel-mcp-server
@tradeos/public-intel-agent-cli
@tradeos/cockpit-core
@tradeos/policy-core
@tradeos/tradeos-connectors
@tradeos/symbol-cockpit
tradeos-public-intel Python SDK
```

## Tested Flow

1. Install npm tarballs in a clean consumer project.
2. Run CLI `digest --limit 2`.
3. Run CLI `ask` with Venice AI.
4. Run CLI feedback write.
5. Run TypeScript SDK `sourcesHealth`.
6. Run TypeScript SDK `getMarketDigest`.
7. Run TypeScript SDK `submitDigestFeedback`.
8. Initialize MCP stdio server from the installed package.
9. List MCP tools.
10. Call `tradeos.get_market_digest`.
11. Call `tradeos.submit_digest_feedback`.
12. Install Python SDK in a Python 3.11 virtual environment.
13. Run Python SDK read and feedback write.
14. Run JS SDK `getSymbolCockpitEvidence` against live TradeOS public-intel.
15. Run CLI `cockpit VVV --chain 8453 --mode trader`.
16. Call MCP handler `tradeos.get_symbol_cockpit`.
17. Start `apps/symbol-cockpit` API and call `/api/cockpit`.
18. Call `/api/preflight`, `/api/ops`, and paper-order approval/fill paths.
19. Run `COCKPIT_WORKER_RUN_ONCE=true` scanner over a short watchlist.

## Expected Results

```text
CLI digest schema: tradeos.public_intel.digest_inputs.v1
CLI ask: non-empty grounded answer from Venice-backed BYOK flow
Feedback schema: tradeos.public_intel.conversion_write_ack.v1
Feedback status: accepted_shadow
MCP tool count: 21
MCP feedback status: accepted_shadow
Python feedback status: accepted_shadow
Symbol cockpit evidence schema: tradeos.public_intel.symbol_cockpit_evidence.v1
Cockpit API schema: tradeos.symbol_cockpit.review_result.v1
Paper execution venue: paper
```

On June 7, 2026, the cockpit validation was rerun from this workspace with a
valid `TRADEOS_PUBLIC_INTEL_KEY`. SDK aggregation, CLI cockpit, MCP cockpit,
local API review/preflight/ops, worker scanner, and paper execution all
returned expected schemas with no TradeOS source errors. The Venice action
agent route was validated up to its missing-key boundary because no
`VENICE_API_KEY` was present in the shell or local env file.

The later watchlist certification flow also verified account signup, token
watchlist state, events, in-app delivery audit, unverified-email skip audit,
watchlist feedback, and archive against the public hosts.

## Notes

The hosted MCP hostname is reserved but not the default path yet:

```text
https://mcp.tradeos.tech/public-intel
```

The supported consumer MCP path today is local stdio MCP:

```bash
npx @tradeos/public-intel-mcp-server
```

The default Venice model is the privacy-enhanced upstream path used by the kit:

```text
TRADEOS_AGENT_MODEL=e2ee-glm-5-1
TRADEOS_AGENT_TIMEOUT_MS=45000
TRADEOS_AGENT_DIGEST_LIMIT=5
```
