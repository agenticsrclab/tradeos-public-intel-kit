# @tradeos/market-briefing-bot

Discord and Telegram ready market briefing bot powered by TradeOS public
intelligence.

This is the first concrete bot in the Data Intelligence distribution kit. It is useful
out of the box because communities, research groups, bot builders, and analysts
already need a short source-backed market brief they can post on a schedule.

## What It Does

```text
1. Pulls TradeOS public digest and thesis watchlist evidence.
2. Builds a concise market briefing.
3. Uses [Venice AI](https://venice.ai/pricing) as the recommended privacy-aligned BYOK default when a model key is configured.
4. Falls back to a deterministic template when no LLM key is present.
5. Posts to stdout, Discord webhook, or Telegram chat.
6. Optionally submits a publication feedback/provenance event to TradeOS.
```

It does not place trades, accept exchange keys, expose private data, or provide
personalized financial advice.

## Quick Start

Prerequisites:

```text
Node.js 20 or newer
npm
optional Venice AI key for LLM summaries
optional Discord webhook or Telegram bot token for posting
```

From a clean checkout:

```bash
npm install
npm run build
npm run briefing-bot -- brief
```

This works without a TradeOS account and without an LLM key. It prints a
deterministic briefing from live TradeOS public evidence.

Use Venice AI for the recommended privacy-aligned BYOK model path. Get a key
from the [Venice AI subscription page](https://venice.ai/pricing):

```bash
export VENICE_API_KEY=...
npm run briefing-bot -- brief
```

Test the post path locally:

```bash
TRADEOS_BRIEFING_PLATFORM=stdout npm run briefing-bot -- post
```

See the supported commands:

```bash
npm run briefing-bot -- help
```

## Discord

Create a Discord webhook for the target channel, then run:

```bash
export TRADEOS_BRIEFING_PLATFORM=discord
export DISCORD_WEBHOOK_URL=...
export VENICE_API_KEY=...
npm run briefing-bot -- post
```

## Telegram

Create a Telegram bot token and get the target chat ID, then run:

```bash
export TRADEOS_BRIEFING_PLATFORM=telegram
export TELEGRAM_BOT_TOKEN=...
export TELEGRAM_CHAT_ID=...
export VENICE_API_KEY=...
npm run briefing-bot -- post
```

## Attribution And Feedback

Public reads work without a TradeOS key. For production attribution:

```bash
export TRADEOS_PUBLIC_INTEL_KEY=<tradeos-public-intel-key>
```

See [Getting API Keys And Requesting Scale](../../docs/getting-api-keys-and-scale.md)
for the TradeOS Developer Keys flow, optional provider keys, and quota requests.

Without an app key, feedback writes may be accepted as shadow telemetry, but
they do not earn app reputation or quota confidence, and they do not unlock paid
access.

Submit a publication feedback/provenance event:

```bash
export TRADEOS_BRIEFING_SUBMIT_FEEDBACK=true
npm run briefing-bot -- post
```

The bot reports itself as:

```text
feedback_source=automation
automation_level=automated
agent_id=tradeos-market-briefing-bot
```

TradeOS decides credit class server-side. Automation feedback is a quality and
app-reputation signal after validation, not personal user credit by default.

## Environment

```text
TRADEOS_API_BASE=https://api.tradeos.tech/v1/public-intel
TRADEOS_PUBLIC_INTEL_KEY=
TRADEOS_BRIEFING_PLATFORM=stdout|discord|telegram
TRADEOS_BRIEFING_CHAIN_ID=8453
TRADEOS_BRIEFING_DIGEST_LIMIT=5
TRADEOS_BRIEFING_WATCHLIST_LIMIT=5
TRADEOS_BRIEFING_USE_LLM=true
TRADEOS_BRIEFING_DRY_RUN=false
TRADEOS_BRIEFING_SUBMIT_FEEDBACK=false
DISCORD_WEBHOOK_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
LLM_PROVIDER=venice
OPENAI_BASE_URL=https://api.venice.ai/api/v1
VENICE_API_KEY=
OPENAI_API_KEY=
TRADEOS_AGENT_MODEL=e2ee-glm-5-1
```

## Why This Bot

This is the smallest useful product wedge:

```text
TradeOS public intelligence -> scheduled community briefing -> reader feedback -> app attribution.
```

Builders can fork it into a paid Discord bot, Telegram channel assistant,
research community digest, DAO market monitor, or internal analyst briefing
worker.

## Contributing Forks Back

Useful forks are welcome as apps, tools, services, or docs. Good contributions
keep secrets server-side, preserve the no-execution safety boundary, and make
feedback/provenance explicit.

See the root [Contributing](../../CONTRIBUTING.md) guide.
