#!/usr/bin/env node
import { TradeOSPublicIntelClient } from "@tradeos/public-intel-sdk";
import {
  buildMarketBriefing,
  collectBriefingEvidence,
  shouldSubmitBriefingFeedback,
  submitBriefingFeedback,
} from "./briefing.js";
import { parsePlatform, publishBriefing } from "./platforms.js";
import type { BriefingConfig } from "./types.js";

const DEFAULT_LLM_PROVIDER = "venice";
const DEFAULT_VENICE_BASE_URL = "https://api.venice.ai/api/v1";
const DEFAULT_VENICE_MODEL = "z-ai-glm-5-turbo";

async function main(argv: string[]): Promise<void> {
  const [command] = argv;
  if (command === "help") {
    console.log(helpText());
    return;
  }
  const config = configFromEnv();
  const client = new TradeOSPublicIntelClient({
    appName: process.env.TRADEOS_CLIENT_APP ?? "tradeos-market-briefing-bot",
    appVersion: process.env.TRADEOS_CLIENT_VERSION ?? "0.1.0",
  });

  const evidence = await collectBriefingEvidence(client, config);
  const briefing = await buildMarketBriefing(evidence, config);

  if (config.dryRun || command === "brief" || command === undefined) {
    console.log(briefing.text);
  } else if (command === "post") {
    await publishBriefing(briefing.text, config);
  } else {
    throw new Error(`Unknown command: ${command}\n\n${helpText()}`);
  }

  if (shouldSubmitBriefingFeedback(command, config, process.env.TRADEOS_BRIEFING_SUBMIT_FEEDBACK === "true")) {
    const ack = await submitBriefingFeedback(client, briefing, config);
    if (config.dryRun || config.platform === "stdout") {
      console.error(JSON.stringify({ feedback_ack: ack }, null, 2));
    }
  }
}

export function configFromEnv(): BriefingConfig {
  const llmProvider = process.env.LLM_PROVIDER ?? DEFAULT_LLM_PROVIDER;
  const isVenice = llmProvider === DEFAULT_LLM_PROVIDER;
  const llmApiKey = isVenice ? process.env.VENICE_API_KEY ?? process.env.OPENAI_API_KEY : process.env.OPENAI_API_KEY;
  const llmModel = process.env.TRADEOS_AGENT_MODEL ?? (isVenice ? DEFAULT_VENICE_MODEL : undefined);
  return {
    chainId: process.env.TRADEOS_BRIEFING_CHAIN_ID ?? "8453",
    digestLimit: envInt("TRADEOS_BRIEFING_DIGEST_LIMIT", 5),
    watchlistLimit: envInt("TRADEOS_BRIEFING_WATCHLIST_LIMIT", 5),
    platform: parsePlatform(process.env.TRADEOS_BRIEFING_PLATFORM),
    dryRun: envBool("TRADEOS_BRIEFING_DRY_RUN", false),
    withLlm: envBool("TRADEOS_BRIEFING_USE_LLM", Boolean(llmApiKey)),
    llmProvider,
    llmBaseUrl: process.env.OPENAI_BASE_URL ?? (isVenice ? DEFAULT_VENICE_BASE_URL : undefined),
    llmApiKey,
    llmModel,
    discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramChatId: process.env.TELEGRAM_CHAT_ID,
    feedbackSource: process.env.TRADEOS_BRIEFING_FEEDBACK_SOURCE ?? "automation",
    automationLevel: process.env.TRADEOS_BRIEFING_AUTOMATION_LEVEL ?? "automated",
  };
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function envBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined) {
    return fallback;
  }
  return ["1", "true", "yes", "y", "on"].includes(raw.toLowerCase());
}

function helpText(): string {
  return `TradeOS Market Briefing Bot

Commands:
  brief     print a briefing to stdout
  post      publish to TRADEOS_BRIEFING_PLATFORM
  help

Environment:
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
`;
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
