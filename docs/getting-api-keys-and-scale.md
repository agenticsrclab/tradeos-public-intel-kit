# Getting API Keys And Requesting Scale

Use this page when a builder asks how to get a TradeOS key, where to put it,
what other keys are optional, and how to request more public quota or paid
production access.

Public reads work without a key. Add keys only when the product needs
attribution, saved account-owned state, BYOK inference, notifications, reviewed
quota, or paid machine access.

## Do You Need A Key?

| Need | Key Or Account | Required? | Use It For |
| --- | --- | --- | --- |
| Try public intelligence | none | No | Bounded public reads and public examples. |
| Attribute a builder app | `TRADEOS_PUBLIC_INTEL_KEY` | Optional | App identity, abuse controls, support, feedback provenance, and potential higher public limits. |
| Manage app keys by script | `TRADEOS_ACCOUNT_TOKEN` | Optional | Trusted server-side create/list/rotate/revoke automation. |
| Saved watchlists | `TRADEOS_ACCOUNT_TOKEN` | Yes | Account-owned watchlists, events, notification channels, delivery audit, and watchlist feedback. |
| Action-agent summaries | `VENICE_API_KEY` or `OPENAI_API_KEY` | Optional | Bring-your-own-key model inference over TradeOS evidence. |
| Email alerts | `SMTP_*` or `COCKPIT_SMTP_*` | Optional | Local Symbol Cockpit operator alerts. |
| Discord or Telegram posts | webhook or bot token | Optional | Market briefing bot distribution. |
| Production scale or premium data | x402 payment, paid API key, or contract entitlement | When needed | Scale, alerts, automation, exports, premium data, private intelligence products, validation APIs, and explicit data rights. |

Never put TradeOS account tokens, paid keys, model-provider keys, SMTP
credentials, exchange keys, or wallet keys in browser code or committed files.

## Get A TradeOS Public Intel App Key

Use the dashboard flow for first setup:

1. Sign up or sign in at `https://tradeos.tech`.
2. Verify your email address.
3. Open Developer Keys: `https://tradeos.tech/developer/api-keys`.
4. Create a public-intel app key for the app, bot, MCP server, or agent.
5. Copy the returned secret immediately. It is shown once.
6. Store it in a server-side environment, local `.env`, deployment secret
   manager, or CI secret store.

Configure it as:

```bash
export TRADEOS_API_BASE=https://api.tradeos.tech/v1/public-intel
export TRADEOS_PUBLIC_INTEL_KEY=<tradeos-public-intel-app-key>
```

The app key identifies the builder app. It is not a paid API entitlement, not a
user's paid access, and not a tokenized asset.

## Validate The Key

From this GitHub repo:

```bash
npm install
npm run cli -- auth
```

Or from the global CLI package:

```bash
tradeos-intel auth
```

Direct API validation:

```bash
curl -sS https://api.tradeos.tech/v1/public-intel/app-attribution \
  -H "authorization: Bearer $TRADEOS_PUBLIC_INTEL_KEY"
```

An invalid key should return a JSON response with `valid: false`; rotate or
remove invalid keys before production use.

## Use A TradeOS Account Token Only For Trusted Automation

`TRADEOS_ACCOUNT_TOKEN` is the signed-in account bearer token returned by
TradeOS production auth. It is useful for trusted backend scripts that manage
app keys or account-owned watchlists.

It is not required for keyless public reads, and it should not be copied into
client-side code.

After email verification, trusted scripts can set:

```bash
export TRADEOS_ACCOUNT_TOKEN=<signed-in-account-token>
```

Then use the CLI:

```bash
npm run cli -- keys create --app-name my-public-intel-app
npm run cli -- keys list
npm run cli -- keys revoke --key-id pubkey_...
```

Existing app-key secrets cannot be retrieved. If a secret is lost or exposed,
rotate it in Developer Keys and update the server environment.

## Add A Model Provider Key

The CLI, market briefing bot, and Symbol Cockpit action agent can use a
bring-your-own-key model provider. Venice is the default OpenAI-compatible
provider used in examples.

```bash
export LLM_PROVIDER=venice
export OPENAI_BASE_URL=https://api.venice.ai/api/v1
export VENICE_API_KEY=<venice-api-key>
export TRADEOS_AGENT_MODEL=z-ai-glm-5-turbo
```

