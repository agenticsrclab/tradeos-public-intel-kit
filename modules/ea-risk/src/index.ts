import type { SymbolCockpitPacket } from "@tradeos/cockpit-core";

export type EaRiskDecision = "pass" | "watch" | "fail";

export interface EaRiskPolicy {
  minConfidence: number;
  failVerdicts: string[];
  watchVerdicts: string[];
}

export interface EaRiskResult {
  schema_version: "tradeos.module.ea_risk.result.v1";
  decision: EaRiskDecision;
  expected_advantage_score: number;
  confidence: number;
  reasons: string[];
  invalidation: string[];
}

export const DEFAULT_EA_RISK_POLICY: EaRiskPolicy = {
  minConfidence: 0.5,
  failVerdicts: ["avoid_new_long", "trim_or_reduce", "exit_or_sell_candidate", "insufficient_evidence"],
  watchVerdicts: ["watch"],
};

export function evaluateExpectedAdvantage(
  cockpit: SymbolCockpitPacket,
  policy: Partial<EaRiskPolicy> = {},
): EaRiskResult {
  const cfg = { ...DEFAULT_EA_RISK_POLICY, ...policy };
  const good = cockpit.good.length;
  const bad = cockpit.bad.length;
  const ugly = cockpit.ugly.length;
  const score = clamp((good * 0.18 - bad * 0.16 - ugly * 0.3 + cockpit.confidence) / 1.4, -1, 1);
  const reasons: string[] = [];
  const invalidation: string[] = [];

  if (cockpit.confidence < cfg.minConfidence) {
    reasons.push("Confidence is below local EA threshold.");
    invalidation.push("Wait for stronger evidence freshness or agreement.");
  }
  if (cfg.failVerdicts.includes(cockpit.verdict)) {
    reasons.push(`Cockpit verdict ${cockpit.verdict} fails local EA gate.`);
    invalidation.push("Do not add risk until cockpit verdict improves.");
  }
  if (cockpit.ugly.length > 0) {
    invalidation.push("Resolve ugly-risk evidence before approving a new entry.");
  }

  let decision: EaRiskDecision = "pass";
  if (reasons.length > 0 || score < 0) {
    decision = "fail";
  } else if (cfg.watchVerdicts.includes(cockpit.verdict) || score < 0.35) {
    decision = "watch";
  }

  return {
    schema_version: "tradeos.module.ea_risk.result.v1",
    decision,
    expected_advantage_score: Math.round(score * 100) / 100,
    confidence: cockpit.confidence,
    reasons: reasons.length ? reasons : ["Expected advantage gate passed."],
    invalidation: invalidation.length ? invalidation : ["Verdict changes to avoid, trim, or exit candidate."],
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

