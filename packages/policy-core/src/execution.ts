import type { ActionabilityDecision, ExecutionIntent, KillSwitchState } from "./types.js";
import { killSwitchBlocksIntent } from "./kill-switch.js";

const ACTIONABLE = new Set(["APPROVED", "SIZED_DOWN", "OPERATOR_APPROVED"]);
const NON_ACTIONABLE = new Set(["", "REJECTED", "DENIED", "BLOCKED"]);

export function normalizeIntentActionability(
  intent: ExecutionIntent,
  options: { killSwitch?: KillSwitchState; requireAccountGates?: boolean } = {},
): ActionabilityDecision {
  const canonical = String(intent.verdict ?? "").trim().toUpperCase();
  const isExit = Boolean(intent.is_exit) || String(intent.type ?? "").toLowerCase() === "exit_intent";
  if (NON_ACTIONABLE.has(canonical)) {
    return { actionable: false, canonical_verdict: canonical, reason: "non_actionable_verdict" };
  }
  if (!ACTIONABLE.has(canonical)) {
    return { actionable: false, canonical_verdict: canonical, reason: "unknown_verdict" };
  }
  const accountApplied = parseBooleanFlag(intent.account_gates_applied);
  if ((options.requireAccountGates ?? true) && !accountApplied && !isExit) {
    return {
      actionable: false,
      canonical_verdict: canonical,
      reason: `account_gates_not_applied(account_gates_applied=${String(intent.account_gates_applied)})`,
    };
  }
  const kill = killSwitchBlocksIntent(options.killSwitch, { is_exit: isExit, type: intent.type });
  if (kill.blocked) {
    return { actionable: false, canonical_verdict: canonical, reason: kill.reason };
  }
  return { actionable: true, canonical_verdict: canonical, reason: canonical === "OPERATOR_APPROVED" ? "operator_approved" : "actionable_verdict" };
}

export function parseBooleanFlag(value: unknown): boolean {
  if (value === true) {
    return true;
  }
  if (typeof value === "string") {
    return ["true", "1", "yes", "y", "on"].includes(value.trim().toLowerCase());
  }
  return false;
}

