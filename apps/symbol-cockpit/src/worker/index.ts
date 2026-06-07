import { createRuntime } from "../runtime.js";

const runtime = createRuntime();
const symbols = (process.env.COCKPIT_WATCHLIST ?? "VVV,BTC,ETH,SOL")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const intervalSeconds = Number(process.env.COCKPIT_WORKER_INTERVAL_SECONDS ?? 900);
const runOnce = process.argv.includes("--once") || process.env.COCKPIT_WORKER_RUN_ONCE === "true";

async function scan(): Promise<void> {
  for (const symbol of symbols) {
    const result = await runtime.reviewSymbol({
      symbol,
      chain: process.env.COCKPIT_DEFAULT_CHAIN,
      mode: (process.env.COCKPIT_DEFAULT_MODE as "investor" | "swing" | "trader" | undefined) ?? "trader",
      recommendationType: "watchlist_scanner",
    });
    console.log(
      JSON.stringify({
        symbol,
        verdict: result.packet.verdict,
        action: result.packet.action,
        target_id: result.packet.target_id,
        confidence: result.packet.confidence,
      }),
    );
  }
}

await scan();

if (!runOnce) {
  setInterval(() => {
    scan().catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
    });
  }, intervalSeconds * 1000);
}

