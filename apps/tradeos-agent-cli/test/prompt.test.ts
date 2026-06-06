import { describe, expect, it } from "vitest";
import { buildAskPrompt, extractDigestSummary } from "../src/prompt.js";

describe("CLI prompt helpers", () => {
  it("keeps prompt grounded to evidence JSON", () => {
    const prompt = buildAskPrompt("What changed?", { headline: "TradeOS digest" });

    expect(prompt).toContain("Use only the evidence JSON below");
    expect(prompt).toContain("Question: What changed?");
    expect(prompt).toContain("TradeOS digest");
  });

  it("extracts a bounded digest summary", () => {
    const summary = extractDigestSummary({
      schema_version: "v1",
      generated_at: "now",
      source_snapshot_refs: ["ref"],
      evidence: { confidence_score: 0.7 },
      digest: {
        headline: "Headline",
        source_categories: ["market_pulse"],
        items: [1, 2, 3, 4, 5, 6],
      },
    });

    expect(summary.headline).toBe("Headline");
    expect(Array.isArray(summary.items)).toBe(true);
    expect(summary.items).toHaveLength(5);
  });
});

