import { describe, expect, it } from "vitest";
import { buildEvidenceBundle } from "@tradeos/cockpit-core";
import { SymbolCockpitRuntime } from "../src/runtime.js";

describe("SymbolCockpitRuntime", () => {
  it("defaults feedback links to the hosted TradeOS page with recommendation context", async () => {
    const previous = {
      cockpit: process.env.COCKPIT_FEEDBACK_BASE_URL,
      tradeos: process.env.TRADEOS_FEEDBACK_BASE_URL,
      publicBase: process.env.COCKPIT_PUBLIC_BASE_URL,
    };
    delete process.env.COCKPIT_FEEDBACK_BASE_URL;
    delete process.env.TRADEOS_FEEDBACK_BASE_URL;
    delete process.env.COCKPIT_PUBLIC_BASE_URL;

    try {
      const runtime = new SymbolCockpitRuntime({
        evidence: {
          client: { baseUrl: "https://example.test", apiKey: "test" },
          async fetchSymbolEvidence(query) {
            return {
              bundle: buildEvidenceBundle(query, {
                watchlist_snapshot: {
                  token: {
                    symbol: "VVV",
                    current_price_usd: 0.0421,
                    target_price_usd: 0.055,
                    price_as_of: "2026-06-07T13:00:00.000Z",
                  },
                  events: [{ event_id: "wle_1", summary: "VVV flow stress warning and fusion degraded." }],
                },
              }),
              app_attribution: { valid: true },
            };
          },
        } as never,
        actionAgent: { apiKey: "test" } as never,
      });

      const result = await runtime.reviewSymbol({ symbol: "VVV" });
      const feedbackUrl = new URL(result.card.feedback_url ?? "");

      expect(`${feedbackUrl.origin}${feedbackUrl.pathname}`).toBe("https://tradeos.tech/feedback");
      expect(feedbackUrl.searchParams.get("target_type")).toBe("cockpit_recommendation");
      expect(feedbackUrl.searchParams.get("target_id")).toBe(result.packet.target_id);
      expect(feedbackUrl.searchParams.get("symbol")).toBe("VVV");
      expect(feedbackUrl.searchParams.get("price_at_note")).toBe("0.0421");
      expect(feedbackUrl.searchParams.get("target_price")).toBe("0.055");
      expect(feedbackUrl.searchParams.getAll("source_snapshot_refs").length).toBeGreaterThan(0);
    } finally {
      restoreEnv("COCKPIT_FEEDBACK_BASE_URL", previous.cockpit);
      restoreEnv("TRADEOS_FEEDBACK_BASE_URL", previous.tradeos);
      restoreEnv("COCKPIT_PUBLIC_BASE_URL", previous.publicBase);
    }
  });

  it("reviews symbols and stores cards through mocked TradeOS evidence", async () => {
    const runtime = new SymbolCockpitRuntime({
      evidence: {
        client: { baseUrl: "https://example.test", apiKey: "test" },
        async fetchSymbolEvidence(query) {
          return {
            bundle: buildEvidenceBundle(query, {
              watchlist_snapshot: { events: [{ event_id: "wle_1", summary: "VVV flow stress warning and fusion degraded." }] },
            }),
            app_attribution: { valid: true },
          };
        },
        async submitCockpitFeedback() {
          return { status: "accepted" };
        },
      } as never,
      actionAgent: {
        apiKey: "test",
        async answer() {
          return {
            schema_version: "tradeos.symbol_cockpit.action_agent_answer.v1",
            model: "test",
            provider_base_url: "test",
            answer: "Watch only.",
            used_evidence_refs: [],
          };
        },
      } as never,
    });

    const result = await runtime.reviewSymbol({ symbol: "VVV" });

    expect(result.packet.symbol).toBe("VVV");
    expect(result.action_intent.non_executable).toBe(true);
    expect(result.action_intent.requires_operator_review).toBe(true);
    expect(result.action_intent.operator_must_choose).toContain("size");
    expect(runtime.store.cards()).toHaveLength(1);
    expect(runtime.opsSnapshot().recommendations.open).toBe(1);
  });

  it("requires approval before paper execution unless explicitly approved", async () => {
    const runtime = new SymbolCockpitRuntime({
      evidence: {
        client: { baseUrl: "https://example.test", apiKey: "test" },
        async fetchSymbolEvidence(query) {
          return { bundle: buildEvidenceBundle(query, { digest: { summary: "BTC momentum improved." } }) };
        },
      } as never,
      actionAgent: { apiKey: "test" } as never,
    });
    const review = await runtime.reviewSymbol({ symbol: "BTC" });
    const pending = runtime.requestPaperExecution({ target_id: review.packet.target_id });
    const filled = runtime.requestPaperExecution({ target_id: review.packet.target_id, approved: true, notional_usd: 100 });

    expect(pending.status).toBe("approval_required");
    expect(filled.status).toBe("filled");
  });
});

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}
