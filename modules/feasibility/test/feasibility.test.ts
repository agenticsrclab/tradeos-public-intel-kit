import { describe, expect, it } from "vitest";
import { LocalFeasibilityService } from "../src/index.js";

describe("LocalFeasibilityService", () => {
  it("tracks account-gate availability and verdict history", () => {
    const service = new LocalFeasibilityService();
    const qualityOnly = service.evaluate({ symbol: "VVV", side: "LONG", signal_type: "momentum" });

    expect(qualityOnly.account_gates_applied).toBe(false);
    expect(service.health().verdict_count).toBe(1);

    service.setAccount({ balance_usd: 10_000 });
    const full = service.evaluate({ symbol: "VVV", side: "LONG", signal_type: "momentum" });

    expect(full.account_gates_applied).toBe(true);
    expect(service.snapshot().verdicts).toHaveLength(2);
  });
});

