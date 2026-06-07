import { describe, expect, it } from "vitest";
import {
  InMemoryKillSwitch,
  createApprovalRequest,
  decideApproval,
  evaluateFeasibilityIntent,
  normalizeIntentActionability,
} from "../src/index.js";

describe("policy-core", () => {
  it("emits quality-only feasibility when account gates are unavailable", () => {
    const verdict = evaluateFeasibilityIntent({
      symbol: "VVV",
      side: "LONG",
      signal_type: "momentum",
      created_at: new Date().toISOString(),
    });

    expect(verdict.verdict).toBe("APPROVED");
    expect(verdict.account_gates_applied).toBe(false);
    expect(verdict.recommended_size_usd).toBe(0);
  });

  it("sizes down with account gates and drawdown scalar", () => {
    const verdict = evaluateFeasibilityIntent(
      {
        symbol: "VVV",
        side: "LONG",
        signal_type: "momentum",
        confidence: 0.8,
        proposed_notional_usd: 2_000,
        created_at: new Date().toISOString(),
      },
      {
        account: {
          balance_usd: 10_000,
          portfolio_value_usd: 9_400,
          peak_portfolio_value_usd: 10_000,
          open_positions: 1,
          current_position_notional_usd: {},
        },
      },
    );

    expect(verdict.account_gates_applied).toBe(true);
    expect(verdict.verdict).toBe("SIZED_DOWN");
    expect(verdict.recommended_size_usd).toBeGreaterThan(0);
    expect(verdict.drawdown_scalar).toBeLessThan(1);
  });

  it("blocks entries while entry-freeze kill switch is active but allows exits", () => {
    const killSwitch = new InMemoryKillSwitch();
    const state = killSwitch.activate("operator_test");

    expect(
      normalizeIntentActionability(
        { symbol: "VVV", verdict: "APPROVED", account_gates_applied: true },
        { killSwitch: state },
      ).reason,
    ).toBe("kill_switch_entry_freeze");

    expect(
      normalizeIntentActionability(
        { symbol: "VVV", type: "exit_intent", verdict: "APPROVED", account_gates_applied: false },
        { killSwitch: state },
      ).actionable,
    ).toBe(true);
  });

  it("creates operator approvals", () => {
    const request = createApprovalRequest({ target_id: "rec_1", action: "paper_execute", summary: "Test" });
    const result = decideApproval(request, "approved", { operator_id: "op_1" });

    expect(result.request.status).toBe("approved");
    expect(result.decision.operator_id).toBe("op_1");
  });
});

