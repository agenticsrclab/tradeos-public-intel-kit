const base = process.env.COCKPIT_API_BASE ?? "http://127.0.0.1:18100";
const symbol = process.env.COCKPIT_E2E_SYMBOL ?? "VVV";
const chain = process.env.COCKPIT_E2E_CHAIN ?? "8453";
const submitFeedback = process.env.COCKPIT_E2E_SUBMIT_FEEDBACK === "true";
const requireEmail = process.env.COCKPIT_E2E_REQUIRE_EMAIL === "true";

const allowedVerdicts = new Set([
  "buy_candidate",
  "watch",
  "avoid_new_long",
  "trim_or_reduce",
  "exit_or_sell_candidate",
  "insufficient_evidence",
]);
const allowedActions = new Set([
  "review_for_entry",
  "watch_for_recovery",
  "avoid_new_long",
  "trim_or_tighten_risk",
  "review_exit",
  "pass",
]);

async function api(path, init) {
  const response = await fetch(`${base}${path}`, init);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`${path} failed ${response.status}: ${payload.error || text}`);
  }
  return payload;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const health = await api("/healthz");
assert(health.status === "ok", "health not ok");
assert(health.public_intel_key_configured === true, "TRADEOS_PUBLIC_INTEL_KEY is not configured");
assert(health.venice_or_openai_key_configured === true, "VENICE_API_KEY or OPENAI_API_KEY is not configured");
const emailChannel = (health.notification_channels || []).find((channel) => channel.kind === "email");
if (requireEmail) {
  assert(emailChannel?.target_configured === true, "email notification channel is not configured");
}

const page = await fetch(`${base}/`).then((response) => response.text());
assert(page.includes("TradeOS Symbol Cockpit"), "web page missing cockpit title");

const review = await api("/api/cockpit", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ symbol, chain, mode: "trader" }),
});
assert(review.schema_version === "tradeos.symbol_cockpit.review_result.v1", "review schema mismatch");
assert(review.packet.symbol === symbol.toUpperCase(), "review symbol mismatch");
assert(allowedVerdicts.has(review.packet.verdict), "unexpected verdict");
assert(allowedActions.has(review.packet.action), "unexpected action");
assert(Array.isArray(review.packet.evidence_refs), "missing evidence refs");
assert(Object.keys(review.source_errors || {}).length === 0, "TradeOS source errors present");
assert(review.feasibility.account_gates_applied === true, "account gates not applied");
if (requireEmail) {
  const emailDelivery = (review.notification_deliveries || []).find((delivery) => delivery.channel_id === emailChannel.id);
  assert(emailDelivery?.status === "sent", `email notification was not sent: ${emailDelivery?.reason || "missing_delivery"}`);
}

const preflight = await api("/api/preflight", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ symbol, chain, proposed_action: "buy", proposed_notional_usd: 250 }),
});
assert(preflight.schema_version === "tradeos.symbol_cockpit.preflight_result.v1", "preflight schema mismatch");
assert(
  ["approve", "avoid", "watch", "insufficient_evidence", "review"].includes(preflight.preflight.decision),
  "bad preflight decision",
);

const answer = await api("/api/action-agent", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    symbol,
    question: "Give a concise cockpit recommendation and the evidence caveat.",
  }),
});
assert(answer.schema_version === "tradeos.symbol_cockpit.action_agent_answer.v1", "agent schema mismatch");
assert(typeof answer.answer === "string" && answer.answer.trim().length > 40, "agent answer too short");
assert(answer.model, "agent model missing");

const approval = await api("/api/paper-orders", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ target_id: review.packet.target_id, side: "BUY", notional_usd: 100 }),
});
assert(approval.status === "approval_required", "paper order did not require approval first");

const kill = await api("/api/kill-switch/activate", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ reason: "live_e2e_entry_freeze" }),
});
assert(kill.active === true, "kill switch did not activate");

const blocked = await api("/api/paper-orders", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ target_id: review.packet.target_id, side: "BUY", notional_usd: 100, approved: true }),
});
assert(blocked.status === "rejected" && blocked.result.reason === "kill_switch_entry_freeze", "kill switch did not block entry");

const resumed = await api("/api/kill-switch/deactivate", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ reason: "live_e2e_resume" }),
});
assert(resumed.active === false, "kill switch did not deactivate");

const filled = await api("/api/paper-orders", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ target_id: review.packet.target_id, side: "BUY", notional_usd: 100, approved: true }),
});
assert(filled.status === "filled" && filled.result.fill.venue === "paper", "paper fill failed");

let feedbackStatus = "skipped";
if (submitFeedback) {
  const feedback = await api("/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      target_id: review.packet.target_id,
      label: "useful",
      note: "live e2e validation for self-hosted symbol cockpit",
    }),
  });
  assert(feedback.schema_version === "tradeos.symbol_cockpit.feedback_result.v1", "feedback schema mismatch");
  feedbackStatus = feedback.payload.status || feedback.payload.schema_version || "accepted";
}

const ops = await api("/api/ops");
assert(ops.schema_version === "tradeos.module.ops_dashboard.snapshot.v1", "ops schema mismatch");
assert(ops.recommendations.open >= 1, "ops missing recommendations");
assert(ops.audit.length >= 1, "ops missing audit");

console.log(
  JSON.stringify(
    {
      health: "ok",
      web: "ok",
      symbol: review.packet.symbol,
      verdict: review.packet.verdict,
      action: review.packet.action,
      confidence: review.packet.confidence,
      preflight_decision: preflight.preflight.decision,
      action_agent_model: answer.model,
      action_agent_answer_chars: answer.answer.length,
      email_notification: emailChannel
        ? (review.notification_deliveries || []).find((delivery) => delivery.channel_id === emailChannel.id)?.status || "not_delivered"
        : "not_configured",
      paper_approval_boundary: approval.status,
      kill_switch_block_reason: blocked.result.reason,
      paper_fill_venue: filled.result.fill.venue,
      feedback_status: feedbackStatus,
      ops_open_recommendations: ops.recommendations.open,
      ops_audit_events: ops.audit.length,
    },
    null,
    2,
  ),
);
