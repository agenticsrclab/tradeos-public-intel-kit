# Market Briefing Bot

The first concrete bot in this distribution is a TradeOS market briefing bot for
Discord, Telegram, and cron/stdout workflows.

It is intentionally narrow: communities already want short market context, bot
builders already need source-backed explanations, and TradeOS gets an
attributed feedback loop without paying for every builder's inference.

## Why This Bot First

| Reason | Impact |
| --- | --- |
| Works in existing platforms | Discord and Telegram can use it immediately |
| Easy to monetize | community bot, paid channel, analyst brief, DAO monitor |
| Evidence-backed | uses TradeOS public digest and thesis watchlist surfaces |
| BYOK inference | [Venice AI](https://venice.ai/pricing) default; builders pay their own model provider |
| Feedback loop | can submit publication/provenance events back to TradeOS |
| Safe boundary | no exchange keys, no TradeOS-hosted execution, no private data |

## Run Locally

Prerequisites:

```text
Node.js 20 or newer
npm
optional Venice AI key for LLM summaries
optional Discord webhook or Telegram bot token for posting
```

```bash
npm install
npm run build
npm run briefing-bot -- brief
```

Without an LLM key, the bot renders a deterministic source-backed template.

With Venice AI. Get a key from the
[Venice AI subscription page](https://venice.ai/pricing):

```bash
export VENICE_API_KEY=...
npm run briefing-bot -- brief
```

Test the publish path without external platform credentials:

```bash
TRADEOS_BRIEFING_PLATFORM=stdout npm run briefing-bot -- post
```

Show all commands and environment variables:

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

## Attribution

Public reads work without a key. Production apps should configure:

```bash
export TRADEOS_PUBLIC_INTEL_KEY=<tradeos-public-intel-key>
```

Without an app key, TradeOS can still accept automation feedback as shadow
telemetry, but it is telemetry-only: no user credit, no app credit, and no paid
access unlock.

To submit a publication feedback/provenance event:

```bash
export TRADEOS_BRIEFING_SUBMIT_FEEDBACK=true
npm run briefing-bot -- post
```

The bot reports:

```text
feedback_source=automation
automation_level=automated
agent_id=tradeos-market-briefing-bot
```

TradeOS decides credit class server-side. This event is app-quality and
distribution telemetry, not personal user credit.

## Safe Customization

Good forks:

```text
Daily Discord briefing
Telegram market channel bot
DAO treasury monitor
Paid community digest worker
Creator newsletter draft worker
Quant research desk morning brief
```

Avoid:

```text
TradeOS-hosted trade execution
exchange-key collection
personalized financial advice
private TradeOS data exposure
browser-side secrets
high-frequency spam posting
```

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
TRADEOS_AGENT_MODEL=z-ai-glm-5-turbo
```

## Cron Example

```bash
0 13 * * * cd /srv/tradeos-public-intel-kit && npm run briefing-bot -- post
```

Use platform-level controls to avoid spam. Respect API `Retry-After` responses.

## Contribution Ideas

This bot is intentionally small so developers can fork it into other useful
distribution products:

```text
Slack briefing bot
Discord slash-command digest bot
Telegram watchlist alert bot
creator newsletter draft worker
DAO treasury monitor
quant desk morning brief
human review queue for feedback labels
```

If a fork is generally useful, contribute it back under `apps/`, `examples/`, or
`docs/`. See the root [Contributing](../CONTRIBUTING.md) guide.
