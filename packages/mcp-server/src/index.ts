#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TradeOSPublicIntelClient } from "@tradeos/public-intel-sdk";
import { z } from "zod";
import { createToolHandlers } from "./tools.js";

const server = new McpServer({
  name: "tradeos-public-intel",
  version: "0.1.0",
});

const client = new TradeOSPublicIntelClient();
const tools = createToolHandlers({ client });

const feedbackProvenanceInputSchema = {
  feedbackSource: z.enum(["human", "human_assisted", "agent", "automation", "hybrid"]).optional(),
  automationLevel: z.enum(["none", "assisted", "automated", "autonomous"]).optional(),
  agentId: z.string().optional(),
  agentRunId: z.string().optional(),
  agentModel: z.string().optional(),
  agentConfidence: z.number().min(0).max(1).optional(),
  provenanceNote: z.string().optional(),
};

server.registerTool(
  "tradeos.get_market_digest",
  {
    title: "Get TradeOS Market Digest",
    description: "Fetch a bounded source-backed TradeOS public market digest.",
    inputSchema: {
      limit: z.number().int().min(1).max(100).optional(),
      chainId: z.string().optional(),
      windowStart: z.string().optional(),
      windowEnd: z.string().optional(),
    },
  },
  tools.getMarketDigest,
);

server.registerTool(
  "tradeos.get_public_candidates",
  {
    title: "Get Public Intelligence Candidates",
    description: "Fetch public digest candidates with source snapshot references.",
    inputSchema: {
      limit: z.number().int().min(1).max(100).optional(),
      chainId: z.string().optional(),
      since: z.string().optional(),
    },
  },
  tools.getPublicCandidates,
);

server.registerTool(
  "tradeos.get_thesis_watchlist",
  {
    title: "Get Thesis Watchlist",
    description: "Fetch TradeOS public thesis watchlist entries.",
    inputSchema: {
      limit: z.number().int().min(1).max(100).optional(),
      chainId: z.string().optional(),
    },
  },
  tools.getThesisWatchlist,
);

