# Distribution Setup Guide

This guide shows how to run the TradeOS public intelligence kit without giving
away paid credentials or creating an abuse path.

The recommended production model is private and self-hosted. TradeOS provides
public or paid intelligence; the Symbol Cockpit, local rules, model key,
portfolio context, feasibility checks, EA/risk checks, execution adapters, and
operations dashboard run in the self-hosted operator's environment.

```text
TradeOS intelligence API -> private cockpit -> local gates -> optional local execution
```

For orientation before setup, see [Repository Layout](repository-layout.md).
For concrete key, URL, Venice, SMTP, and local runtime values, see
[Integration Keys And URLs](integration-keys-and-urls.md).

## Access Modes

| Mode | Credential | Use It For |
| --- | --- | --- |
| Keyless public reads | none | demos, local exploration, public evidence reads |
| App-key attribution | `TRADEOS_PUBLIC_INTEL_KEY` | production apps, agents, feedback provenance |
| App-key management | TradeOS Developer Keys page | create, list, rotate, revoke public-intel app keys |
| App-key automation | `TRADEOS_ACCOUNT_TOKEN` | trusted scripts that manage app keys server-side |
| User-owned watchlists | `TRADEOS_ACCOUNT_TOKEN` | saved lists, state, events, notification targets, feedback |
| Model inference | `VENICE_API_KEY` or compatible provider key | BYOK agent answers |
| Paid TradeOS resources | x402/payment or paid entitlement | premium data, exports, alerts, automation |

Keep `TRADEOS_ACCOUNT_TOKEN`, `TRADEOS_PUBLIC_INTEL_KEY`, and model-provider
keys on the server side. Do not ship them in browser code.

Never send exchange keys, wallet private keys, full portfolio state, or private
strategy memory to TradeOS. If a builder adds execution later, keep those
adapters local and require explicit approvals before live orders.

## 1. Try Public Reads

```bash
npm install
npm run build
npm run cli -- digest --limit 5
npm run cli -- watchlist --limit 5
```

No TradeOS account is required for this path.

Try a public token watchlist snapshot:

```bash
node -e "import('@tradeos/public-intel-sdk').then(async ({ TradeOSPublicIntelClient }) => { const c = new TradeOSPublicIntelClient(); console.log(await c.getTokenWatchlistSnapshot('VVV', { mode: 'trader', chain: '8453' })); })"
```

## 2. Try The Private Symbol Cockpit Pattern

The cockpit pattern is the recommended first consumer workflow:

```text
symbol -> good / bad / ugly -> local recommendation -> feedback
```

Run the reference cockpit app:

```bash
export TRADEOS_PUBLIC_INTEL_KEY=<optional-public-intel-app-key>
npm run symbol-cockpit
```

Open `http://127.0.0.1:18100`.

Run the same flow through the CLI:

```bash
npm run cli -- cockpit VVV --chain 8453 --mode trader
npm run cli -- preflight VVV --action buy --chain 8453
```

Run the scanner worker once:

```bash
COCKPIT_WORKER_RUN_ONCE=true COCKPIT_WATCHLIST=VVV,BTC \
npm --workspace @tradeos/symbol-cockpit run worker
```

Or start the app-level Compose topology:

```bash
cd apps/symbol-cockpit
cp .env.example .env
docker compose up
docker compose --profile risk up
docker compose --profile execution up
```

The implemented package/module split is:

```text
packages/cockpit-core        recommendation schemas and scoring
packages/policy-core         approvals, account gates, kill switch, actionability
packages/tradeos-connectors  TradeOS and Venice/OpenAI-compatible connectors
modules/feasibility          local Tier 1/Tier 2 gate helper
modules/ea-risk              expected-advantage/risk helper
modules/execution-gateway    paper-only local execution gateway
modules/ops-dashboard        local ops snapshot contract
modules/notification-router  stdout/webhook/email recommendation delivery
apps/symbol-cockpit          web/API/worker product runtime
```

For a lower-level SDK-only check, fetch public evidence directly:

```bash
node - <<'JS'
import { TradeOSPublicIntelClient } from "@tradeos/public-intel-sdk";

const client = new TradeOSPublicIntelClient();
const token = process.argv[2] ?? "VVV";
const evidence = await client.getSymbolCockpitEvidence(token, {
  mode: "trader",
  chain: "8453",
});

console.log(JSON.stringify(evidence, null, 2));
JS
```

Keep local portfolio, strategy notes, wallet context, bot rules, execution
keys, and logs out of TradeOS requests unless the user explicitly chooses to
send them. TradeOS receives the symbol/public query and any feedback or
paid/private scope your runtime submits.

Use this as the default control-plane split:

```text
TradeOS evidence
  -> private self-hosted cockpit
  -> local feasibility gate
  -> local EA/risk gate
  -> optional local execution adapter
  -> local operations dashboard and audit log
```

See [Symbol Cockpit And Action Agent](symbol-cockpit-agent.md) for the product
shape, privacy modes, and recommendation examples.

