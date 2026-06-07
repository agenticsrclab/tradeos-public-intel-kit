import {
  buildBotPreflightResponse,
  buildRecommendationCard,
  buildSymbolCockpitPacket,
  type BotPreflightRequest,
  type SymbolCockpitPacket,
  type SymbolCockpitQuery,
} from "@tradeos/cockpit-core";
import { createActionIntent } from "@tradeos/action-intent";
import { evaluateExpectedAdvantage } from "@tradeos/module-ea-risk";
import { PaperExecutionGateway } from "@tradeos/module-execution-gateway";
import { LocalFeasibilityService } from "@tradeos/module-feasibility";
import { buildOpsSnapshot } from "@tradeos/module-ops-dashboard";
import {
  NotificationRouter,
  emailChannelFromEnv,
  type NotificationChannel,
  type NotificationDelivery,
} from "@tradeos/module-notification-router";
import { InMemoryKillSwitch, createApprovalRequest, defaultKillSwitchState } from "@tradeos/policy-core";
import { OpenAICompatibleActionAgent, TradeOSEvidenceConnector } from "@tradeos/tradeos-connectors";
import { CockpitStore, privacyModes } from "./store.js";

export interface SymbolCockpitRuntimeOptions {
  evidence?: TradeOSEvidenceConnector;
  actionAgent?: OpenAICompatibleActionAgent;
  store?: CockpitStore;
  notificationRouter?: NotificationRouter;
  notificationChannels?: NotificationChannel[];
}

export class SymbolCockpitRuntime {
  readonly evidence: TradeOSEvidenceConnector;
  readonly actionAgent: OpenAICompatibleActionAgent;
  readonly store: CockpitStore;
  readonly feasibility: LocalFeasibilityService;
  readonly paperExecution: PaperExecutionGateway;
  readonly killSwitch = new InMemoryKillSwitch();
  readonly notifications: NotificationRouter;
  readonly notificationChannels: NotificationChannel[];

  constructor(options: SymbolCockpitRuntimeOptions = {}) {
    this.evidence = options.evidence ?? new TradeOSEvidenceConnector();
    this.actionAgent = options.actionAgent ?? new OpenAICompatibleActionAgent();
    this.store = options.store ?? new CockpitStore();
    this.notifications = options.notificationRouter ?? new NotificationRouter();
    this.notificationChannels = options.notificationChannels ?? defaultNotificationChannels();
    this.feasibility = new LocalFeasibilityService({
      account: {
        balance_usd: envNumber("COCKPIT_LOCAL_ACCOUNT_BALANCE_USD", 10_000),
        portfolio_value_usd: envNumber("COCKPIT_LOCAL_ACCOUNT_BALANCE_USD", 10_000),
        peak_portfolio_value_usd: envNumber("COCKPIT_LOCAL_ACCOUNT_BALANCE_USD", 10_000),
        open_positions: 0,
        current_position_notional_usd: {},
      },
    });
    this.paperExecution = new PaperExecutionGateway();
  }

  async reviewSymbol(query: SymbolCockpitQuery) {
    const mergedQuery: SymbolCockpitQuery = {
      mode: (process.env.COCKPIT_DEFAULT_MODE as SymbolCockpitQuery["mode"]) ?? "trader",
      chain: process.env.COCKPIT_DEFAULT_CHAIN,
      ...query,
    };
    const evidence = await this.evidence.fetchSymbolEvidence(mergedQuery);
    const packet = buildSymbolCockpitPacket(mergedQuery, evidence.bundle);
    const card = buildRecommendationCard(packet);
    attachFeedbackUrl(card);
    const actionIntent = createActionIntent({
      target_id: card.target_id,
      symbol: packet.symbol,
      chain: packet.chain,
      suggested_action: packet.action,
      recommendation_type: packet.recommendation_type,
      confidence: packet.confidence,
      evidence_refs: packet.evidence_refs,
      risk_flags: riskFlagsForPacket(packet),
      reasons: [...packet.bad, ...packet.ugly].slice(0, 8),
      created_at: packet.generated_at,
    });
    const eaRisk = evaluateExpectedAdvantage(packet);
    const feasibility = this.feasibility.evaluate({
      symbol: packet.symbol,
      side: "LONG",
      signal_type: "symbol_cockpit",
      confidence: packet.confidence,
      expected_edge_bps: expectedEdgeForVerdict(packet.verdict),
      proposed_notional_usd: 250,
      created_at: packet.generated_at,
    });
    let notificationDeliveries: NotificationDelivery[] = [];
    this.store.addReview({ packet, card, action_intent: actionIntent, ea_risk: eaRisk, feasibility });
    if (this.notificationChannels.length > 0) {
      notificationDeliveries = await this.notifications.deliver(card, this.notificationChannels);
      this.store.addNotificationDeliveries(notificationDeliveries);
    }
    return {
      schema_version: "tradeos.symbol_cockpit.review_result.v1",
      packet,
      card,
      action_intent: actionIntent,
      ea_risk: eaRisk,
      feasibility,
      notification_deliveries: notificationDeliveries,
      app_attribution: evidence.app_attribution,
      source_errors: evidence.bundle.source_errors,
    };
  }

