import type { RecommendationCard } from "@tradeos/cockpit-core";
import type { ApprovalRequest, KillSwitchState } from "@tradeos/policy-core";

export interface AuditEvent {
  event_id: string;
  event_type: string;
  target_id?: string;
  message: string;
  occurred_at: string;
}

export interface NotificationDeliverySummary {
  delivery_id: string;
  channel_id: string;
  card_id: string;
  target_id: string;
  status: "sent" | "skipped" | "failed";
  reason: string;
  delivered_at: string;
}

export interface OpsSnapshot {
  schema_version: "tradeos.module.ops_dashboard.snapshot.v1";
  generated_at: string;
  services: Record<string, { status: string; detail?: string }>;
  recommendations: {
    open: number;
    warning_or_critical: number;
    latest: RecommendationCard[];
  };
  approvals: {
    pending: number;
    latest: ApprovalRequest[];
  };
  notifications: {
    sent: number;
    failed: number;
    skipped: number;
    latest: NotificationDeliverySummary[];
  };
  kill_switch: KillSwitchState;
  audit: AuditEvent[];
}

export function buildOpsSnapshot(input: {
  recommendations?: RecommendationCard[];
  approvals?: ApprovalRequest[];
  notifications?: NotificationDeliverySummary[];
  killSwitch: KillSwitchState;
  audit?: AuditEvent[];
  services?: Record<string, { status: string; detail?: string }>;
  now?: Date;
}): OpsSnapshot {
  const recommendations = input.recommendations ?? [];
  const approvals = input.approvals ?? [];
  const notifications = input.notifications ?? [];
  return {
    schema_version: "tradeos.module.ops_dashboard.snapshot.v1",
    generated_at: (input.now ?? new Date()).toISOString(),
    services: input.services ?? {},
    recommendations: {
      open: recommendations.filter((card) => card.status === "open").length,
      warning_or_critical: recommendations.filter((card) => card.severity === "warning" || card.severity === "critical").length,
      latest: recommendations.slice(-10).reverse(),
    },
    approvals: {
      pending: approvals.filter((approval) => approval.status === "pending").length,
      latest: approvals.slice(-10).reverse(),
    },
    notifications: {
      sent: notifications.filter((delivery) => delivery.status === "sent").length,
      failed: notifications.filter((delivery) => delivery.status === "failed").length,
      skipped: notifications.filter((delivery) => delivery.status === "skipped").length,
      latest: notifications.slice(-10).reverse(),
    },
    kill_switch: input.killSwitch,
    audit: (input.audit ?? []).slice(-25).reverse(),
  };
}
