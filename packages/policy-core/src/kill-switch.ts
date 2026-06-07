import type { KillSwitchScope, KillSwitchState } from "./types.js";

export function defaultKillSwitchState(): KillSwitchState {
  return {
    active: false,
    scope: "entry_freeze",
    reason: "",
  };
}

export class InMemoryKillSwitch {
  private state: KillSwitchState = defaultKillSwitchState();

  getState(now = new Date()): KillSwitchState {
    if (this.state.active && this.state.expires_at && new Date(this.state.expires_at).getTime() <= now.getTime()) {
      this.state = defaultKillSwitchState();
    }
    return { ...this.state };
  }

  activate(reason: string, scope: KillSwitchScope = "entry_freeze", ttlSeconds?: number, now = new Date()): KillSwitchState {
    this.state = {
      active: true,
      scope,
      reason,
      activated_at: now.toISOString(),
      expires_at: ttlSeconds ? new Date(now.getTime() + ttlSeconds * 1000).toISOString() : undefined,
    };
    return this.getState(now);
  }

  deactivate(reason = "operator_resumed"): KillSwitchState {
    this.state = {
      active: false,
      scope: "entry_freeze",
      reason,
    };
    return this.getState();
  }
}

export function killSwitchBlocksIntent(
  state: KillSwitchState | undefined,
  intent: { is_exit?: boolean; type?: string },
): { blocked: boolean; reason: string } {
  if (!state?.active) {
    return { blocked: false, reason: "" };
  }
  const isExit = Boolean(intent.is_exit) || String(intent.type ?? "").toLowerCase() === "exit_intent";
  if (state.scope === "full_freeze") {
    return { blocked: true, reason: "kill_switch_full_freeze" };
  }
  if (!isExit) {
    return { blocked: true, reason: "kill_switch_entry_freeze" };
  }
  return { blocked: false, reason: "exit_allowed_during_entry_freeze" };
}

