import { describe, expect, it } from "vitest";
import type { TradeOSPublicIntelClient } from "@tradeos/public-intel-sdk";
import { createToolHandlers } from "../src/tools.js";

describe("MCP tool handlers", () => {
  it("looks up a symbol thesis from the watchlist", async () => {
    const client = {
      async getThesisWatchlist() {
        return {
          watchlist: [
            { symbol: "SKI", thesis_id: "thesis_ski" },
            { symbol: "KEYCAT", thesis_id: "thesis_keycat" },
          ],
        };
      },
    } as unknown as TradeOSPublicIntelClient;
    const tools = createToolHandlers({ client });

    const response = await tools.getSymbolThesis({ symbol: "ski" });
    const payload = JSON.parse(response.content[0].text);

    expect(payload.symbol).toBe("SKI");
    expect(payload.count).toBe(1);
    expect(payload.matches[0].thesis_id).toBe("thesis_ski");
  });

  it("reports credit endpoint readiness", async () => {
    const tools = createToolHandlers({ client: {} as TradeOSPublicIntelClient });

    const response = await tools.getCreditState({ anonymousSessionIdOrUserId: "session_1" });
    const payload = JSON.parse(response.content[0].text);

    expect(payload.status).toBe("not_available");
    expect(payload.anonymous_session_id_or_user_id).toBe("session_1");
  });

  it("returns token watchlist snapshots through the safety envelope", async () => {
    const client = {
      async getTokenWatchlistSnapshot(tokenRef: string) {
        return {
          schema_version: "tradeos.public_intel.watchlist_snapshot.v1",
          token: { symbol: tokenRef },
        };
      },
    } as unknown as TradeOSPublicIntelClient;
    const tools = createToolHandlers({ client });

    const response = await tools.getTokenWatchlistSnapshot({ tokenRef: "VVV", mode: "investor" });
    const payload = JSON.parse(response.content[0].text);

    expect(payload.safety_notice).toContain("not personalized financial advice");
    expect(payload.token.symbol).toBe("VVV");
  });

  it("reads account watchlist state", async () => {
    const client = {
      async getWatchlistState(watchlistId: string) {
        return {
          schema_version: "tradeos.public_intel.watchlist_state.v1",
          watchlist: { watchlist_id: watchlistId },
          items: [],
        };
      },
    } as unknown as TradeOSPublicIntelClient;
    const tools = createToolHandlers({ client });

    const response = await tools.getWatchlistState({ watchlistId: "wl_1" });
    const payload = JSON.parse(response.content[0].text);

    expect(payload.watchlist.watchlist_id).toBe("wl_1");
    expect(payload.items).toEqual([]);
  });

  it("builds symbol cockpit packets through public evidence aggregation", async () => {
    const client = {
      async getSymbolCockpitEvidence() {
        return {
          sources: {
            watchlist_snapshot: {
              events: [{ event_id: "wle_1", summary: "VVV flow stress warning and fusion degraded." }],
            },
          },
          source_errors: {},
        };
      },
    } as unknown as TradeOSPublicIntelClient;
    const tools = createToolHandlers({ client });

    const response = await tools.getSymbolCockpit({ symbol: "VVV", chain: "8453", mode: "trader" });
    const payload = JSON.parse(response.content[0].text);

    expect(payload.packet.symbol).toBe("VVV");
    expect(payload.card.feedback_target.target_type).toBe("cockpit_recommendation");
    expect(payload.safety_notice).toContain("not personalized financial advice");
  });

  it("triggers watchlist deliveries through the safety envelope", async () => {
    const client = {
      async triggerWatchlistDeliveries(watchlistId: string) {
        return {
          schema_version: "tradeos.public_intel.watchlist_deliveries.v1",
          watchlist_id: watchlistId,
          deliveries: [{ delivery_id: "wld_1", status: "sent" }],
        };
      },
    } as unknown as TradeOSPublicIntelClient;
    const tools = createToolHandlers({ client });

    const response = await tools.triggerWatchlistDeliveries({ watchlistId: "wl_1", channelKinds: ["in_app"] });
    const payload = JSON.parse(response.content[0].text);

    expect(payload.watchlist_id).toBe("wl_1");
    expect(payload.deliveries[0].status).toBe("sent");
    expect(payload.safety_notice).toContain("not personalized financial advice");
  });
});
