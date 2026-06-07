import type {
  ClaimOutcomeFeedback,
  JsonObject,
  PublicFeedback,
  ThesisFeedback,
  TradeOSPublicIntelClient,
  WatchlistDeliveryTrigger,
  WatchlistFeedback,
} from "@tradeos/public-intel-sdk";
import {
  buildBotPreflightResponse,
  buildEvidenceBundle,
  buildRecommendationCard,
  buildSymbolCockpitPacket,
} from "@tradeos/cockpit-core";
import { jsonText, safetyEnvelope } from "./format.js";

export interface ToolHandlerContext {
  client: TradeOSPublicIntelClient;
}

export function createToolHandlers({ client }: ToolHandlerContext) {
  return {
    async getMarketDigest(args: { limit?: number; chainId?: string; windowStart?: string; windowEnd?: string }) {
      const payload = await client.getMarketDigest(args);
      return jsonText(safetyEnvelope(payload));
    },

    async getPublicCandidates(args: { limit?: number; chainId?: string; since?: string }) {
      const payload = await client.getPublicCandidates(args);
      return jsonText(safetyEnvelope(payload));
    },

    async getThesisWatchlist(args: { limit?: number; chainId?: string }) {
      const payload = await client.getThesisWatchlist(args);
      return jsonText(safetyEnvelope(payload));
    },

    async getSymbolThesis(args: { symbol?: string; thesisId?: string; chainId?: string; limit?: number }) {
      if (args.thesisId) {
        return jsonText(safetyEnvelope(await client.getThesis(args.thesisId)));
      }
      const symbol = (args.symbol ?? "").trim().toUpperCase();
      if (!symbol) {
        return jsonText({ error: "symbol or thesisId is required" });
      }
      const watchlist = await client.getThesisWatchlist({ chainId: args.chainId, limit: args.limit ?? 100 });
      const items = Array.isArray(watchlist.watchlist) ? watchlist.watchlist : [];
      const matches = items.filter((item) => isRecord(item) && String(item.symbol ?? "").toUpperCase() === symbol);
      return jsonText(
        safetyEnvelope({
          schema_version: "tradeos.public_intel.symbol_thesis_lookup.v1",
          symbol,
          matches,
          count: matches.length,
        }),
      );
    },

    async getEvidencePacket(args: { packetId?: string; symbol?: string; chainId?: string; limit?: number }) {
      const digest = await client.getMarketDigest({ chainId: args.chainId, limit: args.limit ?? 25 });
      const items = isRecord(digest.digest) && Array.isArray(digest.digest.items) ? digest.digest.items : [];
      const packetId = (args.packetId ?? "").trim();
      const symbol = (args.symbol ?? "").trim().toUpperCase();
      const matches = items.filter((item) => {
        if (!isRecord(item)) {
          return false;
        }
        const editor = isRecord(item.intelligence_editor) ? item.intelligence_editor : {};
        const itemPacket = String(editor.packet_id ?? "");
        const itemSymbol = String(item.symbol ?? "").toUpperCase();
        return (packetId && itemPacket === packetId) || (symbol && itemSymbol === symbol);
      });
      return jsonText(
        safetyEnvelope({
          schema_version: "tradeos.public_intel.evidence_packet_lookup.v1",
          packet_id: packetId,
          symbol,
          matches,
          count: matches.length,
        }),
      );
    },

    async getPublicClaimProof(args: { publicClaimId: string }) {
      return jsonText(safetyEnvelope(await client.getPublicClaimProof(args.publicClaimId)));
    },

    async getThesisFeedback(args: {
      sourceService?: string;
      thesisType?: string;
      subject?: string;
      horizonSeconds?: number;
    }) {
      return jsonText(safetyEnvelope(await client.getThesisFeedback(args)));
    },

    async getWatchlistCapabilities() {
      return jsonText(safetyEnvelope(await client.getWatchlistCapabilities()));
    },

    async getTokenWatchlistSnapshot(args: {
      tokenRef: string;
      mode?: "investor" | "swing" | "trader";
      chain?: string;
      contractAddress?: string;
      limit?: number;
    }) {
      return jsonText(
        safetyEnvelope(
          await client.getTokenWatchlistSnapshot(args.tokenRef, {
            mode: args.mode,
            chain: args.chain,
            contractAddress: args.contractAddress,
            limit: args.limit,
          }),
        ),
      );
    },

    async getSymbolCockpit(args: {
      symbol: string;
      chain?: string;
      mode?: "investor" | "swing" | "trader";
      contractAddress?: string;
    }) {
      const evidence = await client.getSymbolCockpitEvidence(args.symbol, {
        chain: args.chain,
        mode: args.mode,
        contractAddress: args.contractAddress,
      });
      const packet = buildSymbolCockpitPacket(
        {
          symbol: args.symbol,
          chain: args.chain,
          mode: args.mode,
          contractAddress: args.contractAddress,
          recommendationType: "symbol_cockpit",
        },
        buildEvidenceBundle(
          { symbol: args.symbol, chain: args.chain, mode: args.mode },
          asJsonObjectRecord(evidence.sources),
          asStringRecord(evidence.source_errors),
        ),
      );
      return jsonText(
        safetyEnvelope(({
          schema_version: "tradeos.public_intel.mcp_symbol_cockpit.v1",
          packet,
          card: buildRecommendationCard(packet),
          source_errors: asJsonObject(evidence.source_errors),
        }) as unknown as JsonObject),
      );
    },

    async botPreflight(args: {
      symbol: string;
      chain?: string;
      proposedAction: "buy" | "sell" | "trim" | "hold" | "watch" | string;
      proposedNotionalUsd?: number;
    }) {
      const evidence = await client.getSymbolCockpitEvidence(args.symbol, {
        chain: args.chain,
        mode: "trader",
      });
      const packet = buildSymbolCockpitPacket(
        {
          symbol: args.symbol,
          chain: args.chain,
          mode: "trader",
          recommendationType: "trade_preflight",
        },
        buildEvidenceBundle(
          { symbol: args.symbol, chain: args.chain, mode: "trader", recommendationType: "trade_preflight" },
          asJsonObjectRecord(evidence.sources),
          asStringRecord(evidence.source_errors),
        ),
      );
      return jsonText(
        safetyEnvelope(({
          schema_version: "tradeos.public_intel.mcp_bot_preflight.v1",
          preflight: buildBotPreflightResponse(
            {
              symbol: args.symbol,
              chain: args.chain,
              proposed_action: args.proposedAction,
              proposed_notional_usd: args.proposedNotionalUsd,
            },
            packet,
          ),
          packet,
          source_errors: asJsonObject(evidence.source_errors),
        }) as unknown as JsonObject),
      );
    },

    async listWatchlists() {
      return jsonText(safetyEnvelope(await client.listWatchlists()));
    },

    async createWatchlist(args: { name: string; mode?: "investor" | "swing" | "trader"; description?: string }) {
      return jsonText(
        safetyEnvelope(
          await client.createWatchlist({
            name: args.name,
            mode: args.mode,
            description: args.description,
          }),
        ),
      );
    },

    async addWatchlistItem(args: {
      watchlistId: string;
      symbol: string;
      chain?: string;
      contractAddress?: string;
      notes?: string;
    }) {
      return jsonText(
        safetyEnvelope(
          await client.addWatchlistItem(args.watchlistId, {
            symbol: args.symbol,
            chain: args.chain,
            contractAddress: args.contractAddress,
            notes: args.notes,
          }),
        ),
      );
    },

    async getWatchlistState(args: { watchlistId: string }) {
      return jsonText(safetyEnvelope(await client.getWatchlistState(args.watchlistId)));
    },

    async listWatchlistEvents(args: { watchlistId: string; limit?: number }) {
      return jsonText(safetyEnvelope(await client.listWatchlistEvents(args.watchlistId, { limit: args.limit })));
    },

    async listWatchlistDeliveries(args: { watchlistId: string; limit?: number }) {
      return jsonText(safetyEnvelope(await client.listWatchlistDeliveries(args.watchlistId, { limit: args.limit })));
    },

    async triggerWatchlistDeliveries(args: WatchlistDeliveryTrigger & { watchlistId: string }) {
      const { watchlistId, ...request } = args;
      return jsonText(safetyEnvelope(await client.triggerWatchlistDeliveries(watchlistId, request)));
    },

    async getCreditState(args: { anonymousSessionIdOrUserId?: string }) {
      return jsonText({
        schema_version: "tradeos.public_intel.credit_state.v1",
        status: "not_available",
        anonymous_session_id_or_user_id: args.anonymousSessionIdOrUserId ?? "",
        note:
          "A durable credit-state endpoint is not exposed in this kit yet. Feedback write tools attach stable target IDs so credits can be reconciled when the feedback-credit service is enabled.",
      });
    },

    async submitThesisFeedback(args: ThesisFeedback) {
      return jsonText(safetyEnvelope(await client.submitThesisFeedback(args)));
    },

    async submitClaimOutcomeFeedback(args: ClaimOutcomeFeedback) {
      return jsonText(safetyEnvelope(await client.submitClaimOutcomeFeedback(args)));
    },

    async submitDigestFeedback(args: PublicFeedback) {
      return jsonText(safetyEnvelope(await client.submitDigestFeedback(args)));
    },

    async submitWatchlistFeedback(args: WatchlistFeedback) {
      return jsonText(safetyEnvelope(await client.submitWatchlistFeedback(args)));
    },
  };
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asJsonObject(value: unknown): JsonObject {
  return isRecord(value) ? value : {};
}

function asJsonObjectRecord(value: unknown): Record<string, JsonObject> {
  if (!isRecord(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, JsonObject] => isRecord(entry[1])),
  );
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, String(item)]));
}
