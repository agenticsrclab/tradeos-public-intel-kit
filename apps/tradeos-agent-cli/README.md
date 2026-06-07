# @tradeos/public-intel-agent-cli

Bring-your-own-key CLI for asking questions over the TradeOS public
Data Intelligence layer.

```bash
npm install -g @tradeos/public-intel-agent-cli
```

```bash
tradeos-intel digest --limit 5
```

Check whether a public-intel key is configured and accepted by TradeOS:

```bash
tradeos-intel auth
```

The CLI can use `TRADEOS_PUBLIC_INTEL_KEY` for attribution when TradeOS has
issued one for a signed-in builder account. Create the key from the TradeOS
Developer Keys dashboard, copy the one-time secret, and store it server-side.

For trusted automation, the CLI can also manage keys with
`TRADEOS_ACCOUNT_TOKEN`; it does not include TradeOS login/device auth yet.

Get `TRADEOS_ACCOUNT_TOKEN` by signing in through TradeOS production auth after
email verification:

```bash
export TRADEOS_EMAIL=your-email@example.com
read -s TRADEOS_PASSWORD
export TRADEOS_ACCOUNT_TOKEN="$(
  curl -sS https://tradeos.tech/api/alpha/login \
    -H "content-type: application/json" \
    -d "{\"email\":\"$TRADEOS_EMAIL\",\"password\":\"$TRADEOS_PASSWORD\"}" \
  | jq -r .access_token
)"
```

```bash
tradeos-intel keys create --app-name my-public-intel-app
tradeos-intel keys list
tradeos-intel keys revoke --key-id pubkey_...
```

Request reviewed public quota when a real product needs more before it is ready
for paid scale:

```bash
tradeos-intel quota request \
  --project-name community-market-bot \
  --app-key-id pubkey_... \
  --use-case "Discord bot with source-backed token summaries and feedback buttons." \
  --reads 1500 \
  --symbols 80 \
  --feedback-plan "Members can mark useful, stale, late, wrong, or missing context." \
  --paid-intent "Will use x402 for alerts and higher scale."
```

Ask with the default Venice AI provider. Get a key from the
[Venice AI subscription page](https://venice.ai/pricing):

```bash
VENICE_API_KEY=your_venice_key \
tradeos-intel ask "What changed in crypto market stress?"
```

Override `OPENAI_BASE_URL`, `OPENAI_API_KEY`, and `TRADEOS_AGENT_MODEL` to use
another OpenAI-compatible provider.

Submit feedback:

```bash
tradeos-intel feedback \
  --target-id digest_123 \
  --target-type digest \
  --label useful \
  --feedback-source human \
  --note "Useful and easy to inspect"
```

Submit agentic feedback:

```bash
tradeos-intel feedback \
  --target-id digest_123 \
  --label evidence_too_thin \
  --feedback-source agent \
  --automation-level autonomous \
  --agent-id market-review-agent \
  --agent-run-id run_001
```

Access model:

```text
Free public kit: bounded reads and feedback writes
Builder app quota: 7-day starter, useful feedback refresh, or reviewed quota request
Starter ask products: 3 anonymous questions or 20 signed-in questions for 7 days
Data Intel Credits: dashboard-only depth, 30-day unlock by default
Paid TradeOS/x402: automation, exports, alerts, premium data, validation APIs
```

Learn more:

```text
Homepage: https://tradeos.tech
Public docs: https://tradeos.tech/llms.txt
x402 discovery: https://tradeos.tech/.well-known/x402.json
```
