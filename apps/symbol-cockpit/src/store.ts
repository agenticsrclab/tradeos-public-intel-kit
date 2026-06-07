import type { ActionIntent } from "@tradeos/action-intent";
import type { RecommendationCard, SymbolCockpitPacket } from "@tradeos/cockpit-core";
import type { ApprovalRequest, KillSwitchState } from "@tradeos/policy-core";
import type { FeasibilityVerdict } from "@tradeos/module-feasibility";
import type { EaRiskResult } from "@tradeos/module-ea-risk";
import type { AuditEvent } from "@tradeos/module-ops-dashboard";
import type { PaperExecutionResult } from "@tradeos/module-execution-gateway";
import type { NotificationDelivery } from "@tradeos/module-notification-router";

export interface CockpitReviewRecord {
  packet: SymbolCockpitPacket;
  card: RecommendationCard;
  action_intent: ActionIntent;
  ea_risk: EaRiskResult;
  feasibility: FeasibilityVerdict;
}

export class CockpitStore {
  readonly reviews: CockpitReviewRecord[] = [];
  readonly approvals: ApprovalRequest[] = [];
  readonly audit: AuditEvent[] = [];
  readonly paperResults: PaperExecutionResult[] = [];
  readonly notificationDeliveries: NotificationDelivery[] = [];

  addReview(record: CockpitReviewRecord): void {
    this.reviews.push(record);
    this.audit.push({
      event_id: `audit_${record.packet.target_id}`,
      event_type: "cockpit_review",
      target_id: record.packet.target_id,
      message: `${record.packet.symbol} ${record.packet.verdict}`,
      occurred_at: record.packet.generated_at,
    });
  }

  addApproval(approval: ApprovalRequest): void {
    this.approvals.push(approval);
    this.audit.push({
      event_id: `audit_${approval.approval_id}`,
      event_type: "approval_requested",
      target_id: approval.target_id,
      message: approval.summary,
      occurred_at: approval.requested_at,
    });
  }

  addPaperResult(result: PaperExecutionResult): void {
    this.paperResults.push(result);
    this.audit.push({
      event_id: `audit_${result.order_id}`,
      event_type: result.accepted ? "paper_fill" : "paper_reject",
      target_id: result.order_id,
      message: result.reason,
      occurred_at: result.fill?.created_at ?? new Date().toISOString(),
    });
  }

  addNotificationDeliveries(deliveries: NotificationDelivery[]): void {
    this.notificationDeliveries.push(...deliveries);
    for (const delivery of deliveries) {
      this.audit.push({
        event_id: `audit_${delivery.delivery_id}`,
        event_type: `notification_${delivery.status}`,
        target_id: delivery.target_id,
        message: `${delivery.channel_id}: ${delivery.reason}`,
        occurred_at: delivery.delivered_at,
      });
    }
  }

  latestPacket(symbol?: string): SymbolCockpitPacket | undefined {
    const normalized = symbol?.toUpperCase();
    return [...this.reviews]
      .reverse()
      .find((record) => !normalized || record.packet.symbol === normalized)
      ?.packet;
  }

  recordForTarget(targetId: string): CockpitReviewRecord | undefined {
    return [...this.reviews].reverse().find((record) => record.packet.target_id === targetId);
  }

  cards(): RecommendationCard[] {
    return this.reviews.map((record) => record.card);
  }
}

export function privacyModes() {
  return {
    schema_version: "tradeos.symbol_cockpit.privacy_modes.v1",
    modes: [
      {
        mode: "public_intel",
        stays_local: ["local UI state", "optional local notes"],
        goes_to_tradeos: ["symbol", "chain", "horizon", "public intelligence query"],
      },
      {
        mode: "private_local",
        stays_local: ["portfolio", "strategy", "bot rules", "memory", "logs", "wallet context"],
        goes_to_tradeos: ["generic symbol or market queries only"],
      },
      {
        mode: "attributed_feedback",
        stays_local: ["private intelligence context unless the user includes it"],
        goes_to_tradeos: ["feedback target ID", "label", "provenance", "optional attribution"],
      },
      {
        mode: "paid_private_intelligence",
        stays_local: ["local runtime", "execution keys"],
        goes_to_tradeos: ["authenticated paid requests", "entitlement context", "explicit paid/private scope"],
      },
    ],
  };
}

export type { KillSwitchState };
