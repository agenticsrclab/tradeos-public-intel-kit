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

export interface TradeOSApiErrorBody {
  detail?: unknown;
  message?: string;
  [key: string]: unknown;
}
