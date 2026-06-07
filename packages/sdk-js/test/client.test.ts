import { describe, expect, it, vi } from "vitest";
import { TradeOSApiError, TradeOSPublicIntelClient, stableId } from "../src/index.js";

describe("TradeOSPublicIntelClient", () => {
  it("builds digest query requests", async () => {
    const fetchImpl = vi.fn(async (input: string | URL) => {
      const url = new URL(String(input));
      expect(url.pathname).toBe("/v1/public-intel/digest-inputs");
      expect(url.searchParams.get("limit")).toBe("5");
      expect(url.searchParams.get("chain_id")).toBe("8453");
      return jsonResponse({ schema_version: "tradeos.public_intel.digest_inputs.v1" });
    });
    const client = new TradeOSPublicIntelClient({
      baseUrl: "https://example.test/v1/public-intel/",
      fetchImpl,
    });

    const payload = await client.getMarketDigest({ limit: 5, chainId: "8453" });

    expect(payload.schema_version).toBe("tradeos.public_intel.digest_inputs.v1");
  });

  it("checks app attribution with an optional public-intel key", async () => {
    const fetchImpl = vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      expect(url.pathname).toBe("/v1/public-intel/app-attribution");
      const headers = new Headers(init?.headers);
      expect(headers.get("authorization")).toBe("Bearer tos_pub_test");
      return jsonResponse({ schema_version: "tradeos.public_intel.app_attribution.v1", valid: true });
    });
    const client = new TradeOSPublicIntelClient({
      baseUrl: "https://example.test/v1/public-intel",
      apiKey: "tos_pub_test",
      fetchImpl,
    });

    const payload = await client.getAppAttribution();

    expect(payload.valid).toBe(true);
  });

  it("creates app keys with account auth instead of app-key auth", async () => {
    const fetchImpl = vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      expect(url.pathname).toBe("/v1/public-intel/api-keys");
      expect(init?.method).toBe("POST");
      const headers = new Headers(init?.headers);
      expect(headers.get("authorization")).toBe("Bearer acct_token");
      const body = JSON.parse(String(init?.body));
      expect(body.app_name).toBe("VVV review bot");
      expect(body.scopes).toEqual(["public_intel.feedback:write"]);
      return jsonResponse({ secret: "tos_pub_created" });
    });
    const client = new TradeOSPublicIntelClient({
      baseUrl: "https://example.test/v1/public-intel",
      apiKey: "tos_pub_existing",
      fetchImpl,
    });

    const payload = await client.createAppKey(
      { appName: "VVV review bot", scopes: ["public_intel.feedback:write"] },
      { accountToken: "acct_token" },
    );

    expect(payload.secret).toBe("tos_pub_created");
  });

  it("maps digest feedback to conversion writes", async () => {
    const fetchImpl = vi.fn(async (_input: string | URL, init?: RequestInit) => {
      expect(init?.method).toBe("POST");
      const body = JSON.parse(String(init?.body));
      expect(body.event_type).toBe("public_intel_feedback");
      expect(body.target_id).toBe("digest_1");
      expect(body.label).toBe("useful");
      expect(body.feedback_source).toBe("agent");
      expect(body.automation_level).toBe("autonomous");
      expect(body.agent_run_id).toBe("run_1");
      const headers = new Headers(init?.headers);
      expect(headers.get("idempotency-key")).toBeTruthy();
      return jsonResponse({ status: "accepted_shadow" });
    });
    const client = new TradeOSPublicIntelClient({
      baseUrl: "https://example.test/v1/public-intel",
      fetchImpl,
    });

    const payload = await client.submitDigestFeedback({
      targetType: "digest",
      targetId: "digest_1",
      label: "useful",
      consentForDatasetUse: true,
      feedbackSource: "agent",
      automationLevel: "autonomous",
      agentRunId: "run_1",
    });

    expect(payload.status).toBe("accepted_shadow");
  });

  it("fetches token watchlist snapshots with public query params", async () => {
    const fetchImpl = vi.fn(async (input: string | URL) => {
      const url = new URL(String(input));
      expect(url.pathname).toBe("/v1/public-intel/tokens/VVV/watchlist-snapshot");
      expect(url.searchParams.get("mode")).toBe("trader");
      expect(url.searchParams.get("chain")).toBe("8453");
      return jsonResponse({ schema_version: "tradeos.public_intel.watchlist_snapshot.v1" });
    });
    const client = new TradeOSPublicIntelClient({
      baseUrl: "https://example.test/v1/public-intel",
      fetchImpl,
    });

    const payload = await client.getTokenWatchlistSnapshot("VVV", { mode: "trader", chain: "8453" });

    expect(payload.schema_version).toBe("tradeos.public_intel.watchlist_snapshot.v1");
  });

  it("creates watchlists with account auth and app attribution header", async () => {
    const fetchImpl = vi.fn(async (_input: string | URL, init?: RequestInit) => {
      expect(init?.method).toBe("POST");
      const headers = new Headers(init?.headers);
      expect(headers.get("authorization")).toBe("Bearer acct_token");
      expect(headers.get("x-tradeos-public-intel-key")).toBe("tos_pub_test");
      const body = JSON.parse(String(init?.body));
      expect(body.name).toBe("Portfolio risk");
      expect(body.mode).toBe("investor");
      return jsonResponse({ watchlist: { watchlist_id: "wl_1" } });
    });
    const client = new TradeOSPublicIntelClient({
      baseUrl: "https://example.test/v1/public-intel",
      apiKey: "tos_pub_test",
      accountToken: "acct_token",
      fetchImpl,
    });

    const payload = await client.createWatchlist({ name: "Portfolio risk" });

    expect((payload.watchlist as { watchlist_id: string }).watchlist_id).toBe("wl_1");
  });

  it("submits watchlist feedback with account auth plus optional app key", async () => {
    const fetchImpl = vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      expect(url.pathname).toBe("/v1/public-intel/watchlists/wl_1/feedback");
      const headers = new Headers(init?.headers);
      expect(headers.get("authorization")).toBe("Bearer acct_token");
      expect(headers.get("x-tradeos-public-intel-key")).toBe("tos_pub_test");
      const body = JSON.parse(String(init?.body));
      expect(body.target_type).toBe("watchlist_event");
      expect(body.target_id).toBe("wle_1");
      expect(body.label).toBe("useful");
      expect(body.notes).toBe("timely alert");
      return jsonResponse({ status: "accepted", feedback_id: "pifb_1" });
    });
    const client = new TradeOSPublicIntelClient({
      baseUrl: "https://example.test/v1/public-intel",
      apiKey: "tos_pub_test",
      accountToken: "acct_token",
      fetchImpl,
    });

    const payload = await client.submitWatchlistFeedback({
      watchlistId: "wl_1",
      targetType: "watchlist_event",
      targetId: "wle_1",
      label: "useful",
      optionalNote: "timely alert",
    });

    expect(payload.feedback_id).toBe("pifb_1");
  });

  it("triggers watchlist deliveries with account auth", async () => {
    const fetchImpl = vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      expect(url.pathname).toBe("/v1/public-intel/watchlists/wl_1/deliveries/trigger");
      const headers = new Headers(init?.headers);
      expect(headers.get("authorization")).toBe("Bearer acct_token");
      expect(headers.get("x-tradeos-public-intel-key")).toBe("tos_pub_test");
      const body = JSON.parse(String(init?.body));
      expect(body.channel_kinds).toEqual(["in_app"]);
      expect(body.min_severity).toBe("watch");
      return jsonResponse({ schema_version: "tradeos.public_intel.watchlist_deliveries.v1", deliveries: [] });
    });
    const client = new TradeOSPublicIntelClient({
      baseUrl: "https://example.test/v1/public-intel",
      apiKey: "tos_pub_test",
      accountToken: "acct_token",
      fetchImpl,
    });

    const payload = await client.triggerWatchlistDeliveries("wl_1", {
      channelKinds: ["in_app"],
      minSeverity: "watch",
    });

    expect(payload.schema_version).toBe("tradeos.public_intel.watchlist_deliveries.v1");
  });

  it("throws typed API errors", async () => {
    const client = new TradeOSPublicIntelClient({
      baseUrl: "https://example.test/v1/public-intel",
      fetchImpl: async () => jsonResponse({ detail: "nope" }, 400),
    });

    await expect(client.getPublicClaimProof("claim_1")).rejects.toBeInstanceOf(TradeOSApiError);
  });

  it("creates deterministic stable IDs for nested values", () => {
    expect(stableId("x", { b: 1, a: { d: 2, c: 3 } })).toBe(
      stableId("x", { a: { c: 3, d: 2 }, b: 1 }),
    );
  });
});

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}
