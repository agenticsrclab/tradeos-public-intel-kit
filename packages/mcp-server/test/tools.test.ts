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
});

