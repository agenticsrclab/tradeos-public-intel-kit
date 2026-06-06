import type { JsonObject } from "@tradeos/public-intel-sdk";

export function buildAskPrompt(question: string, evidence: JsonObject): string {
  return [
    "You are explaining TradeOS public intelligence.",
    "Use only the evidence JSON below. Do not invent sources or trade instructions.",
    "Keep the answer concise, descriptive, and non-personalized.",
    "State material gaps and freshness limits when relevant.",
    "",
    `Question: ${question}`,
    "",
    "Evidence JSON:",
    JSON.stringify(evidence, null, 2),
  ].join("\n");
}

export function extractDigestSummary(payload: JsonObject): JsonObject {
  const digest = isRecord(payload.digest) ? payload.digest : {};
  return {
    schema_version: payload.schema_version,
    generated_at: payload.generated_at,
    headline: digest.headline,
    source_categories: digest.source_categories,
    source_snapshot_refs: payload.source_snapshot_refs,
    evidence: payload.evidence,
    items: Array.isArray(digest.items) ? digest.items.slice(0, 5) : [],
  };
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

