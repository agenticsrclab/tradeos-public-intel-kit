import { createHash, randomUUID } from "node:crypto";
import type {
  FeasibilityIntent,
  FeasibilityPolicy,
  FeasibilityVerdict,
  KillSwitchState,
  LocalAccountState,
} from "./types.js";
import { killSwitchBlocksIntent } from "./kill-switch.js";

export const DEFAULT_FEASIBILITY_POLICY: FeasibilityPolicy = {
  blocked_assets: [],
  allowed_signal_types: ["*"],
  min_balance_usd: 1_000,
  max_daily_loss_usd: 500,
  max_open_positions: 10,
  max_position_size_usd: 2_500,
  max_single_trade_pct: 0.05,
  max_single_position_pct: 0.2,
  max_leverage: 3,
  max_cost_pct: 0.005,
  kelly_fraction: 0.5,
  drawdown_scalar_start: 0.05,
  drawdown_scalar_zero: 0.12,
  signal_ttl_seconds: {
    scalping: 300,
    momentum: 1_800,
    mean_reversion: 3_600,
    investor: 86_400,
    default: 3_600,
  },
};

export function evaluateFeasibilityIntent(
  intent: FeasibilityIntent,
  options: {
    account?: LocalAccountState;
    policy?: Partial<FeasibilityPolicy>;
    killSwitch?: KillSwitchState;
    now?: Date;
  } = {},
): FeasibilityVerdict {
  const now = options.now ?? new Date();
  const policy = { ...DEFAULT_FEASIBILITY_POLICY, ...options.policy };
  const intentId = intent.intent_id ?? deterministicIntentId(intent);
  const symbol = normalizeSymbol(intent.symbol);
  const reasons: string[] = [];
  const kill = killSwitchBlocksIntent(options.killSwitch, { is_exit: intent.is_exit });

  if (kill.blocked) {
    return rejected(intentId, symbol, "kill_switch_active", [kill.reason], true, now);
  }
  const staleReason = staleIntentReason(intent, policy, now);
  if (staleReason) {
    return rejected(intentId, symbol, staleReason, [staleReason], false, now);
  }
  if (policy.blocked_assets.map(normalizeSymbol).includes(symbol)) {
    return rejected(intentId, symbol, "blocked_asset", ["Symbol is blocked by local policy."], true, now);
  }
  if (!signalTypeAllowed(intent.signal_type ?? intent.strategy_layer ?? "", policy.allowed_signal_types)) {
    return rejected(intentId, symbol, "signal_type_not_allowed", ["Signal type is not allowed by local policy."], true, now);
  }
  if (!options.account) {
    return {
      schema_version: "tradeos.policy.feasibility_verdict.v1",
      intent_id: intentId,
      symbol,
      verdict: "APPROVED",
      account_gates_applied: false,
      recommended_size_usd: 0,
      kelly_fraction: 0,
      drawdown_scalar: 1,
      vol_scalar: 1,
      rejection_reason: "",
      reasons: ["Tier 1 quality gates passed; account gates were not applied."],
      created_at: now.toISOString(),
    };
  }

  const account = options.account;
  if (account.balance_usd < policy.min_balance_usd) {
    return rejected(intentId, symbol, "min_balance", ["Balance is below local minimum."], true, now);
  }
  if ((account.daily_pnl ?? 0) <= -policy.max_daily_loss_usd) {
    return rejected(intentId, symbol, "daily_loss_limit_exceeded", ["Daily PnL breached local max loss."], true, now);
  }
  if ((account.open_positions ?? 0) >= policy.max_open_positions && !intent.is_exit) {
    return rejected(intentId, symbol, "max_open_positions", ["Open-position count reached local cap."], true, now);
  }
  if ((account.current_leverage ?? 0) >= policy.max_leverage && !intent.is_exit) {
    return rejected(intentId, symbol, "max_leverage", ["Current leverage reached local cap."], true, now);
  }

  const costPct = (intent.estimated_cost_bps ?? 0) / 10_000;
  if (costPct > policy.max_cost_pct) {
    return rejected(intentId, symbol, "pre_trade_cost", ["Estimated cost exceeds local max cost."], true, now);
  }

  const maxByTrade = account.balance_usd * policy.max_single_trade_pct;
  const requested = Math.max(0, intent.proposed_notional_usd ?? maxByTrade);
  const currentSymbolNotional = Math.abs(account.current_position_notional_usd?.[symbol] ?? 0);
  const symbolRoom = Math.max(0, account.balance_usd * policy.max_single_position_pct - currentSymbolNotional);
  const cap = Math.min(policy.max_position_size_usd, maxByTrade, symbolRoom || maxByTrade, requested || maxByTrade);
  const drawdownScalar = computeDrawdownScalar(account, policy);
  const volScalar = computeVolScalar(account.realized_vol_30d?.[symbol]);
  const confidence = clamp(intent.confidence ?? 0.5, 0.05, 1);
  const edgeScalar = clamp(((intent.expected_edge_bps ?? 25) / 100), 0.1, 1);
  const kelly = clamp(policy.kelly_fraction * confidence * edgeScalar, 0, 1);
  const recommended = round2(Math.max(0, cap * kelly * drawdownScalar * volScalar));

  if (recommended <= 0 && !intent.is_exit) {
    return rejected(intentId, symbol, "no_position_room", ["No remaining local position room."], true, now);
  }

  if (recommended < requested && !intent.is_exit) {
    reasons.push("Local policy sized down the proposed notional.");
  }

  return {
    schema_version: "tradeos.policy.feasibility_verdict.v1",
    intent_id: intentId,
    symbol,
    verdict: reasons.length > 0 ? "SIZED_DOWN" : "APPROVED",
    account_gates_applied: true,
    recommended_size_usd: intent.is_exit ? 0 : recommended,
    kelly_fraction: round4(kelly),
    drawdown_scalar: round4(drawdownScalar),
    vol_scalar: round4(volScalar),
    rejection_reason: "",
    reasons: reasons.length ? reasons : ["Tier 1 and Tier 2 gates passed."],
    created_at: now.toISOString(),
  };
}

