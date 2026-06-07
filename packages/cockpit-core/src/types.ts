export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type WatchlistMode = "investor" | "swing" | "trader";

export type PrivacyMode =
  | "public_intel"
  | "private_local"
  | "attributed_feedback"
  | "paid_private_intelligence";

export type CockpitVerdict =
  | "buy_candidate"
  | "watch"
  | "avoid_new_long"
  | "trim_or_reduce"
  | "exit_or_sell_candidate"
  | "insufficient_evidence";

export type CockpitAction =
  | "review_for_entry"
  | "watch_for_recovery"
  | "avoid_new_long"
  | "trim_or_tighten_risk"
  | "review_exit"
  | "pass";

export type RecommendationType =
  | "symbol_cockpit"
  | "trade_preflight"
  | "watchlist_scanner"
  | "weekly_thesis_drift";

export interface SymbolCockpitQuery {
  symbol: string;
  chain?: string;
  contractAddress?: string;
  mode?: WatchlistMode;
  horizon?: string;
  privacyMode?: PrivacyMode;
  recommendationType?: RecommendationType;
}

export interface EvidenceRef {
  id: string;
  source: string;
  target?: string;
  freshness?: string;
  url?: string;
}

export interface MarketSnapshot {
  price_usd?: number;
  price_source?: string;
  price_as_of?: string;
  target_price_usd?: number;
  target_price_source?: string;
  target_price_note?: string;
}

export interface RecommendationDrivers {
  good: string[];
  bad: string[];
  ugly: string[];
  next_steps: string[];
}

export interface EvidenceBundle {
  schema_version: "tradeos.cockpit.evidence_bundle.v1";
  symbol: string;
  chain?: string;
  mode: WatchlistMode;
  generated_at: string;
  sources: Record<string, JsonObject>;
  source_errors: Record<string, string>;
}

export interface SymbolCockpitPacket {
  schema_version: "tradeos.symbol_cockpit.packet.v1";
  target_id: string;
  symbol: string;
  chain?: string;
  verdict: CockpitVerdict;
  action: CockpitAction;
  recommendation_type: RecommendationType;
  confidence: number;
  mode: WatchlistMode;
  good: string[];
  bad: string[];
  ugly: string[];
  next_steps: string[];
  evidence_refs: string[];
  evidence: EvidenceRef[];
  limitations: string[];
  privacy_mode: PrivacyMode;
  market_snapshot?: MarketSnapshot;
  generated_at: string;
  source_summary: {
    source_count: number;
    error_count: number;
    matched_items: number;
  };
}

export type RecommendationSeverity = "info" | "watch" | "warning" | "critical";
export type RecommendationStatus = "open" | "approved" | "dismissed" | "feedback_submitted";

export interface RecommendationCard {
  schema_version: "tradeos.symbol_cockpit.recommendation_card.v1";
  card_id: string;
  target_id: string;
  symbol: string;
  chain?: string;
  title: string;
  body: string;
  verdict: CockpitVerdict;
  action: CockpitAction;
  severity: RecommendationSeverity;
  confidence: number;
  evidence_refs: string[];
  evidence?: EvidenceRef[];
  drivers?: RecommendationDrivers;
  market_snapshot?: MarketSnapshot;
  feedback_target: {
    target_type: "cockpit_recommendation";
    target_id: string;
    url?: string;
  };
  feedback_url?: string;
  status: RecommendationStatus;
  created_at: string;
}

export interface BotPreflightRequest {
  bot_id?: string;
  run_id?: string;
  symbol: string;
  chain?: string;
  proposed_action: "buy" | "sell" | "trim" | "hold" | "watch" | string;
  proposed_notional_usd?: number;
  local_risk_notes?: string[];
}

export interface BotPreflightResponse {
  schema_version: "tradeos.symbol_cockpit.bot_preflight.v1";
  preflight_id: string;
  allowed: boolean;
  decision: "approve" | "avoid" | "watch" | "insufficient_evidence" | "review";
  reason: string;
  cockpit: SymbolCockpitPacket;
  evidence_refs: string[];
  next_steps: string[];
  created_at: string;
}

export interface ActionRecipe {
  id: string;
  title: string;
  mode: WatchlistMode | "all";
  recommendation_type: RecommendationType;
  trigger: string;
  default_severity: RecommendationSeverity;
}
