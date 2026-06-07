import { DEFAULT_FEASIBILITY_POLICY, evaluateFeasibilityIntent } from "@tradeos/policy-core";
import type {
  FeasibilityIntent,
  FeasibilityPolicy,
  FeasibilityVerdict,
  KillSwitchState,
  LocalAccountState,
} from "@tradeos/policy-core";

export interface FeasibilityServiceState {
  account?: LocalAccountState;
  policy: FeasibilityPolicy;
  killSwitch?: KillSwitchState;
  verdicts: FeasibilityVerdict[];
}

export class LocalFeasibilityService {
  private state: FeasibilityServiceState;

  constructor(options: { account?: LocalAccountState; policy?: Partial<FeasibilityPolicy>; killSwitch?: KillSwitchState } = {}) {
    this.state = {
      account: options.account,
      policy: { ...DEFAULT_FEASIBILITY_POLICY, ...options.policy },
      killSwitch: options.killSwitch,
      verdicts: [],
    };
  }

  health() {
    return {
      status: "ok",
      schema_version: "tradeos.module.feasibility.health.v1",
      account_gates_available: Boolean(this.state.account),
      verdict_count: this.state.verdicts.length,
    };
  }

  setAccount(account: LocalAccountState | undefined): void {
    this.state.account = account;
  }

  setKillSwitch(killSwitch: KillSwitchState | undefined): void {
    this.state.killSwitch = killSwitch;
  }

  evaluate(intent: FeasibilityIntent): FeasibilityVerdict {
    const verdict = evaluateFeasibilityIntent(intent, {
      account: this.state.account,
      policy: this.state.policy,
      killSwitch: this.state.killSwitch,
    });
    this.state.verdicts.push(verdict);
    return verdict;
  }

  snapshot(): FeasibilityServiceState {
    return {
      ...this.state,
      verdicts: [...this.state.verdicts],
    };
  }
}

export type {
  FeasibilityIntent,
  FeasibilityPolicy,
  FeasibilityVerdict,
  KillSwitchState,
  LocalAccountState,
};

