import { nowIso, stableId } from "./ids.js";
import type {
  BotPreflightRequest,
  BotPreflightResponse,
  CockpitAction,
  CockpitVerdict,
  EvidenceBundle,
  EvidenceRef,
  JsonObject,
  JsonValue,
  MarketSnapshot,
  RecommendationCard,
  RecommendationSeverity,
  SymbolCockpitPacket,
  SymbolCockpitQuery,
} from "./types.js";

const GOOD_WORDS = [
  "accumulation",
  "above baseline",
  "bullish",
  "constructive",
  "favorable",
  "improved",
  "momentum",
  "recovery",
  "resilient",
  "strong",
  "supportive",
  "uptrend",
];

const BAD_WORDS = [
  "adverse",
  "bearish",
  "degraded",
  "deterioration",
  "disagreement",
  "downtrend",
  "fragile",
  "illiquid",
  "low confidence",
  "selloff",
  "thin",
  "weak",
  "warning",
];

const UGLY_WORDS = [
  "critical",
  "depeg",
  "exploit",
  "flow stress",
  "halt",
  "high risk",
  "rug",
  "scam",
  "severe",
  "vpin",
];

export function normalizeSymbol(symbol: string): string {
  return symbol.trim().replace(/\s+/g, "").toUpperCase();
}

export function buildEvidenceBundle(
  query: SymbolCockpitQuery,
  sources: Record<string, JsonObject>,
  sourceErrors: Record<string, string> = {},
): EvidenceBundle {
  return {
    schema_version: "tradeos.cockpit.evidence_bundle.v1",
    symbol: normalizeSymbol(query.symbol),
    chain: query.chain,
    mode: query.mode ?? "investor",
    generated_at: nowIso(),
    sources,
    source_errors: sourceErrors,
  };
}

export function buildSymbolCockpitPacket(query: SymbolCockpitQuery, bundle: EvidenceBundle): SymbolCockpitPacket {
  const symbol = normalizeSymbol(query.symbol);
  const matched = collectEvidenceText(bundle, symbol);
  const refs = collectEvidenceRefs(bundle, symbol);
  const sourceCount = Object.keys(bundle.sources).length;
  const errorCount = Object.keys(bundle.source_errors).length;
  const sourceIssue = sourceAvailabilityIssue(bundle, refs.length);
  const evidenceStrength = Math.min(1, Math.max(0, refs.length / 6 + matched.length / 24));
  const scored = scoreEvidence(matched);
  const confidence = sourceIssue
    ? 0.15
    : round2(Math.max(0.15, Math.min(0.92, 0.35 + evidenceStrength * 0.35 + scored.confidenceBump)));
  const verdict = decideVerdict(scored, confidence, refs.length, query.recommendationType);
  const action = actionForVerdict(verdict);
  const generatedAt = nowIso();
  const marketSnapshot = extractMarketSnapshot(bundle);
  const targetId = stableId("cockpit_rec", {
    symbol,
    chain: query.chain ?? "",
    verdict,
    action,
    evidence_refs: refs.slice(0, 12),
    generated_day: generatedAt.slice(0, 10),
  });

  return {
    schema_version: "tradeos.symbol_cockpit.packet.v1",
    target_id: targetId,
    symbol,
    chain: query.chain,
    verdict,
    action,
    recommendation_type: query.recommendationType ?? "symbol_cockpit",
    confidence,
    mode: query.mode ?? bundle.mode,
    good: sourceIssue ? sourceIssue.good : chooseDrivers(scored.good, defaultGood(verdict), 4),
    bad: sourceIssue ? sourceIssue.bad : chooseDrivers(scored.bad, defaultBad(verdict), 4),
    ugly: chooseDrivers(scored.ugly, defaultUgly(verdict), 3),
    next_steps: sourceIssue ? sourceIssue.nextSteps : nextStepsForVerdict(verdict),
    evidence_refs: refs.slice(0, 12),
    evidence: refs.slice(0, 12).map((id) => refToEvidence(id, symbol)),
    limitations: [
      "Self-hosted recommendation. Operator controls execution, sizing, custody, approvals, and risk.",
      "TradeOS public-intelligence queries disclose requested symbols and authenticated scopes to TradeOS.",
    ],
    privacy_mode: query.privacyMode ?? "public_intel",
    market_snapshot: marketSnapshot,
    generated_at: generatedAt,
    source_summary: {
      source_count: sourceCount,
      error_count: errorCount,
      matched_items: matched.length,
    },
  };
}