function rejected(
  intentId: string,
  symbol: string,
  reason: string,
  reasons: string[],
  accountGatesApplied: boolean,
  now: Date,
): FeasibilityVerdict {
  return {
    schema_version: "tradeos.policy.feasibility_verdict.v1",
    intent_id: intentId,
    symbol,
    verdict: "REJECTED",
    account_gates_applied: accountGatesApplied,
    recommended_size_usd: 0,
    kelly_fraction: 0,
    drawdown_scalar: 1,
    vol_scalar: 1,
    rejection_reason: reason,
    reasons,
    created_at: now.toISOString(),
  };
}

function staleIntentReason(intent: FeasibilityIntent, policy: FeasibilityPolicy, now: Date): string {
  if (!intent.created_at) {
    return "";
  }
  const created = new Date(intent.created_at);
  if (!Number.isFinite(created.getTime())) {
    return "invalid_created_at";
  }
  const layer = String(intent.strategy_layer ?? intent.signal_type ?? "default").toLowerCase();
  const ttl = policy.signal_ttl_seconds[layer] ?? policy.signal_ttl_seconds.default ?? 3_600;
  return now.getTime() - created.getTime() > ttl * 1000 ? "signal_ttl_expired" : "";
}

function signalTypeAllowed(signalType: string, allowed: string[]): boolean {
  if (allowed.includes("*")) {
    return true;
  }
  return allowed.map((item) => item.toLowerCase()).includes(signalType.toLowerCase());
}

function computeDrawdownScalar(account: LocalAccountState, policy: FeasibilityPolicy): number {
  const value = account.portfolio_value_usd ?? account.balance_usd;
  const peak = account.peak_portfolio_value_usd ?? value;
  if (peak <= 0 || value >= peak) {
    return 1;
  }
  const drawdown = (peak - value) / peak;
  if (drawdown <= policy.drawdown_scalar_start) {
    return 1;
  }
  if (drawdown >= policy.drawdown_scalar_zero) {
    return 0;
  }
  const span = policy.drawdown_scalar_zero - policy.drawdown_scalar_start;
  return clamp(1 - (drawdown - policy.drawdown_scalar_start) / span, 0, 1);
}

function computeVolScalar(realizedVol: number | undefined): number {
  if (!realizedVol || realizedVol <= 0) {
    return 1;
  }
  if (realizedVol <= 0.6) {
    return 1;
  }
  return clamp(0.6 / realizedVol, 0.25, 1);
}

function deterministicIntentId(intent: FeasibilityIntent): string {
  const raw = JSON.stringify({
    signal_id: intent.signal_id ?? "",
    symbol: intent.symbol,
    side: intent.side,
    created_at: intent.created_at ?? "",
  });
  const digest = createHash("sha256").update(raw).digest("hex").slice(0, 16);
  return `intent_${digest || randomUUID()}`;
}

function normalizeSymbol(symbol: string): string {
  return symbol.trim().replace(/\s+/g, "").toUpperCase();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

