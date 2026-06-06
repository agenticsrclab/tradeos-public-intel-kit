import type {
  ClaimOutcomeFeedback,
  JsonObject,
  PublicFeedback,
  ThesisFeedback,
  TradeOSPublicIntelClient,
} from "@tradeos/public-intel-sdk";
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
  };
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

