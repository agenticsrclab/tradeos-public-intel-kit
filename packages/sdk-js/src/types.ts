export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export interface TradeOSPublicIntelClientOptions {
  baseUrl?: string;
  apiKey?: string;
  accountToken?: string;
  appName?: string;
  appVersion?: string;
  fetchImpl?: FetchLike;
}

export interface RequestOptions {
  idempotencyKey?: string;
  requestId?: string;
  authToken?: string;
  headers?: Record<string, string>;
}

export interface AccountRequestOptions {
  accountToken?: string;
  headers?: Record<string, string>;
}

export interface PublicIntelAppKeyCreate {
  appName: string;
  scopes?: string[];
  expiresAt?: string;
}

export interface PublicIntelQuotaRequest {
  projectName: string;
  projectUrl?: string;
  appKeyId?: string;
  requestedTier?: "earned_extension" | "reviewed_project" | "paid_eval" | string;
  useCase: string;
  expectedDailyReads?: number;
  expectedSymbolsPerDay?: number;
  monetizationModel?: string;
  feedbackPlan?: string;
  paidIntent?: string;
}

export type FeedbackActivityStatus = "all" | "pending" | "accepted" | "rejected" | "suppressed" | string;
export type FeedbackActivitySource =
  | "all"
  | "human"
  | "human_assisted"
  | "agent"
  | "automation"
  | "hybrid"
  | "unspecified"
  | string;

export interface FeedbackActivityQuery {
  keyId?: string;
  status?: FeedbackActivityStatus;
  source?: FeedbackActivitySource;
  limit?: number;
}

export type AppFeedbackStatusQuery = Omit<FeedbackActivityQuery, "keyId">;

export interface ListQuery {
  limit?: number;
  chainId?: string;
  since?: string;
  windowStart?: string;
  windowEnd?: string;
}

export interface ThesisFeedbackQuery {
  sourceService?: string;
  thesisType?: string;
  subject?: string;
  horizonSeconds?: number;
}

export type WatchlistMode = "investor" | "swing" | "trader";
export type WatchlistSeverity = "info" | "watch" | "warning" | "critical";

export interface WatchlistSnapshotQuery {
  mode?: WatchlistMode;
  chain?: string;
  contractAddress?: string;
  limit?: number;
}

export interface SymbolCockpitEvidenceQuery {
  mode?: WatchlistMode;
  chain?: string;
  contractAddress?: string;
  digestLimit?: number;
  candidateLimit?: number;
  watchlistLimit?: number;
}

export interface WatchlistCreate {
  name: string;
  mode?: WatchlistMode;
  description?: string;
  settings?: JsonObject;
}

export interface WatchlistUpdate {
  name?: string;
  mode?: WatchlistMode;
  description?: string;
  settings?: JsonObject;
  archived?: boolean;
}

export interface WatchlistItemCreate {
  symbol: string;
  chain?: string;
  contractAddress?: string;
  assetNamespace?: string;
  sourceRef?: string;
  identityConfidence?: number;
  notes?: string;
  metadata?: JsonObject;
}

export interface WatchlistNotificationChannelCreate {
  channelKind: "in_app" | "email" | "webhook" | "telegram" | "discord" | string;
  target: string;
  minSeverity?: WatchlistSeverity;
  digestFrequency?: "realtime" | "daily" | "weekly" | "disabled" | string;
  enabled?: boolean;
  metadata?: JsonObject;
}

export interface WatchlistDeliveryTrigger {
  eventIds?: string[];
  channelKinds?: string[];
  minSeverity?: WatchlistSeverity;
  maxEvents?: number;
  dryRun?: boolean;
  force?: boolean;
}

export type FeedbackLabel =
  | "useful"
  | "not_useful"
  | "too_early"
  | "too_late"
  | "false_positive"
  | "missed_move"
  | "confusing_explanation"
  | "evidence_too_thin"
  | "state_still_pressing"
  | "state_rebounded"
  | "state_stabilized"
  | "state_uncertain";

export interface PublicFeedback {
  targetType: "digest" | "candidate" | "thesis" | "claim" | "evidence_packet" | string;
  targetId: string;
  label: FeedbackLabel | string;
  optionalNote?: string;
  consentForDatasetUse?: boolean;
  anonymousSessionIdOrUserId?: string;
  clientApp?: string;
  clientVersion?: string;
  sourceSnapshotRefs?: string[];
  occurredAt?: string;
  feedbackSource?: "human" | "human_assisted" | "agent" | "automation" | "hybrid" | string;
  automationLevel?: "none" | "assisted" | "automated" | "autonomous" | string;
  agentId?: string;
  agentRunId?: string;
  agentModel?: string;
  agentConfidence?: number;
  provenanceNote?: string;
}

export interface ThesisFeedback extends PublicFeedback {
  targetType: "thesis";
  thesisId: string;
  thesisType?: string;
  subject?: string;
  chainId?: string;
  outcomeScore?: number;
}

export interface ClaimOutcomeFeedback extends PublicFeedback {
  targetType: "claim";
  publicClaimId: string;
  outcomeId?: string;
  outcomeClass?: string;
  outcomeScore?: number;
}

export interface WatchlistFeedback extends PublicFeedback {
  targetType: "watchlist_event" | "watchlist_driver" | string;
  watchlistId: string;
  eventId?: string;
  notes?: string;
}

export interface TradeOSApiErrorBody {
  detail?: unknown;
  message?: string;
  [key: string]: unknown;
}