  async preflight(request: BotPreflightRequest) {
    const review = await this.reviewSymbol({
      symbol: request.symbol,
      chain: request.chain,
      recommendationType: "trade_preflight",
      mode: "trader",
    });
    const preflight = buildBotPreflightResponse(request, review.packet);
    return {
      schema_version: "tradeos.symbol_cockpit.preflight_result.v1",
      preflight,
      cockpit: review.packet,
      ea_risk: review.ea_risk,
      feasibility: review.feasibility,
    };
  }

  async askActionAgent(input: { question: string; symbol?: string }) {
    const packet = this.store.latestPacket(input.symbol) ?? (await this.reviewSymbol({ symbol: input.symbol ?? "BTC" })).packet;
    return this.actionAgent.answer(input.question, packet);
  }

  async submitFeedback(input: { target_id: string; label: string; note?: string }) {
    const record = this.store.recordForTarget(input.target_id);
    const payload = await this.evidence.submitCockpitFeedback({
      targetId: input.target_id,
      label: input.label,
      note: input.note,
      sourceSnapshotRefs: record?.packet.evidence_refs,
    });
    return {
      schema_version: "tradeos.symbol_cockpit.feedback_result.v1",
      payload,
    };
  }

  requestPaperExecution(input: { target_id: string; side?: string; notional_usd?: number; approved?: boolean }) {
    const record = this.store.recordForTarget(input.target_id);
    if (!record) {
      return { status: "not_found", target_id: input.target_id };
    }
    if (!input.approved) {
      const approval = createApprovalRequest({
        target_id: input.target_id,
        action: "paper_execute",
        summary: `Paper ${input.side ?? "BUY"} ${record.packet.symbol}`,
        ttlSeconds: 900,
      });
      this.store.addApproval(approval);
      return { status: "approval_required", approval };
    }
    this.paperExecution.setKillSwitch(this.killSwitch.getState());
    const result = this.paperExecution.submit({
      symbol: record.packet.symbol,
      side: input.side ?? "BUY",
      verdict: record.feasibility.verdict,
      account_gates_applied: record.feasibility.account_gates_applied,
      recommended_size_usd: input.notional_usd ?? record.feasibility.recommended_size_usd,
      source: record.action_intent.intent_id,
      type: "paper_order_from_action_intent",
    });
    this.store.addPaperResult(result);
    return { status: result.status, result };
  }

  activateKillSwitch(reason = "operator_requested") {
    const state = this.killSwitch.activate(reason);
    this.feasibility.setKillSwitch(state);
    this.paperExecution.setKillSwitch(state);
    return state;
  }

  deactivateKillSwitch(reason = "operator_resumed") {
    const state = this.killSwitch.deactivate(reason);
    this.feasibility.setKillSwitch(state);
    this.paperExecution.setKillSwitch(state);
    return state;
  }

  opsSnapshot() {
    const killSwitch = this.killSwitch.getState();
    return buildOpsSnapshot({
      recommendations: this.store.cards(),
      approvals: this.store.approvals,
      notifications: this.store.notificationDeliveries,
      killSwitch,
      audit: this.store.audit,
      services: {
        tradeos_public_intel: { status: "configured" },
        feasibility: { status: this.feasibility.health().status },
        ea_risk: { status: "ok" },
        execution_gateway: { status: this.paperExecution.health().status, detail: "paper" },
      },
    });
  }

