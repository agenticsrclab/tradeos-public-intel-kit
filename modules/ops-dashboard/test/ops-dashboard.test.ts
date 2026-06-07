import { describe, expect, it } from "vitest";
import { buildOpsSnapshot } from "../src/index.js";

describe("ops dashboard module", () => {
  it("summarizes open critical recommendations and pending approvals", () => {
    const snapshot = buildOpsSnapshot({
      recommendations: [
        {
          schema_version: "tradeos.symbol_cockpit.recommendation_card.v1",
          card_id: "card_1",
          target_id: "rec_1",
          symbol: "VVV",
          title: "VVV avoid",
          body: "avoid",
          verdict: "avoid_new_long",
          action: "avoid_new_long",
          severity: "warning",
          confidence: 0.7,
          evidence_refs: [],
          feedback_target: { target_type: "cockpit_recommendation", target_id: "rec_1" },
          status: "open",
          created_at: "now",
        },
      ],
      approvals: [{ approval_id: "ap_1", target_id: "rec_1", action: "paper", summary: "Paper", status: "pending", requested_at: "now" }],
      notifications: [
        {
          delivery_id: "delivery_1",
          channel_id: "operator_email",
          card_id: "card_1",
          target_id: "rec_1",
          status: "sent",
          reason: "smtp_accepted=1;smtp_rejected=0",
          delivered_at: "now",
        },
      ],
      killSwitch: { active: false, scope: "entry_freeze", reason: "" },
    });

    expect(snapshot.recommendations.warning_or_critical).toBe(1);
    expect(snapshot.approvals.pending).toBe(1);
    expect(snapshot.notifications.sent).toBe(1);
  });
});
