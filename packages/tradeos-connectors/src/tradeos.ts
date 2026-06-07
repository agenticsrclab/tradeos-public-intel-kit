import { buildEvidenceBundle } from "@tradeos/cockpit-core";
import type { EvidenceBundle, JsonObject, SymbolCockpitQuery } from "@tradeos/cockpit-core";
import { TradeOSPublicIntelClient } from "@tradeos/public-intel-sdk";

export interface TradeOSEvidenceConnectorOptions {
  client?: TradeOSPublicIntelClient;
  appName?: string;
  appVersion?: string;
  digestLimit?: number;
  candidateLimit?: number;
  watchlistLimit?: number;
  retryAttempts?: number;
  retryBaseDelayMs?: number;
}

export interface TradeOSEvidenceReadResult {
  bundle: EvidenceBundle;
  app_attribution?: JsonObject;
}

export class TradeOSEvidenceConnector {
  readonly client: TradeOSPublicIntelClient;
  readonly digestLimit: number;
  readonly candidateLimit: number;
  readonly watchlistLimit: number;
  readonly retryAttempts: number;
  readonly retryBaseDelayMs: number;

  constructor(options: TradeOSEvidenceConnectorOptions = {}) {
    this.client =
      options.client ??
      new TradeOSPublicIntelClient({
        appName: options.appName ?? "tradeos-symbol-cockpit",
        appVersion: options.appVersion ?? "0.1.0",
      });
    this.digestLimit = options.digestLimit ?? 10;
    this.candidateLimit = options.candidateLimit ?? 10;
    this.watchlistLimit = options.watchlistLimit ?? 100;
    this.retryAttempts = options.retryAttempts ?? 2;
    this.retryBaseDelayMs = options.retryBaseDelayMs ?? 250;
  }

  async fetchSymbolEvidence(query: SymbolCockpitQuery): Promise<TradeOSEvidenceReadResult> {
    const sources: Record<string, JsonObject> = {};
    const sourceErrors: Record<string, string> = {};

    await Promise.all([
      capture("watchlist_snapshot", sourceErrors, this.retryAttempts, this.retryBaseDelayMs, async () => {
        sources.watchlist_snapshot = asJsonObject(
          await this.client.getTokenWatchlistSnapshot(query.symbol, {
            mode: query.mode,
            chain: query.chain,
            contractAddress: query.contractAddress,
            limit: this.watchlistLimit,
          }),
        );
      }),
      capture("digest", sourceErrors, this.retryAttempts, this.retryBaseDelayMs, async () => {
        sources.digest = asJsonObject(
          await this.client.getMarketDigest({
            chainId: query.chain,
            limit: this.digestLimit,
          }),
        );
      }),
      capture("candidates", sourceErrors, this.retryAttempts, this.retryBaseDelayMs, async () => {
        sources.candidates = asJsonObject(
          await this.client.getPublicCandidates({
            chainId: query.chain,
            limit: this.candidateLimit,
          }),
        );
      }),
      capture("thesis_watchlist", sourceErrors, this.retryAttempts, this.retryBaseDelayMs, async () => {
        sources.thesis_watchlist = asJsonObject(
          await this.client.getThesisWatchlist({
            chainId: query.chain,
            limit: this.watchlistLimit,
          }),
        );
      }),
    ]);

    const result: TradeOSEvidenceReadResult = {
      bundle: buildEvidenceBundle(query, sources, sourceErrors),
    };

    await capture("app_attribution", sourceErrors, this.retryAttempts, this.retryBaseDelayMs, async () => {
      result.app_attribution = asJsonObject(await this.client.getAppAttribution());
    });

    return result;
  }

  async submitCockpitFeedback(input: {
    targetId: string;
    label: string;
    note?: string;
    sourceSnapshotRefs?: string[];
    anonymousSessionIdOrUserId?: string;
    agentRunId?: string;
    agentModel?: string;
    agentConfidence?: number;
  }): Promise<JsonObject> {
    return asJsonObject(
      await this.client.submitDigestFeedback({
        targetType: "cockpit_recommendation",
        targetId: input.targetId,
        label: input.label,
        optionalNote: input.note,
        sourceSnapshotRefs: input.sourceSnapshotRefs,
        anonymousSessionIdOrUserId: input.anonymousSessionIdOrUserId,
        feedbackSource: input.agentRunId ? "agent" : "human",
        automationLevel: input.agentRunId ? "assisted" : "none",
        agentId: input.agentRunId ? "tradeos-symbol-cockpit" : undefined,
        agentRunId: input.agentRunId,
        agentModel: input.agentModel,
        agentConfidence: input.agentConfidence,
        provenanceNote: "Private self-hosted Symbol Cockpit feedback.",
      }),
    );
  }
}

async function capture(
  name: string,
  errors: Record<string, string>,
  retryAttempts: number,
  retryBaseDelayMs: number,
  fn: () => Promise<void>,
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retryAttempts; attempt += 1) {
    try {
      await fn();
      return;
    } catch (error: unknown) {
      lastError = error;
      if (attempt >= retryAttempts || !isRetryableTradeOSError(error)) {
        break;
      }
      await delay(retryBaseDelayMs * 2 ** attempt);
    }
  }
  errors[name] = lastError instanceof Error ? lastError.message : String(lastError);
}

function asJsonObject(value: unknown): JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as JsonObject) : {};
}

function isRetryableTradeOSError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  return (
    lower.includes("429") ||
    lower.includes("too many requests") ||
    lower.includes("rate limit") ||
    /\b5\d\d\b/.test(lower)
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
