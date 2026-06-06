# Distribution Setup Guide

This guide shows how to run the TradeOS public intelligence kit without giving
away paid credentials or creating an abuse path.

## Access Modes

| Mode | Credential | Use It For |
| --- | --- | --- |
| Keyless public reads | none | demos, local exploration, public evidence reads |
| App-key attribution | `TRADEOS_PUBLIC_INTEL_KEY` | production apps, agents, feedback provenance |
| App-key management | TradeOS Developer Keys page | create, list, rotate, revoke public-intel app keys |
| App-key automation | `TRADEOS_ACCOUNT_TOKEN` | trusted scripts that manage app keys server-side |
| Model inference | `VENICE_API_KEY` or compatible provider key | BYOK agent answers |
| Paid TradeOS resources | x402/payment or paid entitlement | premium data, exports, alerts, automation |

Keep `TRADEOS_ACCOUNT_TOKEN`, `TRADEOS_PUBLIC_INTEL_KEY`, and model-provider
keys on the server side. Do not ship them in browser code.

## 1. Try Public Reads

```bash
npm install
npm run build
npm run cli -- digest --limit 5
npm run cli -- watchlist --limit 5
```

No TradeOS account is required for this path.

## 2. Ask With Venice AI

Venice is the default OpenAI-compatible provider for the CLI agent.

```bash
export VENICE_API_KEY=...
npm run cli -- ask "What changed in crypto market stress?"
```

Override these if you use another OpenAI-compatible provider:

```bash
export LLM_PROVIDER=openai-compatible
export OPENAI_BASE_URL=https://your-provider.example/v1
export OPENAI_API_KEY=...
export TRADEOS_AGENT_MODEL=your-model
```

## 3. Try The Market Briefing Bot

The fastest useful app path is the market briefing bot. It works with no
TradeOS account and no LLM key:

```bash
npm run briefing-bot -- brief
```

Use Venice AI for a stronger natural-language brief:

```bash
export VENICE_API_KEY=...
npm run briefing-bot -- brief
```

Test the publish path locally:

```bash
TRADEOS_BRIEFING_PLATFORM=stdout npm run briefing-bot -- post
```

Post to Discord:

```bash
export TRADEOS_BRIEFING_PLATFORM=discord
export DISCORD_WEBHOOK_URL=...
export VENICE_API_KEY=...
npm run briefing-bot -- post
```

Post to Telegram:

```bash
export TRADEOS_BRIEFING_PLATFORM=telegram
export TELEGRAM_BOT_TOKEN=...
export TELEGRAM_CHAT_ID=...
export VENICE_API_KEY=...
npm run briefing-bot -- post
```

More detail: [Market Briefing Bot](market-briefing-bot.md)

## 4. Create An App Key

App-key creation requires a signed-in, email-verified TradeOS account. The
normal path is the TradeOS dashboard. The kit can also call the key issuer for
automation, but you do not need to manually handle an account token for the
first setup.

Production auth currently lives on the TradeOS app host, while public-intel key
management lives on the TradeOS API host:

```text
Auth/login: https://tradeos.tech/api/alpha
Public intel: https://api.tradeos.tech/v1/public-intel
```

Dashboard path:

```text
1. Sign up or sign in at https://tradeos.tech/signup or https://tradeos.tech/signin.
2. Verify the email from your inbox.
3. Open Developer Keys in the TradeOS dashboard.
4. Create a public-intel app key for your bot, MCP server, agent, or app.
5. Copy the returned secret immediately. It is shown once.
```

Store the one-time secret as:

```bash
export TRADEOS_PUBLIC_INTEL_KEY=<tradeos-public-intel-key>
```

Then validate attribution:

```bash
npm run cli -- auth
```

Existing secrets cannot be retrieved from TradeOS. If you lose a secret, rotate
the key in Developer Keys and update your server environment.

Advanced automation path:

