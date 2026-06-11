# Integration Keys And URLs

This page is the operator checklist for keys, URLs, SMTP, and runtime
environment variables. Keep secrets server-side. Do not commit `.env` files or
ship keys in browser bundles.

For the shortest dashboard and CLI path to app keys, optional provider keys,
and reviewed quota or paid scale requests, start with
[Getting API Keys And Requesting Scale](getting-api-keys-and-scale.md).

## Quick Matrix

| Need | Where To Get It | Env Var | Required For |
| --- | --- | --- | --- |
| TradeOS public API base URL | Built into this kit | `TRADEOS_API_BASE` | SDK, CLI, MCP, cockpit, bots |
| TradeOS public-intel app key | TradeOS Developer Keys page | `TRADEOS_PUBLIC_INTEL_KEY` | App attribution, support, feedback provenance |
| TradeOS account token | TradeOS signed-in account session or trusted backend flow | `TRADEOS_ACCOUNT_TOKEN` | Saved watchlists and app-key management automation |
| Venice API key | Venice account/API settings | `VENICE_API_KEY` | Recommended privacy-aligned BYOK action-agent and model-backed briefings |
| OpenAI-compatible model URL | Provider docs | `OPENAI_BASE_URL` | Non-default model provider routing |
| SMTP credentials | Your mail provider or workspace admin | `SMTP_*` or `COCKPIT_SMTP_*` | Email alerts from local notification router |
| Discord webhook | Discord channel integration settings | `DISCORD_WEBHOOK_URL` | Market briefing bot posts |
| Telegram bot token/chat | BotFather and target chat | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Market briefing bot posts |
| Cockpit scanner universe | TradeOS coverage docs | `COCKPIT_WATCHLIST` | Local Symbol Cockpit scanner scope |

## TradeOS Public Intel

Default API base:

```bash
TRADEOS_API_BASE=https://api.tradeos.tech/v1/public-intel
```

Health check:

```bash
curl https://api.tradeos.tech/v1/public-intel/sources/health
```

Public reads work without a key. Use a `TRADEOS_PUBLIC_INTEL_KEY` when TradeOS
has issued one for your app and you want app attribution, supportability,
feedback provenance, and potential higher public limits.

Recommended TradeOS links:

