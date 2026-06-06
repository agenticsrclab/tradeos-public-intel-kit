import OpenAI from "openai";
import { nowIso, stableId, TradeOSPublicIntelClient } from "@tradeos/public-intel-sdk";
import type { JsonObject, JsonValue } from "@tradeos/public-intel-sdk";
import type { BriefingConfig, BriefingEvidence, BriefingResult } from "./types.js";

export async function collectBriefingEvidence(
  client: TradeOSPublicIntelClient,
  config: Pick<BriefingConfig, "chainId" | "digestLimit" | "watchlistLimit">,
): Promise<BriefingEvidence> {
  const [digest, watchlist] = await Promise.all([
    client.getMarketDigest({ chainId: config.chainId, limit: config.digestLimit }),
    client.getThesisWatchlist({ chainId: config.chainId, limit: config.watchlistLimit }),
  ]);
  return {
    digest,
    watchlist,
    generatedAt: nowIso(),
    sourceRefs: sourceRefsFrom(digest, watchlist),
  };
}

export async function buildMarketBriefing(evidence: BriefingEvidence, config: BriefingConfig): Promise<BriefingResult> {
  const fallback = renderFallbackBriefing(evidence);
  if (!config.withLlm || !config.llmApiKey || !config.llmModel) {
    return {
      text: fallback,
      evidence,
      llmUsed: false,
      model: "deterministic-template",
    };
  }

  const openai = new OpenAI({
    apiKey: config.llmApiKey,
    baseURL: config.llmBaseUrl,
    timeout: 45_000,
    maxRetries: 1,
  });
  const response = await openai.chat.completions.create({
    model: config.llmModel,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: [
          "You write source-backed public market briefings from TradeOS public intelligence.",
          "Do not provide personalized financial advice or trade instructions.",
          "Do not use the words buy, sell, or hold as standalone recommendations.",
          "Do not invent facts, prices, sources, or certainty.",
          "Keep it useful for Discord or Telegram: concise sections, plain language, source refs, and caveats.",
        ].join(" "),
      },
      {
        role: "user",
        content: buildBriefingPrompt(evidence),
      },
    ],
  });
  const text = response.choices[0]?.message?.content?.trim();
  return {
    text: text || fallback,
    evidence,
    llmUsed: Boolean(text),
    model: config.llmModel,
  };
}

export function buildBriefingPrompt(evidence: BriefingEvidence): string {
  return [
    "Create a TradeOS public intelligence market briefing for a community channel.",
    "",
    "Required shape:",
    "1. Headline",
    "2. What changed",
    "3. Watchlist focus",
    "4. Caveats / evidence gaps",
    "5. Source refs",
    "6. Feedback request",
    "",
    "Rules:",
    "- Use only the JSON evidence.",
    "- Do not include trading instructions.",
    "- Use stable source refs when available.",
    "- Ask readers to reply with useful, late, early, confusing, or evidence_too_thin.",
    "",
    "Evidence JSON:",
    JSON.stringify(summarizeEvidence(evidence), null, 2),
  ].join("\n");
}

export function renderFallbackBriefing(evidence: BriefingEvidence): string {
  const summary = summarizeEvidence(evidence);
  const headline = text(summary.headline) || "TradeOS public market briefing";
  const digestItems = Array.isArray(summary.digest_items) ? summary.digest_items : [];
  const watchlistItems = Array.isArray(summary.watchlist_items) ? summary.watchlist_items : [];
  const digestLines = digestItems
    .slice(0, 3)
    .map((item, index) => `${index + 1}. ${itemLine(item)}`)
    .filter(Boolean);
  const watchlistLines = watchlistItems
    .slice(0, 5)
    .map((item, index) => `${index + 1}. ${watchlistLine(item)}`)
    .filter(Boolean);
  const refs = evidence.sourceRefs.slice(0, 8);
  return [
    `TradeOS Market Briefing: ${headline}`,
    "",
    "What changed",
    ...(digestLines.length ? digestLines : ["1. No digest item passed the local summary filter."]),
    "",
    "Watchlist focus",
    ...(watchlistLines.length ? watchlistLines : ["1. No watchlist rows were returned for this run."]),
    "",
    "Caveats",
    "- Public intelligence only; not personalized financial advice.",
    "- Treat this as source-backed context, not an execution signal.",
    "- Evidence gaps and stale source refs should be labeled so TradeOS can improve the public surface.",
    "",
    "Source refs",
    ...(refs.length ? refs.map((ref) => `- ${ref}`) : ["- none returned"]),
    "",
    "Feedback",
    "Reply or submit: useful, too_early, too_late, confusing_explanation, evidence_too_thin.",
  ].join("\n");
}