```bash
export TRADEOS_ACCOUNT_TOKEN=...
npm run cli -- keys create --app-name my-public-intel-app
npm run cli -- keys list
npm run cli -- keys revoke --key-id pubkey_...
```

The account token is the signed-in account bearer token and should stay local to
trusted automation. Do not commit it and do not ship it in client-side code.

Direct API login remains available for scripts that own the full auth flow:

```bash
export TRADEOS_EMAIL=your-email@example.com
read -s TRADEOS_PASSWORD

curl -sS https://tradeos.tech/api/alpha/signup \
  -H "content-type: application/json" \
  -d "{\"email\":\"$TRADEOS_EMAIL\",\"password\":\"$TRADEOS_PASSWORD\"}"
```

Open the verification link sent to the email address. Then log in and capture
the account token:

```bash
export TRADEOS_ACCOUNT_TOKEN="$(
  curl -sS https://tradeos.tech/api/alpha/login \
    -H "content-type: application/json" \
    -d "{\"email\":\"$TRADEOS_EMAIL\",\"password\":\"$TRADEOS_PASSWORD\"}" \
  | jq -r .access_token
)"
```

## 5. Run The MCP Server

Claude Desktop example:

```json
{
  "mcpServers": {
    "tradeos-public-intel": {
      "command": "npx",
      "args": ["-y", "@tradeos/public-intel-mcp-server"],
      "env": {
        "TRADEOS_API_BASE": "https://api.tradeos.tech/v1/public-intel",
        "TRADEOS_PUBLIC_INTEL_KEY": "<tradeos-public-intel-key>"
      }
    }
  }
}
```

The app key is optional for local trials. Use it for production attribution and
support.

## 6. Submit Feedback With Provenance

Human feedback:

```bash
npm run cli -- feedback \
  --target-id digest_123 \
  --target-type digest \
  --label useful \
  --feedback-source human \
  --anonymous-session-id user_or_session_123
```

Agent feedback:

```bash
npm run cli -- feedback \
  --target-id digest_123 \
  --label evidence_too_thin \
  --feedback-source agent \
  --automation-level autonomous \
  --agent-id market-review-agent \
  --agent-run-id run_001 \
  --agent-model z-ai-glm-5-turbo
```

TradeOS decides credit class server-side. Agent and automation feedback can help
app reputation and quality analytics, but it does not become personal user
credit by default.

## 7. Handle Guardrail Responses

The public-intel API protects app-key issuance and write paths.

| Status | Meaning | What To Do |
| --- | --- | --- |
| 401 | invalid public-intel app key | remove or rotate `TRADEOS_PUBLIC_INTEL_KEY` |
| 403 | account not verified, app key expired, revoked, or suspended | verify the account or contact TradeOS |
| 409 | active app-key limit reached | revoke an unused key before creating another |
| 429 | key creation or write rate limit reached | respect `Retry-After` and back off |

Default production guardrails include email verification, per-account key caps,
per-account and per-network creation limits, per-key write limits, anonymous IP
write limits, and revoked/suspended key rejection.

## 8. Production Checklist

For builders:

```text
Keep TradeOS and model-provider secrets server-side.
Use app keys for production attribution.
Set clear app names so support can identify the integration.
Send feedback_source and automation_level honestly.
Respect Retry-After on 429 responses.
Do not retry invalid, revoked, suspended, or expired keys in a loop.
```

For TradeOS operators:

```text
Keep email verification required for key creation.
Protect write/control routes with service-level controls at the API gateway.
Set a stable PUBLIC_INTEL_ABUSE_IP_HASH_SALT.
Move MVP file-backed counters to Redis/database before broad public launch.
Monitor 401/403/409/429 rates by account, app key, and client network.
Suspend keys that create abusive feedback loops.
```

## Related Docs

- [API Keys And Feedback Provenance](api-keys-and-feedback-provenance.md)
- [Access And Payments](access-and-payments.md)
- [Safety Boundaries](safety-boundaries.md)
- [Builder Revenue Playbook](builder-revenue-playbook.md)