server.registerTool(
  "tradeos.get_symbol_thesis",
  {
    title: "Get Symbol Thesis",
    description: "Look up thesis records by symbol or direct thesis ID.",
    inputSchema: {
      symbol: z.string().optional(),
      thesisId: z.string().optional(),
      chainId: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
  },
  tools.getSymbolThesis,
);

server.registerTool(
  "tradeos.get_evidence_packet",
  {
    title: "Get Evidence Packet",
    description: "Look up public digest evidence items by intelligence-editor packet ID or symbol.",
    inputSchema: {
      packetId: z.string().optional(),
      symbol: z.string().optional(),
      chainId: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
  },
  tools.getEvidencePacket,
);

server.registerTool(
  "tradeos.get_public_claim_proof",
  {
    title: "Get Public Claim Proof",
    description: "Fetch public claim proof status for a TradeOS public claim ID.",
    inputSchema: {
      publicClaimId: z.string().min(1),
    },
  },
  tools.getPublicClaimProof,
);

server.registerTool(
  "tradeos.get_thesis_feedback",
  {
    title: "Get Thesis Feedback",
    description: "Read latest thesis feedback for a source service, thesis type, subject, and horizon.",
    inputSchema: {
      sourceService: z.string().optional(),
      thesisType: z.string().optional(),
      subject: z.string().optional(),
      horizonSeconds: z.number().int().positive().optional(),
    },
  },
  tools.getThesisFeedback,
);

server.registerTool(
  "tradeos.get_credit_state",
  {
    title: "Get Credit State",
    description: "Return feedback-credit state when available; currently reports endpoint readiness.",
    inputSchema: {
      anonymousSessionIdOrUserId: z.string().optional(),
    },
  },
  tools.getCreditState,
);

server.registerTool(
  "tradeos.watchlist_capabilities",
  {
    title: "Get Watchlist Capabilities",
    description: "Fetch TradeOS watchlist intelligence modes, auth model, endpoints, and delivery status.",
    inputSchema: {},
  },
  tools.getWatchlistCapabilities,
);

server.registerTool(
  "tradeos.get_token_watchlist_snapshot",
  {
    title: "Get Token Watchlist Snapshot",
    description: "Fetch a public bounded watchlist intelligence snapshot for a token.",
    inputSchema: {
      tokenRef: z.string().min(1),
      mode: z.enum(["investor", "swing", "trader"]).optional(),
      chain: z.string().optional(),
      contractAddress: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
  },
  tools.getTokenWatchlistSnapshot,
);

server.registerTool(
  "tradeos.get_symbol_cockpit",
  {
    title: "Get Symbol Cockpit",
    description: "Build a local good/bad/ugly verdict packet from TradeOS public intelligence evidence.",
    inputSchema: {
      symbol: z.string().min(1),
      chain: z.string().optional(),
      mode: z.enum(["investor", "swing", "trader"]).optional(),
      contractAddress: z.string().optional(),
    },
  },
  tools.getSymbolCockpit,
);

server.registerTool(
  "tradeos.bot_preflight",
  {
    title: "Bot Preflight",
    description: "Ask whether a proposed local bot action should approve, avoid, watch, or stop for insufficient evidence.",
    inputSchema: {
      symbol: z.string().min(1),
      chain: z.string().optional(),
      proposedAction: z.string().min(1),
      proposedNotionalUsd: z.number().positive().optional(),
    },
  },
  tools.botPreflight,
);

server.registerTool(
  "tradeos.list_watchlists",
  {
    title: "List User Watchlists",
    description: "List signed-in TradeOS account watchlists. Requires TRADEOS_ACCOUNT_TOKEN.",
    inputSchema: {},
  },
  tools.listWatchlists,
);

server.registerTool(
  "tradeos.create_watchlist",
  {
    title: "Create Watchlist",
    description: "Create an account-owned TradeOS watchlist. Requires TRADEOS_ACCOUNT_TOKEN.",
    inputSchema: {
      name: z.string().min(1),
      mode: z.enum(["investor", "swing", "trader"]).optional(),
      description: z.string().optional(),
    },
  },
  tools.createWatchlist,
);

server.registerTool(
  "tradeos.add_watchlist_item",
  {
    title: "Add Watchlist Item",
    description: "Add a token identity to an account-owned TradeOS watchlist.",
    inputSchema: {
      watchlistId: z.string().min(1),
      symbol: z.string().min(1),
      chain: z.string().optional(),
      contractAddress: z.string().optional(),
      notes: z.string().optional(),
    },
  },
  tools.addWatchlistItem,
);

server.registerTool(
  "tradeos.get_watchlist_state",
  {
    title: "Get Watchlist State",
    description: "Fetch normalized risk, opportunity, thesis, freshness, and driver state for a user watchlist.",
    inputSchema: {
      watchlistId: z.string().min(1),
    },
  },
  tools.getWatchlistState,
);

server.registerTool(
  "tradeos.list_watchlist_events",
  {
    title: "List Watchlist Events",
    description: "List deduped watchlist intelligence events for a user watchlist.",
    inputSchema: {
      watchlistId: z.string().min(1),
      limit: z.number().int().min(1).max(200).optional(),
    },
  },
  tools.listWatchlistEvents,
);

server.registerTool(
  "tradeos.list_watchlist_deliveries",
  {
    title: "List Watchlist Deliveries",
    description: "List delivery audit rows for a user watchlist. Requires TRADEOS_ACCOUNT_TOKEN.",
    inputSchema: {
      watchlistId: z.string().min(1),
      limit: z.number().int().min(1).max(200).optional(),
    },
  },
  tools.listWatchlistDeliveries,
);

server.registerTool(
  "tradeos.trigger_watchlist_deliveries",
  {
    title: "Trigger Watchlist Deliveries",
    description:
      "Evaluate watchlist events against notification channels and write delivery audit rows. Requires TRADEOS_ACCOUNT_TOKEN.",
    inputSchema: {
      watchlistId: z.string().min(1),
      eventIds: z.array(z.string()).optional(),
      channelKinds: z.array(z.string()).optional(),
      minSeverity: z.enum(["info", "watch", "warning", "critical"]).optional(),
      maxEvents: z.number().int().min(1).max(200).optional(),
      dryRun: z.boolean().optional(),
      force: z.boolean().optional(),
    },
  },
  tools.triggerWatchlistDeliveries,
);

server.registerTool(
  "tradeos.submit_thesis_feedback",
  {
    title: "Submit Thesis Feedback",
    description: "Submit structured feedback for a public thesis via the thesis-outcomes write path.",
    inputSchema: {
      targetType: z.literal("thesis"),
      targetId: z.string().min(1),
      thesisId: z.string().min(1),
      label: z.string().min(1),
      optionalNote: z.string().optional(),
      consentForDatasetUse: z.boolean().optional(),
      anonymousSessionIdOrUserId: z.string().optional(),
      clientApp: z.string().optional(),
      clientVersion: z.string().optional(),
      sourceSnapshotRefs: z.array(z.string()).optional(),
      occurredAt: z.string().optional(),
      ...feedbackProvenanceInputSchema,
      thesisType: z.string().optional(),
      subject: z.string().optional(),
      chainId: z.string().optional(),
      outcomeScore: z.number().optional(),
    },
  },
  tools.submitThesisFeedback,
);

server.registerTool(
  "tradeos.submit_claim_outcome_feedback",
  {
    title: "Submit Claim Outcome Feedback",
    description: "Submit structured feedback for a public claim via the claim-outcomes write path.",
    inputSchema: {
      targetType: z.literal("claim"),
      targetId: z.string().min(1),
      publicClaimId: z.string().min(1),
      label: z.string().min(1),
      outcomeId: z.string().optional(),
      outcomeClass: z.string().optional(),
      outcomeScore: z.number().optional(),
      optionalNote: z.string().optional(),
      consentForDatasetUse: z.boolean().optional(),
      anonymousSessionIdOrUserId: z.string().optional(),
      clientApp: z.string().optional(),
      clientVersion: z.string().optional(),
      sourceSnapshotRefs: z.array(z.string()).optional(),
      occurredAt: z.string().optional(),
      ...feedbackProvenanceInputSchema,
    },
  },
  tools.submitClaimOutcomeFeedback,
);

server.registerTool(
  "tradeos.submit_digest_feedback",
  {
    title: "Submit Digest Feedback",
    description: "Submit structured digest or evidence feedback via the conversion feedback path.",
    inputSchema: {
      targetType: z.string().min(1),
      targetId: z.string().min(1),
      label: z.string().min(1),
      optionalNote: z.string().optional(),
      consentForDatasetUse: z.boolean().optional(),
      anonymousSessionIdOrUserId: z.string().optional(),
      clientApp: z.string().optional(),
      clientVersion: z.string().optional(),
      sourceSnapshotRefs: z.array(z.string()).optional(),
      occurredAt: z.string().optional(),
      ...feedbackProvenanceInputSchema,
    },
  },
  tools.submitDigestFeedback,
);

server.registerTool(
  "tradeos.submit_watchlist_feedback",
  {
    title: "Submit Watchlist Feedback",
    description: "Submit feedback for a watchlist event or driver. Requires TRADEOS_ACCOUNT_TOKEN; TRADEOS_PUBLIC_INTEL_KEY adds app attribution.",
    inputSchema: {
      targetType: z.string().min(1),
      targetId: z.string().min(1),
      watchlistId: z.string().min(1),
      label: z.string().min(1),
      eventId: z.string().optional(),
      optionalNote: z.string().optional(),
      sourceSnapshotRefs: z.array(z.string()).optional(),
      occurredAt: z.string().optional(),
      ...feedbackProvenanceInputSchema,
    },
  },
  tools.submitWatchlistFeedback,
);

await server.connect(new StdioServerTransport());
