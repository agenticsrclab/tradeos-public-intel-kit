# Virtuals ACP Field Guide

This is a sanitized field guide for publishing a TradeOS-backed intelligence
service through Virtuals ACP. It is based on the TradeOS ACP setup reviewed on
June 7, 2026 and removes live wallets, agent IDs, API keys, builder codes,
webhook secrets, and private host details.

The official ACP docs and SDK examples have changed over time. Treat this as a
working checklist for builders who need the operational path that docs often
leave implicit.

Official docs to re-check before launch:

```text
https://whitepaper.virtuals.io/get-started-with-acp
https://whitepaper.virtuals.io/get-started-with-acp/acp-tech-playbook
```

## Product Fit

Use Virtuals ACP when the buyer is another agent and the work looks like a job:

```text
buyer agent -> hires provider offering -> funds job -> receives JSON deliverable
```

Good TradeOS-backed ACP offerings:

- `communityTokenSafetyRadar`: free or low-cost token safety pattern sample;
- `orderFlowStressCheck`: VPIN or flow-stress read;
- `symbolRiskDossier`: token or symbol risk dossier;
- `marketPulsePacket`: market regime and risk-state packet;
- `watchlistIntelligenceBrief`: short watchlist review;
- `datasetScopePacket`: dataset or validation-pack scoping.

ACP is not the right place to expose custody, wallet signing, exchange
execution, copy trading, or personalized position sizing.

## Reference Topology

The field-tested topology separates payment/job lifecycle from intelligence:

```text
Virtuals ACP Marketplace
        |
        | ACP v2 job events
        v
provider bridge on host
        |
        | HMAC signed webhook
        v
virtuals-acp-adapter
        |
        | internal HTTP
        v
crypto-intelligence-agent
        |
        v
read-only JSON deliverable
        |
        v
provider bridge submits deliverable to ACP
```

The x402 gateway can run beside this stack, but ACP-funded jobs should call the
internal intelligence runtime directly. Do not route ACP-funded jobs through the
paid x402 endpoint or the buyer can hit two payment boundaries for one job.

## Local Services

Use three local services:

| Service | Default Local URL | Purpose |
| --- | --- | --- |
| `crypto-intelligence-agent` | `http://127.0.0.1:18091` | Core read-only intelligence runtime. |
| `x402-intelligence-gateway` | `http://127.0.0.1:18092` | Direct pay-per-call HTTP path; not used for ACP-funded fulfillment. |
| `virtuals-acp-adapter` | `http://127.0.0.1:18093` | ACP catalog, sync, webhook, job state, deliverable builder. |

Start the local services from the repo that owns the runtime:

```bash
docker compose -f tradeos-antseed-agent/compose.yaml up -d \
  crypto-intelligence-agent \
  x402-intelligence-gateway \
  virtuals-acp-adapter
```

Health checks:

```bash
curl -fsS http://127.0.0.1:18091/health
curl -fsS http://127.0.0.1:18092/x402/v1/health
curl -fsS http://127.0.0.1:18093/health
curl -fsS http://127.0.0.1:18093/ready | python -m json.tool
```

`/ready` can show `enabled=false` when remote catalog sync is disabled. That
does not block local webhook fulfillment.

## Environment Shape

Keep ACP settings separate from x402/CDP settings:

```text
.env.agent.local      core agent, AntSeed, x402/CDP settings
.env.virtuals.local   Virtuals ACP adapter and provider bridge settings
```

Public-safe redacted example values:

```text
TRADEOS_VIRTUALS_ACP_ENABLED=true
TRADEOS_VIRTUALS_ACP_PUBLIC_BASE_URL=https://your-domain.example
TRADEOS_VIRTUALS_ACP_X402_BASE_URL=https://your-domain.example
TRADEOS_VIRTUALS_ACP_AGENT_BASE_URL=http://crypto-intelligence-agent:18091
TRADEOS_VIRTUALS_ACP_AGENT_SHARED_SECRET=<same internal agent secret>
TRADEOS_VIRTUALS_ACP_WEBHOOK_SECRET=<shared adapter and bridge secret>
TRADEOS_VIRTUALS_ACP_API_BASE_URL=<Virtuals ACP API base URL>
TRADEOS_VIRTUALS_ACP_API_KEY=<Virtuals ACP API key>
TRADEOS_VIRTUALS_ACP_BUILDER_CODE=<builder code if required>
TRADEOS_VIRTUALS_ACP_AGENT_ID=<provider agent UUID>
TRADEOS_VIRTUALS_ACP_AGENT_WALLET=<provider agent wallet>
TRADEOS_VIRTUALS_ACP_WALLET_ID=<provider Privy wallet id>
TRADEOS_VIRTUALS_ACP_CHAIN_IDS=8453
TRADEOS_VIRTUALS_ACP_SUBMIT_DELIVERABLES=false
TRADEOS_VIRTUALS_ACP_FUND_TRANSFER_USDC_DEFAULT=0
TRADEOS_VIRTUALS_ACP_SUBMIT_TRANSFER_USDC_DEFAULT=0
```

