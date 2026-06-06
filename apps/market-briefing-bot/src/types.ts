import type { JsonObject } from "@tradeos/public-intel-sdk";

export type OutputPlatform = "stdout" | "discord" | "telegram";

export interface BriefingEvidence {
  digest: JsonObject;
  watchlist: JsonObject;
  sourceRefs: string[];
  generatedAt: string;
}

export interface BriefingConfig {
  chainId: string;
  digestLimit: number;
  watchlistLimit: number;
  platform: OutputPlatform;
  dryRun: boolean;
  withLlm: boolean;
  llmProvider: string;
  llmBaseUrl?: string;
  llmApiKey?: string;
  llmModel?: string;
  discordWebhookUrl?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  feedbackSource: string;
  automationLevel: string;
}

export interface BriefingResult {
  text: string;
  evidence: BriefingEvidence;
  llmUsed: boolean;
  model: string;
}