| Surface | URL |
| --- | --- |
| TradeOS app | `https://tradeos.tech` |
| Live market intelligence | [Platform Pulse](https://tradeos.tech/market) |
| Watchlist Intelligence | `https://tradeos.tech/watchlists` |
| Ask TradeOS | `https://tradeos.tech/ask` |
| Developer Keys | `https://tradeos.tech/developer/api-keys` |
| Public API health | `https://api.tradeos.tech/v1/public-intel/sources/health` |

Server-side setup:

```bash
export TRADEOS_API_BASE=https://api.tradeos.tech/v1/public-intel
export TRADEOS_PUBLIC_INTEL_KEY=<tradeos-public-intel-app-key>
```

Use `TRADEOS_ACCOUNT_TOKEN` only in trusted server-side scripts that manage app
keys, saved watchlists, or account-owned resources. It is not needed for basic
public reads.

## Venice API Key

Venice is the recommended default OpenAI-compatible model provider used by the
CLI, market briefing bot, and Symbol Cockpit action agent. The examples default
to `e2ee-glm-5-1` so builders get a privacy-enhanced E2EE/TEE-backed upstream
model path while keeping the model key in their own environment.

Typical setup:

```bash
export LLM_PROVIDER=venice
export OPENAI_BASE_URL=https://api.venice.ai/api/v1
export VENICE_API_KEY=<venice-api-key>
export TRADEOS_AGENT_MODEL=e2ee-glm-5-1
```

Where to get the key:

1. Create or sign in to a Venice account.
2. Open the Venice API or account settings area.
3. Create an API key.
4. Store it only in your local shell, server secret manager, CI secret store, or
   deployment environment.

Useful Venice links:

| Surface | URL |
| --- | --- |
| Venice pricing and account entry | `https://venice.ai/pricing` |
| Venice API docs | `https://docs.venice.ai` |
| Venice privacy architecture | `https://docs.venice.ai/welcome/privacy` |
| Venice privacy modes | `https://venice.ai/privacy` |
| Venice OpenAI-compatible API base used by this kit | `https://api.venice.ai/api/v1` |

If you use another OpenAI-compatible provider:

```bash
export LLM_PROVIDER=openai-compatible
export OPENAI_BASE_URL=https://your-provider.example/v1
export OPENAI_API_KEY=<provider-api-key>
export TRADEOS_AGENT_MODEL=<provider-model>
```

Keep model-provider keys on the server side. The browser UI should call the
local cockpit API, not Venice or another model provider directly.

## SMTP Email Alerts

SMTP is used by `modules/notification-router` and the Symbol Cockpit to send
operator review alerts. The cockpit email channel is disabled by default.

Recommended cockpit setup:

```bash
export COCKPIT_ALERT_EMAIL_ENABLED=true
export COCKPIT_ALERT_EMAIL_TO=operator@example.com
export COCKPIT_ALERT_EMAIL_MIN_SEVERITY=warning
export COCKPIT_FEEDBACK_BASE_URL=https://tradeos.tech/feedback
export SMTP_HOST=<smtp-host>
export SMTP_PORT=587
export SMTP_USER=<smtp-user>
export SMTP_PASSWORD=<smtp-password-or-app-password>
export SMTP_FROM=<from-address>
export SMTP_STARTTLS=true
```

The cockpit-specific names override the shared names:

| Shared Env | Cockpit Override | Meaning |
| --- | --- | --- |
| `SMTP_HOST` | `COCKPIT_SMTP_HOST` | SMTP server host. |
| `SMTP_PORT` | `COCKPIT_SMTP_PORT` | SMTP server port. |
| `SMTP_USER` | `COCKPIT_SMTP_USER` | SMTP login user. |
| `SMTP_PASSWORD` | `COCKPIT_SMTP_PASSWORD` | SMTP password or app password. |
| `SMTP_FROM` | `COCKPIT_SMTP_FROM` | Sender address. |
| `SMTP_SECURE` | `COCKPIT_SMTP_SECURE` | Use implicit TLS, usually port `465`. |
| `SMTP_STARTTLS` | `COCKPIT_SMTP_STARTTLS` | Use STARTTLS, usually port `587`. |
| `SMTP_TIMEOUT_MS` | `COCKPIT_SMTP_TIMEOUT_MS` | SMTP timeout in milliseconds. |

Email feedback buttons use `COCKPIT_FEEDBACK_BASE_URL` and append query
parameters such as `target_type`, `target_id`, `card_id`, `symbol`, `verdict`,
`source`, and `label`. The default hosted target is the TradeOS feedback page at
`https://tradeos.tech/feedback`, which records the click-through as normalized
TradeOS intelligence feedback. Builders can point this at their own hosted page
or, for a private self-hosted run, set `COCKPIT_PUBLIC_BASE_URL` to the cockpit
origin and use `<origin>/feedback`, which submits through the cockpit
server-side `/api/feedback` route. The email click opens a form; it should not
directly place orders or mutate execution state.

Provider examples:

| Provider Type | Common Settings |
| --- | --- |
| User SMTP | `SMTP_HOST=smtp.mail.example`, `SMTP_PORT=587`, `SMTP_STARTTLS=true`, app password when required. |
| Google Workspace SMTP relay | Workspace admins can configure SMTP relay. Use the relay host, port, and auth policy assigned by the workspace. |
| SendGrid/Mailgun/Postmark/SES | Use the provider SMTP host, port, username, and token/password from that provider's dashboard. |
| Local development sink | Use Mailpit, MailHog, or another local SMTP sink and point `SMTP_HOST`/`SMTP_PORT` at it. |

Useful SMTP references:

| Surface | URL |
| --- | --- |
| Google mail client SMTP settings | `https://support.google.com/mail/answer/7104828` |
| Google Workspace SMTP relay | `https://support.google.com/a/answer/176600` |
| Nodemailer SMTP transport | `https://nodemailer.com/smtp` |

Use a dedicated sender identity for production. Do not use a personal mailbox
password directly when the provider supports app passwords, SMTP tokens, or a
service account.

## Local Runtime URLs

| Service | Default URL | Notes |
| --- | --- | --- |
| Symbol Cockpit API and web UI | `http://127.0.0.1:18100` | `COCKPIT_API_PORT` changes the port. |
| Symbol Cockpit static web server | `http://127.0.0.1:18101` | Used only when running the separate web server. |
| MCP server | stdio | Started by the agent host or `npm run mcp`. |
| Market briefing bot | no HTTP server | Posts to stdout, Discord, or Telegram. |

The cockpit API serves both `/healthz`, `/api/*`, and the web UI by default.

Health check:

```bash
curl http://127.0.0.1:18100/healthz
```

## Cockpit Symbol Coverage

The current full trading-intelligence cockpit universe is 21 symbols:

```text
BTC, ETH, SOL, ADA, DOGE, XRP, DOT, POL, LINK, UNI, VVV, KTA,
AVAX, NEAR, ARB, OP, SUI, APT, INJ, TIA, FET
```

Use the full list for a production-like scanner run:

```bash
export COCKPIT_WATCHLIST=BTC,ETH,SOL,ADA,DOGE,XRP,DOT,POL,LINK,UNI,VVV,KTA,AVAX,NEAR,ARB,OP,SUI,APT,INJ,TIA,FET
```

Use a smaller value such as `VVV,BTC,ETH,SOL` for local demos or low-volume
smoke tests. Symbols outside the 21-symbol core can still produce discovery,
risk, thesis, or watchlist evidence, but they should be labeled as partial
coverage unless TradeOS expands the full trading-intelligence universe. See
[Symbol Intelligence Coverage](symbol-intelligence-coverage.md).

## Copy-Paste Local Cockpit Env

Use this for a local review run:

```bash
export TRADEOS_API_BASE=https://api.tradeos.tech/v1/public-intel
export TRADEOS_PUBLIC_INTEL_KEY=<tradeos-public-intel-app-key>

export LLM_PROVIDER=venice
export OPENAI_BASE_URL=https://api.venice.ai/api/v1
export VENICE_API_KEY=<venice-api-key>
export TRADEOS_AGENT_MODEL=e2ee-glm-5-1

export COCKPIT_BIND_HOST=127.0.0.1
export COCKPIT_API_PORT=18100
export COCKPIT_DEFAULT_CHAIN=8453
export COCKPIT_DEFAULT_MODE=trader
export COCKPIT_WATCHLIST=VVV,BTC,ETH,SOL

export COCKPIT_ALERT_EMAIL_ENABLED=true
export COCKPIT_ALERT_EMAIL_TO=operator@example.com
export COCKPIT_ALERT_EMAIL_MIN_SEVERITY=warning
export COCKPIT_FEEDBACK_BASE_URL=https://tradeos.tech/feedback
export SMTP_HOST=<smtp-host>
export SMTP_PORT=587
export SMTP_USER=<smtp-user>
export SMTP_PASSWORD=<smtp-password-or-app-password>
export SMTP_FROM=<from-address>
export SMTP_STARTTLS=true
```

Start the cockpit:

```bash
npm run symbol-cockpit
```

Run headless integration tests:

```bash
npm run symbol-cockpit:e2e
```

Run live e2e against a running cockpit:

```bash
npm --workspace @tradeos/symbol-cockpit run e2e:live
```

Require live email delivery during e2e:

```bash
COCKPIT_E2E_REQUIRE_EMAIL=true npm --workspace @tradeos/symbol-cockpit run e2e:live
```

## Secret Handling Rules

- Put keys in `.env`, shell exports, a deployment secret store, or CI secrets.
- Never commit `.env` files with real values.
- Never expose `TRADEOS_ACCOUNT_TOKEN`, `TRADEOS_PUBLIC_INTEL_KEY`,
  `VENICE_API_KEY`, `OPENAI_API_KEY`, SMTP passwords, exchange keys, or wallet
  keys in browser code.
- Treat `TRADEOS_PUBLIC_INTEL_KEY` as server-side app identity, even when public
  reads can work without it.
- Use the local cockpit API as the browser boundary.
- Rotate keys immediately if they are printed in logs, committed, posted in a
  ticket, or sent to a model provider by mistake.