export function buildRecommendationCard(packet: SymbolCockpitPacket): RecommendationCard {
  const severity = severityForVerdict(packet.verdict);
  return {
    schema_version: "tradeos.symbol_cockpit.recommendation_card.v1",
    card_id: stableId("cockpit_card", [packet.target_id, packet.verdict, packet.action]),
    target_id: packet.target_id,
    symbol: packet.symbol,
    chain: packet.chain,
    title: `${packet.symbol}: ${titleForVerdict(packet.verdict)}`,
    body: buildCardBody(packet),
    verdict: packet.verdict,
    action: packet.action,
    severity,
    confidence: packet.confidence,
    evidence_refs: packet.evidence_refs,
    evidence: packet.evidence,
    drivers: {
      good: packet.good,
      bad: packet.bad,
      ugly: packet.ugly,
      next_steps: packet.next_steps,
    },
    market_snapshot: packet.market_snapshot,
    feedback_target: {
      target_type: "cockpit_recommendation",
      target_id: packet.target_id,
    },
    status: "open",
    created_at: packet.generated_at,
  };
}

export function buildBotPreflightResponse(
  request: BotPreflightRequest,
  cockpit: SymbolCockpitPacket,
): BotPreflightResponse {
  const proposed = request.proposed_action.toLowerCase();
  const riskyLong = proposed === "buy" || proposed === "long" || proposed === "enter";
  const exitLike = proposed === "sell" || proposed === "trim" || proposed === "exit";
  let allowed = true;
  let decision: BotPreflightResponse["decision"] = "review";
  let reason = "Review before sending to your own execution system.";

  if (cockpit.verdict === "insufficient_evidence") {
    allowed = false;
    decision = "insufficient_evidence";
    reason =
      cockpit.source_summary.source_count === 0 && cockpit.source_summary.error_count > 0
        ? "TradeOS public-intel sources did not return usable evidence for this preflight."
        : "TradeOS evidence is too thin for this preflight.";
  } else if (riskyLong && ["avoid_new_long", "trim_or_reduce", "exit_or_sell_candidate"].includes(cockpit.verdict)) {
    allowed = false;
    decision = "avoid";
    reason = "Proposed entry conflicts with cockpit risk verdict.";
  } else if (riskyLong && cockpit.verdict === "buy_candidate") {
    decision = "approve";
    reason = "Evidence supports a buy candidate only if local risk gates pass.";
  } else if (exitLike && ["trim_or_reduce", "exit_or_sell_candidate", "avoid_new_long"].includes(cockpit.verdict)) {
    decision = "approve";
    reason = "Evidence supports reducing or avoiding exposure; local approvals still apply.";
  } else if (cockpit.verdict === "watch") {
    allowed = false;
    decision = "watch";
    reason = "Watch only until evidence improves.";
  }

  return {
    schema_version: "tradeos.symbol_cockpit.bot_preflight.v1",
    preflight_id: stableId("cockpit_preflight", [
      request.bot_id ?? "",
      request.run_id ?? "",
      request.symbol,
      request.proposed_action,
      cockpit.target_id,
    ]),
    allowed,
    decision,
    reason,
    cockpit,
    evidence_refs: cockpit.evidence_refs,
    next_steps: cockpit.next_steps,
    created_at: nowIso(),
  };
}

function collectEvidenceText(bundle: EvidenceBundle, symbol: string): string[] {
  const lines: string[] = [];
  for (const [source, payload] of Object.entries(bundle.sources)) {
    collectStrings(payload, lines, source, symbol);
  }
  return dedupe(lines).slice(0, 80);
}

