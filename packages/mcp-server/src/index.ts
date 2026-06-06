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

await server.connect(new StdioServerTransport());
