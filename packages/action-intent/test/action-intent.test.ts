import { describe, expect, it } from "vitest";
import {
  createActionIntent,
  validateActionIntent,
} from "../src/index.js";

describe("action-intent", () => {
  it("creates a non-executable operator-reviewed intent", () => {
    const intent = createActionIntent({
      target_id: "card_1",
      symbol: "vvv",
      suggested_action: "avoid_new_long",
      evidence_refs: ["fusion:VVV:latest", "fusion:VVV:latest"],
      risk_flags: ["fusion_degraded"],
      created_at: "2026-06-07T13:00:00.000Z",
    });

    expect(intent.symbol).toBe("VVV");
    expect(intent.non_executable).toBe(true);
    expect(intent.requires_operator_review).toBe(true);
    expect(intent.operator_must_choose).toContain("size");
    expect(intent.evidence_refs).toEqual(["fusion:VVV:latest"]);
    expect(validateActionIntent(intent).valid).toBe(true);
  });

  it("rejects executable fields on action intents", () => {
    const intent = {
      ...createActionIntent({
        target_id: "card_1",
        symbol: "BTC",
        suggested_action: "review_for_entry",
      }),
      venue: "coinbase",
      notional_usd: 100,
    };

    const validation = validateActionIntent(intent);

    expect(validation.valid).toBe(false);
    expect(validation.reasons).toContain("contains_executable_fields");
    expect(validation.forbidden_fields_present).toEqual(["venue", "notional_usd"]);
  });
});