function collectStrings(
  value: JsonValue | undefined,
  lines: string[],
  source: string,
  symbol: string,
  context: { symbolScoped: boolean } = { symbolScoped: false },
): void {
  if (value === undefined || value === null) {
    return;
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (text.length < 4 || looksLikeMachineIdentifier(text)) {
      return;
    }
    if ((context.symbolScoped || textMentionsSymbol(text, symbol)) && !mentionsOtherCashtag(text, symbol)) {
      lines.push(`${source}: ${text}`);
      return;
    }
    if (isBroadMarketContext(source, text, symbol)) {
      lines.push(`market_context: ${text}`);
    }
    return;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, lines, source, symbol, context);
    }
    return;
  }
  const explicitSymbol = explicitSymbolFromObject(value);
  if (explicitSymbol && !symbolMatches(explicitSymbol, symbol)) {
    return;
  }
  const nextContext = {
    symbolScoped: context.symbolScoped || (explicitSymbol ? symbolMatches(explicitSymbol, symbol) : false),
  };
  for (const item of Object.values(value)) {
    collectStrings(item, lines, source, symbol, nextContext);
  }
}

function collectEvidenceRefs(bundle: EvidenceBundle, symbol: string): string[] {
  const refs: string[] = [];
  for (const [source, payload] of Object.entries(bundle.sources)) {
    collectRefsFromValue(source, payload, refs, symbol);
  }
  if (refs.length === 0) {
    refs.push(...Object.keys(bundle.sources).map((source) => `${source}:${symbol}:latest`));
  }
  return dedupe(refs).slice(0, 24);
}

function collectRefsFromValue(source: string, value: JsonValue | undefined, refs: string[], symbol: string): void {
  if (!value || typeof value !== "object") {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectRefsFromValue(source, item, refs, symbol);
    }
    return;
  }
  const explicitSymbol = explicitSymbolFromObject(value);
  if (explicitSymbol && !symbolMatches(explicitSymbol, symbol)) {
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    const lower = key.toLowerCase();
    if (typeof item === "string" && (lower.endsWith("id") || lower.includes("ref") || lower.includes("packet"))) {
      refs.push(`${source}:${item}`);
    }
    if (typeof item === "string" && symbolMatches(item, symbol)) {
      refs.push(`${source}:${symbol}:latest`);
    }
    collectRefsFromValue(source, item, refs, symbol);
  }
}

function scoreEvidence(lines: string[]): {
  good: string[];
  bad: string[];
  ugly: string[];
  score: number;
  confidenceBump: number;
} {
  const good: string[] = [];
  const bad: string[] = [];
  const ugly: string[] = [];
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (UGLY_WORDS.some((word) => lower.includes(word))) {
      ugly.push(humanizeEvidenceLine(line));
    } else if (BAD_WORDS.some((word) => lower.includes(word))) {
      bad.push(humanizeEvidenceLine(line));
    } else if (GOOD_WORDS.some((word) => lower.includes(word))) {
      good.push(humanizeEvidenceLine(line));
    }
  }
  const score = good.length * 1.1 - bad.length * 1.2 - ugly.length * 2.2;
  const confidenceBump = Math.min(0.22, Math.max(0, (good.length + bad.length + ugly.length) / 60));
  return {
    good: dedupe(good),
    bad: dedupe(bad),
    ugly: dedupe(ugly),
    score,
    confidenceBump,
  };
}

function decideVerdict(
  scored: { good: string[]; bad: string[]; ugly: string[]; score: number },
  confidence: number,
  refCount: number,
  recommendationType: string | undefined,
): CockpitVerdict {
  if (refCount === 0 || confidence < 0.24) {
    return "insufficient_evidence";
  }
  if (scored.ugly.length >= 2 || scored.score <= -4) {
    return recommendationType === "trade_preflight" ? "exit_or_sell_candidate" : "trim_or_reduce";
  }
  if (scored.ugly.length === 1 || scored.bad.length >= 3 || scored.score <= -1.5) {
    return "avoid_new_long";
  }
  if (scored.good.length >= 2 && scored.score >= 1.8 && confidence >= 0.5) {
    return "buy_candidate";
  }
  return "watch";
}

