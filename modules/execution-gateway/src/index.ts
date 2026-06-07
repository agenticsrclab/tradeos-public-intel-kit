import { createHash, randomUUID } from "node:crypto";
import { normalizeIntentActionability } from "@tradeos/policy-core";
import type { ExecutionIntent, KillSwitchState } from "@tradeos/policy-core";

export interface PaperExecutionOrder extends ExecutionIntent {
  order_id?: string;
  symbol: string;
  side: string;
  mode?: "paper" | "live";
  limit_price?: number;
  requested_notional_usd?: number;
}

export interface PaperFill {
  fill_id: string;
  order_id: string;
  symbol: string;
  side: string;
  venue: "paper";
  notional_usd: number;
  price: number;
  slippage_bps: number;
  fee_usd: number;
  created_at: string;
}

export interface PaperExecutionResult {
  schema_version: "tradeos.module.execution_gateway.paper_result.v1";
  accepted: boolean;
  status: "filled" | "rejected";
  reason: string;
  order_id: string;
  fill?: PaperFill;
}

export class PaperExecutionGateway {
  private killSwitch?: KillSwitchState;
  readonly fills: PaperFill[] = [];

  constructor(options: { killSwitch?: KillSwitchState } = {}) {
    this.killSwitch = options.killSwitch;
  }

  setKillSwitch(killSwitch: KillSwitchState | undefined): void {
    this.killSwitch = killSwitch;
  }

  health() {
    return {
      schema_version: "tradeos.module.execution_gateway.health.v1",
      status: "ok",
      mode: "paper",
      fills: this.fills.length,
      live_execution_enabled: false,
    };
  }

  submit(order: PaperExecutionOrder, now = new Date()): PaperExecutionResult {
    const orderId = order.order_id ?? `paper_order_${randomUUID()}`;
    if ((order as { schema_version?: string }).schema_version === "tradeos.action_intent.v1") {
      return rejected(orderId, "action_intent_non_executable");
    }
    if (order.mode === "live") {
      return rejected(orderId, "live_execution_disabled");
    }
    const actionability = normalizeIntentActionability(
      {
        ...order,
        type: order.type ?? "trade_intent",
        recommended_size_usd: order.recommended_size_usd ?? order.requested_notional_usd,
      },
      { killSwitch: this.killSwitch, requireAccountGates: true },
    );
    if (!actionability.actionable) {
      return rejected(orderId, actionability.reason);
    }

    const notional = numberFrom(order.recommended_size_usd ?? order.requested_notional_usd, 0);
    if (notional <= 0 && String(order.type ?? "").toLowerCase() !== "exit_intent") {
      return rejected(orderId, "non_positive_notional");
    }
    const price = Math.max(0.000001, order.limit_price ?? defaultPriceForSymbol(order.symbol));
    const slippageBps = deterministicSlippageBps(orderId, order.symbol, order.side);
    const feeUsd = Math.round(notional * 0.0005 * 100) / 100;
    const fill: PaperFill = {
      fill_id: `paper_fill_${createHash("sha256").update(orderId).digest("hex").slice(0, 16)}`,
      order_id: orderId,
      symbol: order.symbol.toUpperCase(),
      side: order.side,
      venue: "paper",
      notional_usd: Math.round(notional * 100) / 100,
      price: Math.round(price * (1 + adverseSide(order.side) * slippageBps / 10_000) * 1_000_000) / 1_000_000,
      slippage_bps: slippageBps,
      fee_usd: feeUsd,
      created_at: now.toISOString(),
    };
    this.fills.push(fill);
    return {
      schema_version: "tradeos.module.execution_gateway.paper_result.v1",
      accepted: true,
      status: "filled",
      reason: "paper_fill",
      order_id: orderId,
      fill,
    };
  }
}

function rejected(orderId: string, reason: string): PaperExecutionResult {
  return {
    schema_version: "tradeos.module.execution_gateway.paper_result.v1",
    accepted: false,
    status: "rejected",
    reason,
    order_id: orderId,
  };
}

function deterministicSlippageBps(orderId: string, symbol: string, side: string): number {
  const digest = createHash("sha256").update(`${orderId}|${symbol}|${side}|paper`).digest();
  return Math.round((digest[0] / 255) * 12 * 100) / 100;
}

function adverseSide(side: string): number {
  const lower = side.toLowerCase();
  return lower.includes("sell") || lower.includes("short") || lower.includes("trim") ? -1 : 1;
}

function defaultPriceForSymbol(symbol: string): number {
  const digest = createHash("sha256").update(symbol.toUpperCase()).digest();
  return Math.max(0.01, Math.round((digest[0] + 1) * 100) / 100);
}

function numberFrom(value: unknown, fallback: number): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}
