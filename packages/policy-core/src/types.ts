export type IntentVerdict = "APPROVED" | "SIZED_DOWN" | "REJECTED" | "OPERATOR_APPROVED";
export type IntentSide = "LONG" | "SHORT" | "BUY" | "SELL" | "TRIM" | "HOLD" | string;
export type KillSwitchScope = "entry_freeze" | "full_freeze";

export interface KillSwitchState {
  active: boolean;
  scope: KillSwitchScope;
  reason: string;
  activated_at?: string;
  expires_at?: string;
}

export interface LocalAccountState {
  balance_usd: number;
  available_margin?: number;
  daily_pnl?: number;
  open_positions?: number;
  portfolio_value_usd?: number;
  peak_portfolio_value_usd?: number;
  current_gross_exposure_usd?: number;
  current_leverage?: number;
  current_position_notional_usd?: Record<string, number>;
  current_venue_exposure_usd?: Record<string, number>;
  realized_vol_30d?: Record<string, number>;
}

export interface FeasibilityPolicy {
  blocked_assets: string[];
  allowed_signal_types: string[];
  min_balance_usd: number;
  max_daily_loss_usd: number;
  max_open_positions: number;
  max_position_size_usd: number;
  max_single_trade_pct: number;
  max_single_position_pct: number;
  max_leverage: number;
  max_cost_pct: number;
  kelly_fraction: number;
  drawdown_scalar_start: number;
  drawdown_scalar_zero: number;
  signal_ttl_seconds: Record<string, number>;
}

export interface FeasibilityIntent {
  intent_id?: string;
  signal_id?: string;
  symbol: string;
  side: IntentSide;
  signal_type?: string;
  strategy_layer?: string;
  confidence?: number;
  expected_edge_bps?: number;
  proposed_notional_usd?: number;
  estimated_cost_bps?: number;
  created_at?: string;
  is_exit?: boolean;
}

export interface FeasibilityVerdict {
  schema_version: "tradeos.policy.feasibility_verdict.v1";
  intent_id: string;
  symbol: string;
  verdict: IntentVerdict;
  account_gates_applied: boolean;
  recommended_size_usd: number;
  kelly_fraction: number;
  drawdown_scalar: number;
  vol_scalar: number;
  rejection_reason: string;
  reasons: string[];
  created_at: string;
}

// Internal local/paper compatibility shape. Public builder-facing handoff should
// use `tradeos.action_intent.v1`, which is non-executable and review-required.
export interface ExecutionIntent {
  intent_id?: string;
  type?: string;
  symbol: string;
  side?: IntentSide;
  verdict?: string;
  account_gates_applied?: boolean | string;
  recommended_size_usd?: number | string;
  source?: string;
  is_exit?: boolean;
}

export interface ActionabilityDecision {
  actionable: boolean;
  canonical_verdict: string;
  reason: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";

export interface ApprovalRequest {
  approval_id: string;
  target_id: string;
  action: string;
  summary: string;
  status: ApprovalStatus;
  requested_at: string;
  expires_at?: string;
}

export interface ApprovalDecision {
  approval_id: string;
  status: "approved" | "rejected";
  decided_at: string;
  operator_id?: string;
  reason?: string;
}