function sourceAvailabilityIssue(
  bundle: EvidenceBundle,
  refCount: number,
): { good: string[]; bad: string[]; nextSteps: string[] } | undefined {
  const errors = Object.values(bundle.source_errors);
  if (refCount > 0 || errors.length === 0 || Object.keys(bundle.sources).length > 0) {
    return undefined;
  }

  const rateLimited = errors.some((error) => isRateLimitError(error));
  if (rateLimited) {
    return {
      good: [],
      bad: ["TradeOS public-intel rate limited this request, so the cockpit could not retrieve current evidence."],
      nextSteps: [
        "Retry after the rate-limit window or reduce concurrent cockpit refreshes.",
        "Check the TradeOS public-intel key quota and app configuration if this persists.",
        "Do not treat this as a symbol evidence read until evidence refs are returned.",
      ],
    };
  }

  return {
    good: [],
    bad: ["TradeOS public-intel sources were unavailable, so the cockpit could not retrieve current evidence."],
    nextSteps: [
      "Retry after the upstream TradeOS public-intel source is available.",
      "Check the TradeOS URL, API key, network path, and local runtime logs.",
      "Do not treat this as a symbol evidence read until evidence refs are returned.",
    ],
  };
}

function isRateLimitError(error: string): boolean {
  const lower = error.toLowerCase();
  return lower.includes("429") || lower.includes("too many requests") || lower.includes("rate limit");
}

function actionForVerdict(verdict: CockpitVerdict): CockpitAction {
  switch (verdict) {
    case "buy_candidate":
      return "review_for_entry";
    case "avoid_new_long":
      return "avoid_new_long";
    case "trim_or_reduce":
      return "trim_or_tighten_risk";
    case "exit_or_sell_candidate":
      return "review_exit";
    case "insufficient_evidence":
      return "pass";
    case "watch":
    default:
      return "watch_for_recovery";
  }
}

function nextStepsForVerdict(verdict: CockpitVerdict): string[] {
  switch (verdict) {
    case "buy_candidate":
      return [
        "Treat as a buy candidate only if local feasibility and risk rules pass.",
        "Review evidence freshness before sending anything to an execution system.",
        "Submit feedback after the recommendation outcome is known.",
      ];
    case "avoid_new_long":
      return [
        "Avoid a new long until flow stress, fusion quality, or market context improves.",
        "If already exposed, tighten risk controls and review invalidation.",
        "Set an alert for risk normalization and evidence recovery.",
      ];
    case "trim_or_reduce":
      return [
        "Review weaker exposure for a possible trim.",
        "Keep execution, sizing, and approvals in the local environment.",
        "Watch for evidence recovery before adding risk.",
      ];
    case "exit_or_sell_candidate":
      return [
        "Review exit conditions under local risk policy.",
        "Require explicit approval before any live adapter action.",
        "Preserve evidence IDs for post-action feedback.",
      ];
    case "insufficient_evidence":
      return [
        "Do not treat this as an actionable recommendation.",
        "Fetch deeper or paid intelligence before preflight.",
        "Use feedback to flag evidence as too thin when appropriate.",
      ];
    case "watch":
    default:
      return [
        "Watch for recovery rather than forcing an action.",
        "Wait for stronger agreement across evidence sources.",
        "Re-run the cockpit when fresh TradeOS evidence arrives.",
      ];
  }
}

function defaultGood(verdict: CockpitVerdict): string[] {
  return verdict === "buy_candidate"
    ? ["TradeOS public evidence is constructive enough to review for entry."]
    : ["Some public evidence exists for the symbol."];
}

