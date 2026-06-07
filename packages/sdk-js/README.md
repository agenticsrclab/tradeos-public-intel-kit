# @tradeos/public-intel-sdk

TypeScript SDK for the TradeOS public Data Intelligence layer.

Use it to pull bounded public market evidence and submit structured feedback
from Node.js apps, bots, workers, and agent services.

```bash
npm install @tradeos/public-intel-sdk
```

```ts
import { TradeOSPublicIntelClient } from "@tradeos/public-intel-sdk";

const client = new TradeOSPublicIntelClient();

const digest = await client.getMarketDigest({ limit: 10 });

const attribution = await client.getAppAttribution();

const snapshot = await client.getTokenWatchlistSnapshot("VVV", {
  mode: "trader",
  chain: "8453",
});

await client.submitDigestFeedback({
  targetType: "digest",
  targetId: "digest_123",
  label: "useful",
  optionalNote: "Clear evidence and caveats.",
  feedbackSource: "human",
});
```

Create an app key for attribution when you have a TradeOS account bearer token:

```ts
const created = await client.createAppKey(
  { appName: "my-public-intel-app" },
  { accountToken: process.env.TRADEOS_ACCOUNT_TOKEN },
);
```

Request reviewed public quota or a paid evaluation when a real project needs
more than starter/baseline public usage:

```ts
await client.submitQuotaRequest(
  {
    projectName: "community-market-bot",
    appKeyId: "pubkey_...",
    useCase: "Discord bot with source-backed token summaries and feedback buttons.",
    expectedDailyReads: 1500,
    expectedSymbolsPerDay: 80,
    monetizationModel: "paid community seats",
    feedbackPlan: "Members can label useful, stale, late, wrong, or missing-context answers.",
    paidIntent: "Will use x402 for alerts and higher scale.",
  },
  { accountToken: process.env.TRADEOS_ACCOUNT_TOKEN },
);
```

Create a saved watchlist when you have a TradeOS account bearer token:

```ts
const watchlist = await client.createWatchlist({
  name: "Portfolio risk monitor",
  mode: "investor",
});

const watchlistId = String(watchlist.watchlist.watchlist_id);
await client.addWatchlistItem(watchlistId, {
  symbol: "VVV",
  chain: "8453",
});

const state = await client.getWatchlistState(watchlistId);

await client.createWatchlistNotificationChannel(watchlistId, {
  channelKind: "in_app",
  target: "tradeos-dashboard",
  minSeverity: "watch",
  digestFrequency: "realtime",
});

await client.triggerWatchlistDeliveries(watchlistId, {
  channelKinds: ["in_app"],
  minSeverity: "watch",
});

const deliveryAudit = await client.listWatchlistDeliveries(watchlistId);
```

If `TRADEOS_PUBLIC_INTEL_KEY` is configured, account-scoped feedback sends that
key through `X-TradeOS-Public-Intel-Key` for builder attribution.

Agentic feedback can be tagged separately:

```ts
await client.submitDigestFeedback({
  targetType: "digest",
  targetId: "digest_123",
  label: "evidence_too_thin",
  feedbackSource: "agent",
  automationLevel: "autonomous",
  agentId: "market-review-agent",
  agentRunId: "run_001",
});
```

Default API base:

```text
https://api.tradeos.tech/v1/public-intel
```

Access model:

```text
Free public kit: bounded reads, token snapshots, and feedback writes
Builder app quota: 7-day starter, useful feedback refresh, or reviewed quota request
Data Intel Credits: dashboard-only depth, 7-day unlock by default
Account token: saved watchlists, events, channels, and user-owned feedback
Paid TradeOS/x402: automation, exports, high-volume alerts, premium data, validation APIs
```

`TRADEOS_PUBLIC_INTEL_KEY` is optional and used only when TradeOS has issued a
public-intel app key for attribution. This SDK can validate attribution, but it
does not perform TradeOS login/device auth.

Learn more:

```text
Homepage: https://tradeos.tech
Public docs: https://tradeos.tech/llms.txt
x402 discovery: https://tradeos.tech/.well-known/x402.json
```