export async function submitBriefingFeedback(
  client: TradeOSPublicIntelClient,
  result: BriefingResult,
  config: Pick<BriefingConfig, "feedbackSource" | "automationLevel" | "platform">,
): Promise<JsonObject> {
  const targetId = stableId("market_briefing", [
    result.evidence.generatedAt,
    result.evidence.sourceRefs,
    result.llmUsed ? result.model : "template",
  ]);
  return client.submitDigestFeedback({
    targetType: "digest",
    targetId,
    label: "published_public_briefing",
    optionalNote: `Market briefing bot published to ${config.platform}.`,
    consentForDatasetUse: true,
    sourceSnapshotRefs: result.evidence.sourceRefs,
    feedbackSource: config.feedbackSource,
    automationLevel: config.automationLevel,
    agentId: "tradeos-market-briefing-bot",
    agentRunId: targetId,
    agentModel: result.model,
    provenanceNote: "Distribution-kit market briefing bot publication event.",
  });
}

export function shouldSubmitBriefingFeedback(
  command: string | undefined,
  config: Pick<BriefingConfig, "dryRun">,
  enabled: boolean,
): boolean {
  return enabled && command === "post" && !config.dryRun;
}

export function summarizeEvidence(evidence: BriefingEvidence): JsonObject {
  const digest = record(evidence.digest.digest);
  const watchlist = Array.isArray(evidence.watchlist.watchlist) ? evidence.watchlist.watchlist : [];
  return {
    generated_at: evidence.generatedAt,
    headline: digest.headline,
    digest_type: digest.digest_type,
    digest_items: list(digest.items).slice(0, 5).map((item) => pick(record(item), [
      "symbol",
      "headline",
      "summary",
      "decision",
      "confidence_score",
      "source_snapshot_refs",
      "caveats",
    ])),
    watchlist_items: watchlist.slice(0, 8).map((item) => pick(record(item), [
      "symbol",
      "watchlist_type",
      "publish_priority",
      "research_stance",
      "thesis_template",
      "confidence_score",
      "material_change_triggers",
      "source_snapshot_refs",
      "token_holder_alignment_summary",
    ])),
    source_refs: evidence.sourceRefs.slice(0, 20),
  };
}

function sourceRefsFrom(...payloads: JsonObject[]): string[] {
  const refs = new Set<string>();
  for (const payload of payloads) {
    collectRefs(payload, refs);
  }
  return [...refs].slice(0, 50);
}

function collectRefs(value: JsonValue | undefined, refs: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectRefs(item, refs);
    }
    return;
  }
  if (!value || typeof value !== "object") {
    return;
  }
  const obj = value as JsonObject;
  const sourceRefs = obj.source_snapshot_refs;
  if (Array.isArray(sourceRefs)) {
    for (const ref of sourceRefs) {
      if (typeof ref === "string" && ref) {
        refs.add(ref);
      }
    }
  }
  for (const child of Object.values(obj)) {
    collectRefs(child, refs);
  }
}

function itemLine(value: unknown): string {
  const item = record(value);
  const symbol = text(item.symbol);
  const headline = text(item.headline || item.summary || item.decision || "Public evidence update");
  const caveats = list(item.caveats).slice(0, 2).map(text).filter(Boolean);
  return [symbol ? `${symbol}: ${headline}` : headline, caveats.length ? `Caveats: ${caveats.join("; ")}` : ""]
    .filter(Boolean)
    .join(" | ");
}

function watchlistLine(value: unknown): string {
  const item = record(value);
  const symbol = text(item.symbol) || "Unknown";
  const stance = text(item.research_stance || item.watchlist_type || item.thesis_template || "watchlist");
  const triggers = list(item.material_change_triggers).slice(0, 2).map(text).filter(Boolean);
  return [`${symbol}: ${stance}`, triggers.length ? `Watch: ${triggers.join("; ")}` : ""].filter(Boolean).join(" | ");
}

function pick(source: JsonObject, keys: string[]): JsonObject {
  const out: JsonObject = {};
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== "" && value !== null) {
      out[key] = value;
    }
  }
  return out;
}

function list(value: unknown): JsonValue[] {
  return Array.isArray(value) ? value : [];
}

function record(value: unknown): JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as JsonObject) : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