  privacyModes() {
    return privacyModes();
  }

  health() {
    return {
      schema_version: "tradeos.symbol_cockpit.health.v1",
      status: "ok",
      tradeos_api_base: this.evidence.client.baseUrl,
      public_intel_key_configured: Boolean(this.evidence.client.apiKey),
      venice_or_openai_key_configured: Boolean(this.actionAgent.apiKey),
      notification_channels: this.notificationChannels.map((channel) => ({
        id: channel.id,
        kind: channel.kind,
        minSeverity: channel.minSeverity ?? "info",
        enabled: channel.enabled !== false,
        target_configured: Boolean(channel.target),
      })),
      kill_switch: this.killSwitch.getState() ?? defaultKillSwitchState(),
    };
  }
}

export function createRuntime(options: SymbolCockpitRuntimeOptions = {}) {
  return new SymbolCockpitRuntime(options);
}

function expectedEdgeForVerdict(verdict: string): number {
  switch (verdict) {
    case "buy_candidate":
      return 40;
    case "watch":
      return 12;
    case "avoid_new_long":
      return -10;
    case "trim_or_reduce":
    case "exit_or_sell_candidate":
      return -35;
    default:
      return 0;
  }
}

function riskFlagsForPacket(packet: SymbolCockpitPacket): string[] {
  const flags = [`verdict_${packet.verdict}`];
  const riskText = [...packet.bad, ...packet.ugly].join(" ").toLowerCase();
  if (riskText.includes("flow stress") || riskText.includes("vpin")) {
    flags.push("flow_stress_risk");
  }
  if (riskText.includes("fusion")) {
    flags.push("fusion_degraded");
  }
  if (riskText.includes("liquidity")) {
    flags.push("liquidity_risk");
  }
  if (packet.confidence < 0.5) {
    flags.push("low_confidence");
  }
  return [...new Set(flags)];
}

function defaultNotificationChannels(): NotificationChannel[] {
  const email = emailChannelFromEnv();
  return [{ id: "stdout", kind: "stdout", minSeverity: "warning" }, ...(email ? [email] : [])];
}

function attachFeedbackUrl(card: ReturnType<typeof buildRecommendationCard>): void {
  const baseUrl = process.env.COCKPIT_FEEDBACK_BASE_URL ?? process.env.TRADEOS_FEEDBACK_BASE_URL ?? defaultFeedbackBaseUrl();
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("target_type", card.feedback_target.target_type);
    url.searchParams.set("target_id", card.feedback_target.target_id);
    url.searchParams.set("card_id", card.card_id);
    url.searchParams.set("symbol", card.symbol);
    url.searchParams.set("verdict", card.verdict);
    url.searchParams.set("source", "tradeos-symbol-cockpit");
    for (const ref of card.evidence_refs.slice(0, 12)) {
      url.searchParams.append("source_snapshot_refs", ref);
    }
    setSearchParam(url, "price_at_note", card.market_snapshot?.price_usd);
    setSearchParam(url, "price_source", card.market_snapshot?.price_source);
    setSearchParam(url, "price_as_of", card.market_snapshot?.price_as_of);
    setSearchParam(url, "target_price", card.market_snapshot?.target_price_usd);
    setSearchParam(url, "target_price_source", card.market_snapshot?.target_price_source);
    setSearchParam(url, "target_price_note", card.market_snapshot?.target_price_note);
    const value = url.toString();
    card.feedback_url = value;
    card.feedback_target.url = value;
  } catch {
    // Invalid operator-provided feedback URLs should not break recommendations.
  }
}

function setSearchParam(url: URL, key: string, value: string | number | undefined): void {
  if (value === undefined || value === "") {
    return;
  }
  url.searchParams.set(key, String(value));
}

function defaultFeedbackBaseUrl(): string {
  const publicBaseUrl = process.env.COCKPIT_PUBLIC_BASE_URL?.trim();
  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/+$/, "")}/feedback`;
  }
  return "https://tradeos.tech/feedback";
}

function envNumber(name: string, fallback: number): number {
  const parsed = Number(process.env[name] ?? "");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