Do not commit `.env.virtuals.local`.

## Provider Bridge

The adapter is HTTP-only. The provider bridge is the ACP seller runtime that
listens for jobs and submits deliverables.

On macOS, run the provider bridge on the host when using the ACP CLI signer. The
signer created by `acp agent add-signer` lives in the host keychain and is not
available inside a normal Docker container.

Install and configure the ACP CLI:

```bash
cd tradeos-antseed-agent/services/virtuals-acp-provider-bridge
npm ci
npx @virtuals-protocol/acp-cli configure start
npx @virtuals-protocol/acp-cli configure complete
npx @virtuals-protocol/acp-cli agent use --agent-id <provider-agent-uuid>
npx @virtuals-protocol/acp-cli agent add-signer --agent-id <provider-agent-uuid>
```

Run the bridge in the foreground:

```bash
TRADEOS_VIRTUALS_ACP_ENV_FILE=../../.env.virtuals.local npm start
```

Expected log:

```text
ACP v2 provider bridge connected; waiting for jobs
```

For a background host process, use your process supervisor of choice and write
logs to a file. Keep the env file path private.

## Catalog And Offering Sync

Generate a public-safe manifest before syncing:

```bash
./scripts/virtuals-acp-export-manifest.py --fail-on-warnings
```

Check activation without printing secrets:

```bash
./scripts/virtuals-acp-activation-check.py \
  --env-file .env.virtuals.local \
  --adapter-url http://127.0.0.1:18093
```

Dry-run catalog sync:

```bash
curl -fsS http://127.0.0.1:18093/virtuals/v1/sync/dry-run \
  -H "X-API-Key: ${TRADEOS_VIRTUALS_ACP_API_KEY}" \
  | python -m json.tool
```

Apply only after reviewing create/update/deprecate diffs:

```bash
curl -fsS -X POST http://127.0.0.1:18093/virtuals/v1/sync \
  -H "X-API-Key: ${TRADEOS_VIRTUALS_ACP_API_KEY}" \
  | python -m json.tool
```

Keep deprecations manual unless you are intentionally removing old objects:

```bash
curl -fsS -X POST 'http://127.0.0.1:18093/virtuals/v1/sync?apply_deprecations=true' \
  -H "X-API-Key: ${TRADEOS_VIRTUALS_ACP_API_KEY}" \
  | python -m json.tool
```

## Buyer Smoke Test

Use a separate buyer agent. ACP jobs can fail when buyer and provider are the
same wallet.

Create or select a buyer smoke agent:

```bash
./node_modules/.bin/acp --json agent create \
  --name 'ACP Buyer Smoke' \
  --description 'Temporary buyer agent for ACP provider smoke tests. No custody, no execution.' \
  --signer

./node_modules/.bin/acp --json agent use --agent-id <buyer-agent-uuid>
```

Create a free job:

```bash
./node_modules/.bin/acp --json client create-job \
  --provider <provider-agent-wallet> \
  --offering-name communityTokenSafetyRadar \
  --requirements '{"prompt":"ACP smoke test. Return a small read-only token safety sample.","chain_id":"solana","limit":3,"output":"machine_actionable_json","metadata":{"requested_service":"tradeos-token-safety-radar-free","smoke_test":true}}' \
  --chain-id 8453
```

For a paid job, fund the buyer agent with Base USDC first, then create the job
and fund the exact budget from ACP job history:

