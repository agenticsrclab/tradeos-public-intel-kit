import { describe, expect, it } from "vitest";
import {
  buildBotPreflightResponse,
  buildEvidenceBundle,
  buildRecommendationCard,
  buildSymbolCockpitPacket,
} from "../src/index.js";

describe("cockpit-core", () => {
  it("builds an avoid-new-long cockpit packet from stressed evidence", () => {
    const evidence = buildEvidenceBundle(
      { symbol: "vvv", chain: "8453", mode: "trader", recommendationType: "trade_preflight" },
      {
        watchlist_snapshot: {
          token: { symbol: "VVV", current_price_usd: 0.0421, target_price_usd: 0.055, price_as_of: "2026-06-07T13:00:00.000Z" },
          events: [
            { event_id: "wle_1", summary: "VVV flow stress is elevated and liquidity is thin." },
            { event_id: "wle_2", summary: "Fusion agreement degraded across proactive and reactive reads." },
          ],
        },
      },
    );

    const packet = buildSymbolCockpitPacket(
      { symbol: "vvv", chain: "8453", mode: "trader", recommendationType: "trade_preflight" },
      evidence,
    );

    expect(packet.symbol).toBe("VVV");
    expect(packet.verdict).toBe("avoid_new_long");
    expect(packet.action).toBe("avoid_new_long");
    expect(packet.evidence_refs.length).toBeGreaterThan(0);
    expect(packet.market_snapshot?.price_usd).toBe(0.0421);
    expect(packet.market_snapshot?.target_price_usd).toBe(0.055);
    expect(packet.limitations[0]).toContain("Self-hosted");
  });

  it("turns a packet into a feedback-addressable recommendation card", () => {
    const evidence = buildEvidenceBundle(
      { symbol: "SOL" },
      { digest: { items: [{ public_claim_id: "claim_1", symbol: "SOL", summary: "SOL momentum improved." }] } },
    );
    const packet = buildSymbolCockpitPacket({ symbol: "SOL" }, evidence);
    const card = buildRecommendationCard(packet);

    expect(card.target_id).toBe(packet.target_id);
    expect(card.feedback_target.target_type).toBe("cockpit_recommendation");
    expect(card.drivers?.next_steps.length).toBeGreaterThan(0);
    expect(card.evidence?.length).toBeGreaterThan(0);
    expect(card.card_id).toMatch(/^cockpit_card_/);
  });

  it("does not use unrelated token rows as symbol-specific cockpit drivers", () => {
    const evidence = buildEvidenceBundle(
      { symbol: "VVV", chain: "8453", mode: "trader" },
      {
        digest: {
          headline: "Global crypto market regime is bearish with weak breadth.",
          items: [
            {
              public_claim_id: "keycat_claim_1",
              symbol: "KEYCAT",
              summary: "$KEYCAT liquidity is usable, but trading activity is thin.",
            },
            {
              public_claim_id: "ski_claim_1",
              symbol: "SKI",
              summary: "$SKI recovery is fragile and weak.",
            },
            {
              public_claim_id: "aixbt_claim_1",
              symbol: "AIXBT",
              summary: "$AIXBT momentum improved but liquidity is thin.",
            },
            {
              public_claim_id: "well_claim_1",
              symbol: "WELL",
              summary: "$WELL has protocol revenue but still needs monitoring.",
            },
            {
              public_claim_id: "vvv_claim_1",
              symbol: "VVV",
              summary: "VVV source confidence is strong, but token-holder alignment is partial.",
            },
          ],
        },
      },
    );

    const packet = buildSymbolCockpitPacket({ symbol: "VVV", chain: "8453", mode: "trader" }, evidence);
    const drivers = [...packet.good, ...packet.bad, ...packet.ugly].join(" ");

    expect(drivers).toContain("VVV source confidence is strong");
    expect(drivers).not.toContain("KEYCAT");
    expect(drivers).not.toContain("SKI");
    expect(drivers).not.toContain("AIXBT");
    expect(drivers).not.toContain("WELL");
    expect(packet.evidence_refs.some((ref) => ref.includes("keycat_claim_1"))).toBe(false);
  });

  it("reports public-intel rate limits as source availability failures, not weak symbol evidence", () => {
    const evidence = buildEvidenceBundle(
      { symbol: "VVV", chain: "8453", mode: "trader" },
      {},
      {
        thesis_watchlist: "TradeOS public intelligence request failed: 429 Too Many Requests",
        candidates: "TradeOS public intelligence request failed: 429 Too Many Requests",
        watchlist_snapshot: "TradeOS public intelligence request failed: 429 Too Many Requests",
        digest: "TradeOS public intelligence request failed: 429 Too Many Requests",
      },
    );

    const packet = buildSymbolCockpitPacket({ symbol: "VVV", chain: "8453", mode: "trader" }, evidence);
    const card = buildRecommendationCard(packet);

    expect(packet.verdict).toBe("insufficient_evidence");
    expect(packet.confidence).toBe(0.15);
    expect(packet.good).toEqual([]);
    expect(packet.bad[0]).toContain("rate limited");
    expect(packet.bad.join(" ")).not.toContain("liquidity");
    expect(packet.next_steps.join(" ")).toContain("Retry after the rate-limit window");
    expect(packet.source_summary).toEqual({ source_count: 0, error_count: 4, matched_items: 0 });
    expect(card.body).toContain("rate limited");
  });

  it("blocks a bot buy when cockpit risk says avoid", () => {
    const evidence = buildEvidenceBundle(
      { symbol: "VVV", recommendationType: "trade_preflight" },
      { watchlist_snapshot: { events: [{ summary: "VVV VPIN flow stress is severe." }] } },
    );
    const packet = buildSymbolCockpitPacket({ symbol: "VVV", recommendationType: "trade_preflight" }, evidence);
    const preflight = buildBotPreflightResponse({ symbol: "VVV", proposed_action: "buy" }, packet);

    expect(preflight.allowed).toBe(false);
    expect(preflight.decision).toBe("avoid");
    expect(preflight.reason).toContain("conflicts");
  });
});
