import { describe, expect, it, vi } from "vitest";
import { buildSymbolCockpitPacket } from "@tradeos/cockpit-core";
import type { TradeOSPublicIntelClient } from "@tradeos/public-intel-sdk";
import { OpenAICompatibleActionAgent, TradeOSEvidenceConnector } from "../src/index.js";

describe("tradeos-connectors", () => {
  it("aggregates public TradeOS evidence and preserves source failures", async () => {
    const client = {
      async getTokenWatchlistSnapshot() {
        return { events: [{ event_id: "wle_1", summary: "VVV flow stress warning." }] };
      },
      async getMarketDigest() {
        return { digest: { items: [] } };
      },
      async getPublicCandidates() {
        throw new Error("candidate endpoint unavailable");
      },
      async getThesisWatchlist() {
        return { watchlist: [] };
      },
      async getAppAttribution() {
        return { valid: true };
      },
    } as unknown as TradeOSPublicIntelClient;
    const connector = new TradeOSEvidenceConnector({ client });

    const result = await connector.fetchSymbolEvidence({ symbol: "VVV", chain: "8453" });

    expect(result.bundle.symbol).toBe("VVV");
    expect(result.bundle.sources.watchlist_snapshot).toBeTruthy();
    expect(result.bundle.source_errors.candidates).toContain("candidate endpoint unavailable");
    expect(result.app_attribution?.valid).toBe(true);
  });

  it("retries transient public-intel rate limits before recording source failures", async () => {
    const getPublicCandidates = vi
      .fn()
      .mockRejectedValueOnce(new Error("TradeOS public intelligence request failed: 429 Too Many Requests"))
      .mockResolvedValueOnce({ candidates: [{ public_claim_id: "claim_1", symbol: "VVV" }] });
    const client = {
      async getTokenWatchlistSnapshot() {
        return { events: [] };
      },
      async getMarketDigest() {
        return { digest: { items: [] } };
      },
      getPublicCandidates,
      async getThesisWatchlist() {
        return { watchlist: [] };
      },
      async getAppAttribution() {
        return { valid: true };
      },
    } as unknown as TradeOSPublicIntelClient;
    const connector = new TradeOSEvidenceConnector({ client, retryBaseDelayMs: 0 });

    const result = await connector.fetchSymbolEvidence({ symbol: "VVV", chain: "8453" });

    expect(getPublicCandidates).toHaveBeenCalledTimes(2);
    expect(result.bundle.sources.candidates).toBeTruthy();
    expect(result.bundle.source_errors.candidates).toBeUndefined();
  });

  it("calls an OpenAI-compatible action agent", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: "Watch only." } }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const cockpit = buildSymbolCockpitPacket(
      { symbol: "VVV" },
      {
        schema_version: "tradeos.cockpit.evidence_bundle.v1",
        symbol: "VVV",
        mode: "trader",
        generated_at: "now",
        sources: { digest: { summary: "VVV fusion degraded." } },
        source_errors: {},
      },
    );
    const agent = new OpenAICompatibleActionAgent({
      apiKey: "test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      baseUrl: "https://model.example/v1",
      model: "model-test",
    });

    const answer = await agent.answer("What should I do?", cockpit);

    expect(answer.answer).toBe("Watch only.");
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("requires a model provider key", async () => {
    const agent = new OpenAICompatibleActionAgent({
      apiKey: "",
      fetchImpl: (() => Promise.reject(new Error("not called"))) as unknown as typeof fetch,
    });

    await expect(
      agent.answer("What now?", {
        schema_version: "tradeos.symbol_cockpit.packet.v1",
        target_id: "rec_1",
        symbol: "VVV",
        verdict: "watch",
        action: "watch_for_recovery",
        recommendation_type: "symbol_cockpit",
        confidence: 0.5,
        mode: "trader",
        good: [],
        bad: [],
        ugly: [],
        next_steps: [],
        evidence_refs: [],
        evidence: [],
        limitations: [],
        privacy_mode: "public_intel",
        generated_at: "now",
        source_summary: { source_count: 0, error_count: 0, matched_items: 0 },
      }),
    ).rejects.toThrow("VENICE_API_KEY");
  });
});