```bash
./node_modules/.bin/acp --json client create-job \
  --provider <provider-agent-wallet> \
  --offering-name orderFlowStressCheck \
  --requirements '{"prompt":"ACP paid smoke test. Check BTCUSDT order-flow stress.","symbol":"BTCUSDT","timeframe":"1h","output":"machine_actionable_json","metadata":{"requested_service":"tradeos-vpin-stress","smoke_test":true}}' \
  --chain-id 8453 \
  --evaluator 0x0000000000000000000000000000000000000000

./node_modules/.bin/acp --json client fund \
  --job-id <job-id> \
  --chain-id 8453 \
  --amount <exact-budget-usdc>
```

Restore the provider as the active CLI agent after buyer operations:

```bash
./node_modules/.bin/acp --json agent use --agent-id <provider-agent-uuid>
```

## Expected Logs

Free zero-budget job:

```text
received ACP v2 job <job-id>
setting ACP budget job=<job-id> amount=0 source=offering
zero-budget ACP v2 job <job-id> is ready for fulfillment
forwarding ACP v2 job <job-id> to TradeOS adapter
submitting ACP v2 deliverable for job <job-id>
```

Paid required-funds job:

```text
received ACP v2 job <job-id>
setting ACP budget job=<job-id> amount=<amount> source=offering
ACP job <job-id> requires FundTransferHook; setting budget with transfer_amount=0 destination=<provider-wallet>
forwarding ACP v2 job <job-id> to TradeOS adapter
submitting ACP v2 deliverable for FundTransferHook job <job-id> transfer_amount=0
ACP v2 job <job-id> terminal event=job.completed
```

## Known Pitfalls

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `execution reverted` during create-job | Buyer and provider are the same wallet, or hook params are missing | Use a separate buyer agent; for FundTransferHook submit with zero transfer opt params. |
| `Manual approval required` | Wallet policy requires browser approval | Open the printed URL and approve, or adjust policy for the test agent. |
| `acp: command not found` | CLI is not globally installed | Use `services/virtuals-acp-provider-bridge/node_modules/.bin/acp`. |
| Docker bridge cannot sign on macOS | Host keychain signer is unavailable in container | Run bridge on host, set up signer inside the container, or inject a signer secret through a secret manager. |
| `/ready` shows `enabled=false` | Remote catalog sync disabled or unconfigured | Expected for local tests; fix API base/key/builder code before remote sync. |
| `Cannot POST /v1/jobs/<job-id>/deliverables` | Adapter is trying REST deliverable submission in bridge mode | Set `TRADEOS_VIRTUALS_ACP_SUBMIT_DELIVERABLES=false`; let the bridge submit through ACP SDK. |
| `setBudget cannot be called directly when FundTransferHook is configured` | Paid offering uses required-funds hook | Use `setBudgetWithFundRequest(..., transfer_amount=0, provider_wallet)` for read-only jobs. |
| `Sponsorship failed: User operation cost exceeds specified spend limit` | ACP/Privy/paymaster spend limit, not necessarily USDC balance | Ask Virtuals support to increase the paymaster/spend/gas limit for the buyer/provider flow. |
| HTML returned where JSON was expected | Platform endpoint or CLI flow returned an error page | Capture timestamp, command, endpoint, and agent IDs; retry after confirming auth/session. |

## Virtuals Support Request Template

Use this when the paid path fails before a job ID is created or when funding
fails with a spend/gas/paymaster limit error:

```text
We are testing a read-only ACP v2 provider job on Base 8453.

Provider agent:
Provider wallet:
Buyer smoke agent:
Buyer wallet:
Offering name:
Expected price:
Approximate UTC timestamp:
Command:
Observed error:
  Sponsorship failed: User operation cost exceeds specified spend limit

The buyer wallet has Base USDC, and the provider bridge is connected.
Can you increase or confirm the paymaster/spend/gas limit for this buyer or
provider flow, or tell us which policy is blocking job creation/funding?
```

Do not send private keys, API keys, builder codes, webhook secrets, or seed
phrases in Discord or support tickets.

## Acceptance Criteria

A builder can treat the ACP integration as live when:

- local health checks pass;
- the provider bridge connects and waits for jobs;
- manifest export has no warnings;
- a free real ACP Marketplace job completes;
- a paid low-price ACP Marketplace job completes;
- the adapter job record shows `state=completed` and upstream status `200`;
- the deliverable is read-only JSON with safety notices;
- no secrets appear in logs, docs, marketplace listings, or support tickets.
