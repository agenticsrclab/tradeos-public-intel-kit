import { describe, expect, it } from "vitest";
import { evaluateExpectedAdvantage } from "../src/index.js";

describe("EA risk module", () => {
  it("fails an avoid-new-long cockpit packet", () => {
    const result = evaluateExpectedAdvantage({
      schema_version: "tradeos.symbol_cockpit.packet.v1",
      target_id: "rec_1",
      symbol: "VVV",
      verdict: "avoid_new_long",
      action: "avoid_new_long",
      recommendation_type: "symbol_cockpit",
      confidence: 0.71,
      mode: "trader",
      good: ["Momentum improved."],
      bad: ["Fusion degraded."],
      ugly: ["VPIN elevated."],
      next_steps: [],
      evidence_refs: [],
      evidence: [],
      limitations: [],
      privacy_mode: "public_intel",
      generated_at: "now",
      source_summary: { source_count: 1, error_count: 0, matched_items: 2 },
    });

    expect(result.decision).toBe("fail");
    expect(result.reasons[0]).toContain("avoid_new_long");
  });
});