function defaultBad(verdict: CockpitVerdict): string[] {
  return ["Evidence agreement, liquidity, freshness, or market context may still be incomplete."].filter(
    () => verdict !== "buy_candidate",
  );
}

function defaultUgly(verdict: CockpitVerdict): string[] {
  if (verdict === "trim_or_reduce" || verdict === "exit_or_sell_candidate") {
    return ["Risk evidence is strong enough to require a defensive review."];
  }
  return [];
}

function severityForVerdict(verdict: CockpitVerdict): RecommendationSeverity {
  switch (verdict) {
    case "exit_or_sell_candidate":
    case "trim_or_reduce":
      return "critical";
    case "avoid_new_long":
      return "warning";
    case "watch":
    case "insufficient_evidence":
      return "watch";
    case "buy_candidate":
    default:
      return "info";
  }
}

function titleForVerdict(verdict: CockpitVerdict): string {
  return verdict.replace(/_/g, " ");
}

function buildCardBody(packet: SymbolCockpitPacket): string {
  const firstBad = packet.ugly[0] ?? packet.bad[0] ?? packet.good[0] ?? "Evidence is available for review.";
  return `${titleForVerdict(packet.verdict)}. ${firstBad}`;
}

function extractMarketSnapshot(bundle: EvidenceBundle): MarketSnapshot {
  const current = findMarketNumber(bundle.sources, "current", bundle.generated_at);
  const target = findMarketNumber(bundle.sources, "target", bundle.generated_at);
  return {
    ...(current
      ? {
          price_usd: current.value,
          price_source: current.source,
          price_as_of: current.asOf,
        }
      : {}),
    ...(target
      ? {
          target_price_usd: target.value,
          target_price_source: target.source,
          target_price_note: target.note,
        }
      : {}),
  };
}

function findMarketNumber(
  sources: Record<string, JsonObject>,
  kind: "current" | "target",
  fallbackAsOf: string,
): { value: number; source: string; asOf?: string; note?: string } | undefined {
  for (const [source, payload] of Object.entries(sources)) {
    const found = findMarketNumberInValue(payload, source, source, kind, fallbackAsOf);
    if (found) {
      return found;
    }
  }
  return undefined;
}

function findMarketNumberInValue(
  value: JsonValue | undefined,
  source: string,
  path: string,
  kind: "current" | "target",
  fallbackAsOf: string,
): { value: number; source: string; asOf?: string; note?: string } | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findMarketNumberInValue(value[index], source, `${path}[${index}]`, kind, fallbackAsOf);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  for (const [key, item] of Object.entries(value)) {
    if (isMarketNumberKey(key, kind)) {
      const numeric = numberFromMarketValue(item);
      if (numeric !== undefined) {
        return {
          value: numeric,
          source: `${source}:${path}.${key}`,
          asOf: findTimestamp(value) ?? fallbackAsOf,
          note: findTargetNote(value),
        };
      }
    }
  }

  for (const [key, item] of Object.entries(value)) {
    const found = findMarketNumberInValue(item, source, `${path}.${key}`, kind, fallbackAsOf);
    if (found) {
      return found;
    }
  }
  return undefined;
}

function isMarketNumberKey(key: string, kind: "current" | "target"): boolean {
  const normalized = normalizeEvidenceKey(key);
  if (kind === "target") {
    return [
      "target_price",
      "target_price_usd",
      "price_target",
      "price_target_usd",
      "take_profit",
      "take_profit_price",
      "take_profit_price_usd",
      "tp_price",
      "forecast_price",
      "forecast_price_usd",
      "projected_price",
      "projected_price_usd",
      "expected_price",
      "expected_price_usd",
    ].includes(normalized);
  }
  if (normalized.includes("target") || normalized.includes("take_profit") || normalized.startsWith("tp_")) {
    return false;
  }
  return [
    "price",
    "price_usd",
    "current_price",
    "current_price_usd",
    "latest_price",
    "latest_price_usd",
    "last_price",
    "last_price_usd",
    "mark_price",
    "mark_price_usd",
    "spot_price",
    "spot_price_usd",
    "close",
    "close_price",
    "close_usd",
  ].includes(normalized);
}

function normalizeEvidenceKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function numberFromMarketValue(value: JsonValue | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return roundMarketNumber(value);
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[$,\s]/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) {
      return roundMarketNumber(parsed);
    }
  }
  return undefined;
}

function roundMarketNumber(value: number): number {
  if (value >= 100) return Math.round(value * 100) / 100;
  if (value >= 1) return Math.round(value * 10_000) / 10_000;
  return Math.round(value * 100_000_000) / 100_000_000;
}

function findTimestamp(value: JsonObject): string | undefined {
  for (const key of ["price_ts", "price_as_of", "as_of", "timestamp", "ts", "updated_at", "observed_at", "created_at", "generated_at"]) {
    const item = value[key];
    if (typeof item === "string" && item.trim()) {
      return item.trim();
    }
  }
  return undefined;
}

function findTargetNote(value: JsonObject): string | undefined {
  for (const key of ["target_price_note", "price_target_note", "target_note", "forecast_note"]) {
    const item = value[key];
    if (typeof item === "string" && item.trim()) {
      return item.trim().slice(0, 240);
    }
  }
  return undefined;
}

function chooseDrivers(primary: string[], fallback: string[], limit: number): string[] {
  const drivers = dedupe(primary).slice(0, limit);
  if (drivers.length > 0) {
    return drivers;
  }
  return fallback.slice(0, limit);
}

function refToEvidence(id: string, symbol: string): EvidenceRef {
  const [source] = id.split(":", 1);
  return {
    id,
    source: source || "tradeos_public_intel",
    target: symbol,
  };
}

function humanizeEvidenceLine(line: string): string {
  return line
    .replace(/\s+/g, " ")
    .replace(/^([a-z0-9_-]+):/i, "")
    .trim()
    .slice(0, 240);
}

function looksLikeEvidence(text: string): boolean {
  const lower = text.toLowerCase();
  return [...GOOD_WORDS, ...BAD_WORDS, ...UGLY_WORDS].some((word) => lower.includes(word));
}

function explicitSymbolFromObject(value: JsonObject): string | undefined {
  for (const key of ["symbol", "token_symbol", "ticker", "asset", "base_symbol", "base_asset"]) {
    const item = value[key];
    if (typeof item === "string" && item.trim()) {
      return item;
    }
  }
  return undefined;
}

function symbolMatches(candidate: string, symbol: string): boolean {
  const normalized = normalizeSymbolCandidate(candidate);
  return (
    normalized === symbol ||
    normalized === `${symbol}USD` ||
    normalized === `${symbol}USDC` ||
    normalized === `${symbol}USDT`
  );
}

function normalizeSymbolCandidate(candidate: string): string {
  return candidate
    .trim()
    .replace(/^\$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toUpperCase();
}

function textMentionsSymbol(text: string, symbol: string): boolean {
  const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^A-Z0-9])\\$?${escaped}([A-Z0-9]{0,5})?($|[^A-Z0-9])`, "i").test(text);
}

function mentionsOtherCashtag(text: string, symbol: string): boolean {
  const matches = text.match(/\$[A-Z][A-Z0-9]{1,15}\b/g) ?? [];
  return matches.some((candidate) => !symbolMatches(candidate, symbol));
}

function isBroadMarketContext(source: string, text: string, symbol: string): boolean {
  if (source !== "digest" || mentionsOtherCashtag(text, symbol)) {
    return false;
  }
  const lower = text.toLowerCase();
  return (
    looksLikeEvidence(text) &&
    [
      "global crypto",
      "market context",
      "market regime",
      "dominance",
      "sector",
      "breadth",
      "rotation",
      "microstructure",
    ].some((term) => lower.includes(term))
  );
}

function looksLikeMachineIdentifier(text: string): boolean {
  return /^[a-z][a-z0-9_-]{2,}$/i.test(text) && !text.includes(" ");
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
