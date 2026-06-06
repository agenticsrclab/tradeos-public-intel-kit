import { describe, expect, it } from "vitest";
import {
  buildBriefingPrompt,
  renderFallbackBriefing,
  shouldSubmitBriefingFeedback,
  summarizeEvidence,
} from "../src/briefing.js";
import { parsePlatform } from "../src/platforms.js";
import type { BriefingEvidence } from "../src/types.js";

const evidence: BriefingEvidence = {
  generatedAt: "2026-06-06T00:00:00Z",
  sourceRefs: ["token_discovery:rank-1", "public_intel:watchlist:AERO"],
  digest: {
    digest: {
      headline: "Base breadth improved",
      digest_type: "daily_crypto_intelligence",
      items: [
        {
          symbol: "AERO",
          summary: "Liquidity hub evidence improved, but emissions remain a caveat.",
          caveats: ["emissions_cost_watch"],
          source_snapshot_refs: ["token_discovery:rank-1"],
        },
      ],
    },
  },
  watchlist: {
    watchlist: [
      {
        symbol: "AERO",
        watchlist_type: "risk_watch",
        material_change_triggers: ["holder class capture materially changes"],
        source_snapshot_refs: ["public_intel:watchlist:AERO"],
      },
    ],
  },
};

describe("market briefing bot", () => {
  it("renders a source-backed fallback briefing without trade instructions", () => {
    const text = renderFallbackBriefing(evidence).toLowerCase();

    expect(text).toContain("base breadth improved");
    expect(text).toContain("token_discovery:rank-1");
    expect(text).not.toMatch(/\b(buy|sell|hold)\b/);
  });

  it("builds a prompt grounded to evidence JSON", () => {
    const prompt = buildBriefingPrompt(evidence);

    expect(prompt).toContain("Use only the JSON evidence");
    expect(prompt).toContain("Base breadth improved");
    expect(prompt).toContain("Feedback request");
  });

  it("summarizes digest and watchlist evidence", () => {
    const summary = summarizeEvidence(evidence);

    expect(summary.headline).toBe("Base breadth improved");
    expect(summary.source_refs).toEqual(["token_discovery:rank-1", "public_intel:watchlist:AERO"]);
  });

  it("accepts supported output platforms", () => {
    expect(parsePlatform(undefined)).toBe("stdout");
    expect(parsePlatform("discord")).toBe("discord");
    expect(parsePlatform("telegram")).toBe("telegram");
  });

  it("submits publication feedback only after a real post", () => {
    expect(shouldSubmitBriefingFeedback("post", { dryRun: false }, true)).toBe(true);
    expect(shouldSubmitBriefingFeedback("brief", { dryRun: false }, true)).toBe(false);
    expect(shouldSubmitBriefingFeedback("post", { dryRun: true }, true)).toBe(false);
    expect(shouldSubmitBriefingFeedback("post", { dryRun: false }, false)).toBe(false);
  });
});
