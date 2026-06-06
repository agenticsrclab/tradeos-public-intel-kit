# @tradeos/public-intel-sdk

TypeScript SDK for TradeOS public intelligence.

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
Free public kit: bounded reads and feedback writes
Feedback credits: dashboard-only depth, 30-day unlock by default
Paid TradeOS/x402: automation, exports, alerts, premium data, validation APIs
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