For another OpenAI-compatible provider:

```bash
export LLM_PROVIDER=openai-compatible
export OPENAI_BASE_URL=https://your-provider.example/v1
export OPENAI_API_KEY=<provider-api-key>
export TRADEOS_AGENT_MODEL=<provider-model>
```

Model-provider keys belong on the server side. Browser UIs should call a local
or backend API, not the model provider directly.

## Add Notification Keys

For the market briefing bot:

```bash
export DISCORD_WEBHOOK_URL=<discord-webhook-url>
export TELEGRAM_BOT_TOKEN=<telegram-bot-token>
export TELEGRAM_CHAT_ID=<telegram-chat-id>
```

For Symbol Cockpit email alerts:

```bash
export COCKPIT_ALERT_EMAIL_ENABLED=true
export COCKPIT_ALERT_EMAIL_TO=<operator-email>
export SMTP_HOST=<smtp-host>
export SMTP_PORT=587
export SMTP_USER=<smtp-user>
export SMTP_PASSWORD=<smtp-password-or-app-password>
export SMTP_FROM=<from-address>
export SMTP_STARTTLS=true
```

## Request More Public Quota

Public API quota is intentionally bounded. A verified app key starts with a
starter window, then falls back to baseline unless useful app-attributed
feedback refreshes the app, TradeOS approves a quota request, or the builder
pays for scale.

Request reviewed quota or a paid evaluation when a real project needs more than
starter/baseline usage:

```bash
npm run cli -- quota request \
  --project-name community-market-bot \
  --app-key-id pubkey_... \
  --use-case "Discord bot with source-backed token summaries and feedback buttons." \
  --reads 1500 \
  --symbols 80 \
  --feedback-plan "Members can mark useful, stale, late, wrong, or missing context." \
  --paid-intent "Will use x402 for alerts and higher scale."
```

Direct API shape:

```bash
curl -X POST "https://api.tradeos.tech/v1/public-intel/quota-requests" \
  -H "authorization: Bearer $TRADEOS_ACCOUNT_TOKEN" \
  -H "content-type: application/json" \
  -d '{
    "project_name": "community-market-bot",
    "app_key_id": "pubkey_...",
    "requested_tier": "reviewed_project",
    "use_case": "Discord bot with source-backed token summaries and feedback buttons.",
    "expected_daily_reads": 1500,
    "expected_symbols_per_day": 80,
    "monetization_model": "paid community bot seats",
    "feedback_plan": "Members can mark useful, stale, late, wrong, or missing-context answers.",
    "paid_intent": "will use x402 for alerting and higher scale"
  }'
```

Approval is manual. TradeOS can approve reviewed-project quota, keep the app at
baseline, limit or suspend abusive usage, or move the builder to paid/x402
access for production scale.

## Use Paid Or x402 Access For Production Features

Do not stretch public quota into a bulk feed. Move to paid TradeOS, x402, or
enterprise access when a product needs:

- high-volume machine reads;
- alert delivery;
- automation-safe reads;
- premium market pulse or private intelligence products;
- replay, history, validation APIs, or exports;
- explicit data rights;
- enterprise support or custom universe coverage.

Public x402 discovery surfaces:

```text
https://tradeos.tech/.well-known/x402.json
https://tradeos.tech/x402/v1/listings
```

## Where This Fits In The GitHub Repo

Public repo:

```text
https://github.com/agenticsrclab/tradeos-public-intel-kit
```

Useful follow-up docs:

- [Integration Keys And URLs](integration-keys-and-urls.md) for every runtime
  env var and local service URL.
- [API Keys And Feedback Provenance](api-keys-and-feedback-provenance.md) for
  app-key endpoints, quota profiles, abuse controls, and feedback classes.
- [Access And Payments](access-and-payments.md) for DTI credits, public quota,
  x402, and paid boundaries.
- [Distribution Setup Guide](distribution-setup-guide.md) for a full local
  setup path across CLI, MCP, bot, and Symbol Cockpit.
- [Flagship Symbol Cockpit](flagship-symbol-cockpit.md) for the consumer-facing
  app walkthrough and launch path.