## 3. Ask With Venice AI

Venice is the default OpenAI-compatible provider for the CLI agent. Get a key
from the [Venice AI subscription page](https://venice.ai/pricing).

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

## 4. Try The Market Briefing Bot

The fastest useful app path is the market briefing bot. It works with no
TradeOS account and no LLM key:

```bash
npm run briefing-bot -- brief
```

Use Venice AI for a stronger natural-language brief. Get a key from the
[Venice AI subscription page](https://venice.ai/pricing):

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

## 5. Create An App Key

App-key creation requires a signed-in, email-verified TradeOS account. The
normal path is the TradeOS dashboard. The kit can also call the key issuer for
automation, but you do not need to manually handle an account token for the
first setup.

For the short version of TradeOS app-key setup, optional provider keys, and
scale requests, see
[Getting API Keys And Requesting Scale](getting-api-keys-and-scale.md).

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

Public API quota is intentionally bounded. A verified app key starts with a
7-day starter window, then falls back to baseline unless useful attributed
feedback refreshes the app, TradeOS approves a quota request, or the builder pays
for scale.

```text
Anonymous preview: 2/min, 10/hour, 20/day, 3 symbols/day
Builder baseline: 5/min, 50/hour, 100/day, 10 symbols/day
Builder starter/earned: 10/min, 100/hour, 250/day, 20 symbols/day
Reviewed project: 20/min, 200/hour, 500/day, 40 symbols/day
```

To request reviewed public quota or a paid evaluation:

```text
POST https://api.tradeos.tech/v1/public-intel/quota-requests
```

Or from the CLI:

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

Advanced automation path:

```bash
export TRADEOS_ACCOUNT_TOKEN=...
npm run cli -- keys create --app-name my-public-intel-app
npm run cli -- keys list
npm run cli -- keys revoke --key-id pubkey_...
```

The account token is the signed-in account bearer token and should stay local to
trusted automation. Do not commit it and do not ship it in client-side code.

## 6. Try Account-Owned Watchlists

Saved watchlists require a TradeOS account token. Public snapshots are keyless,
but saved lists, state, events, notification channels, and feedback are
user-owned state.

```bash
export TRADEOS_ACCOUNT_TOKEN=<signed-in account token>
export TRADEOS_PUBLIC_INTEL_KEY=<optional app key for attribution>
```

Minimal JS flow:

```bash
node - <<'JS'
import { TradeOSPublicIntelClient } from "@tradeos/public-intel-sdk";

const client = new TradeOSPublicIntelClient();
const created = await client.createWatchlist({
  name: "Portfolio risk monitor",
  mode: "investor",
});
const watchlistId = String(created.watchlist.watchlist_id);

await client.addWatchlistItem(watchlistId, {
  symbol: "VVV",
  chain: "8453",
});

console.log(JSON.stringify(await client.getWatchlistState(watchlistId), null, 2));

await client.createWatchlistNotificationChannel(watchlistId, {
  channelKind: "in_app",
  target: "tradeos-dashboard",
  minSeverity: "watch",
  digestFrequency: "realtime",
});

console.log(JSON.stringify(await client.triggerWatchlistDeliveries(watchlistId, {
  channelKinds: ["in_app"],
  minSeverity: "watch",
}), null, 2));

console.log(JSON.stringify(await client.listWatchlistDeliveries(watchlistId), null, 2));
JS
```

The first-party GUI uses the same API at:

```text
https://tradeos.tech/watchlists
```

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

## 7. Run The MCP Server

Claude Desktop example:

```json
{
  "mcpServers": {
    "tradeos-public-intel": {
      "command": "npx",
      "args": ["-y", "@tradeos/public-intel-mcp-server"],
      "env": {
        "TRADEOS_API_BASE": "https://api.tradeos.tech/v1/public-intel",
        "TRADEOS_PUBLIC_INTEL_KEY": "<tradeos-public-intel-key>",
        "TRADEOS_ACCOUNT_TOKEN": "<optional-account-token-for-watchlist-tools>"
      }
    }
  }
}
```

The app key is optional for local trials. Use it for production attribution and
support.

## 8. Submit Feedback With Provenance

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

## 9. Handle Guardrail Responses

The public-intel API protects app-key issuance and write paths.

| Status | Meaning | What To Do |
| --- | --- | --- |
| 401 | invalid public-intel app key | remove or rotate `TRADEOS_PUBLIC_INTEL_KEY` |
| 403 | account not verified, app key expired, revoked, or suspended | verify the account or contact TradeOS |
| 409 | active app-key limit reached | revoke an unused key before creating another |
| 429 | key creation or write rate limit reached | respect `Retry-After` and back off |

Default production guardrails include email verification, per-account key caps,
per-account and per-network creation limits, per-key write limits, anonymous IP
write limits, read quota profiles, app reputation, quota review, and
revoked/suspended key rejection.

## 10. Production Checklist

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
