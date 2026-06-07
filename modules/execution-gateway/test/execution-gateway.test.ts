import { describe, expect, it } from "vitest";
import { PaperExecutionGateway } from "../src/index.js";

describe("PaperExecutionGateway", () => {
  it("fills account-gated paper orders", () => {
    const gateway = new PaperExecutionGateway();
    const result = gateway.submit({
      symbol: "VVV",
      side: "BUY",
      verdict: "APPROVED",
      account_gates_applied: true,
      recommended_size_usd: 100,
    });

    expect(result.accepted).toBe(true);
    expect(result.fill?.venue).toBe("paper");
    expect(gateway.health().fills).toBe(1);
  });

  it("rejects quality-only entries and live execution", () => {
    const gateway = new PaperExecutionGateway();

    expect(
      gateway.submit({
        symbol: "VVV",
        side: "BUY",
        verdict: "APPROVED",
        account_gates_applied: false,
        recommended_size_usd: 100,
      }).reason,
    ).toContain("account_gates_not_applied");

    expect(
      gateway.submit({
        symbol: "VVV",
        side: "BUY",
        mode: "live",
        verdict: "APPROVED",
        account_gates_applied: true,
        recommended_size_usd: 100,
      }).reason,
    ).toBe("live_execution_disabled");
  });

  it("rejects raw action intents because they are non-executable", () => {
    const gateway = new PaperExecutionGateway();
    const result = gateway.submit({
      schema_version: "tradeos.action_intent.v1",
      intent_id: "action_intent_test",
      target_id: "card_1",
      symbol: "VVV",
      suggested_action: "review_for_entry",
      non_executable: true,
      requires_operator_review: true,
      operator_must_choose: ["venue", "account", "size", "order_type", "timing"],
    } as never);

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe("action_intent_non_executable");
  });
});
