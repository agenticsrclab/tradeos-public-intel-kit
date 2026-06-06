# Contributing To TradeOS Public Intelligence Kit

TradeOS wants developers to build useful products on top of public
intelligence: apps, bots, MCP tools, SDK helpers, dashboards, connectors,
services, workflows, and docs.

The strongest contributions help another builder do useful work quickly and
create a clean feedback loop back to TradeOS.

## Good Contribution Areas

| Area | Examples | Where It Belongs |
| --- | --- | --- |
| Apps and bots | Discord bot, Telegram bot, Slack bot, newsletter worker, dashboard, alert worker | `apps/` |
| Agent tools | MCP tools, agent prompts, local workflow commands, Cursor/Claude examples | `packages/mcp-server`, `examples/` |
| SDKs and clients | TypeScript helper, Python helper, typed response helpers, retry handling | `packages/` |
| Services and connectors | webhook relay, scheduled worker, Notion/Airtable/Slack/Discord bridge, hosted adapter template | `apps/` or `examples/` |
| Feedback loops | provenance adapters, human review UI, label collection, outcome feedback workers | `apps/`, `packages/`, `docs/` |
| Builder docs | launch recipes, monetization guides, setup notes, integration walkthroughs | `docs/` |

## What We Want

Contributions should make it easier for a builder to:

```text
1. Pull TradeOS public evidence.
2. Package it into a product workflow.
3. Let users or agents provide structured feedback.
4. Keep secrets server-side.
5. Show clear upgrade points for paid TradeOS data, x402, or enterprise access.
```

Useful first ideas:

```text
Slack market briefing bot
Discord command bot with /digest and /watchlist
Telegram watchlist alert worker
Next.js public evidence dashboard
Quant validation export sample
Newsletter draft worker
Claim/proof explorer
Research review queue
MCP tool improvements
Python notebook examples
```

## Product Boundaries

Keep the public kit honest:

```text
No trade execution.
No exchange-key collection.
No personalized financial advice.
No private TradeOS data exposure.
No browser-side secrets.
No bypassing TradeOS rate limits, paid entitlements, or x402 payment.
```

TradeOS public intelligence is evidence and context. It is not an instruction
to buy, sell, hold, allocate capital, or connect to a user's brokerage account.

## Contribution Standards

Before opening a pull request:

```bash
npm run build
npm run typecheck --workspaces --if-present
npm run test --workspaces --if-present
PYTHONPATH=packages/sdk-python/src python -m pytest packages/sdk-python/tests -q
```

For docs-only changes, run the most relevant command plus a quick link/path
scan:

```bash
rg -n "TODO|FIXME|private endpoint|local machine path" . -S
```

Use the existing package layout and style. Keep examples small, runnable, and
server-side by default when secrets are involved.

## Adding An App Or Bot

New apps should include:

```text
README with a five-minute setup path
.env.example entries if new env vars are needed
deterministic no-LLM path when possible
BYOK model provider path when LLM output is useful
feedback/provenance support when the workflow produces useful labels or events
tests for prompt/safety/formatting logic
clear safety boundary
```

Prefer real utility over generic demos. A useful app should answer: who would
use this, what workflow does it improve, and what feedback does TradeOS learn
from it?

## Adding A Service Or Connector

Service examples should keep all credentials server-side and document:

```text
required environment variables
deployment shape
rate-limit behavior
Retry-After handling
what data is read from TradeOS
what feedback is written back
what paid TradeOS feature would be needed at scale
```

Hosted TradeOS-operated services require maintainer approval before they are
documented as available. Third-party service templates are welcome when they
are clearly labeled as builder-hosted.

## Pull Request Checklist

```text
The contribution has a clear builder use case.
Setup can be followed from a clean checkout.
Secrets stay server-side.
The contribution works without a TradeOS account unless attribution or paid access is required.
Feedback provenance is honest: human, human_assisted, agent, automation, or hybrid.
The safety boundary is stated.
Tests or runnable verification are included.
Docs link to the relevant setup guide.
```

## Security

Do not commit secrets, private endpoints, internal migration notes, customer
data, or local machine paths. Report security issues using [SECURITY.md](SECURITY.md).
