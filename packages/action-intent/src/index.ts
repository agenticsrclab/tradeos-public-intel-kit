import { createHash } from "node:crypto";

export const ACTION_INTENT_SCHEMA_VERSION = "tradeos.action_intent.v1" as const;

export type OperatorChoice =
  | "venue"
  | "account"
  | "size"
  | "order_type"
  | "timing"
  | "approval"
  | "custody"
  | "executor";

export type ActionIntentBoundary = {
  tradeos_role: "intelligence_and_non_executable_intent";
  operator_role: "execution_sizing_custody_approvals_and_risk";
  live_execution: "outside_public_kit";
  third_party_executor: "independent_if_used";
};

export interface ActionIntent {
  schema_version: typeof ACTION_INTENT_SCHEMA_VERSION;
  intent_id: string;
  target_id: string;
  symbol: string;
  chain?: string;
  suggested_action: string;
  recommendation_type?: string;
  confidence?: number;
  evidence_refs: string[];
  risk_flags: string[];
  reasons: string[];
  non_executable: true;
  requires_operator_review: true;
  operator_must_choose: OperatorChoice[];
  prohibited_execution_fields: string[];
  boundary: ActionIntentBoundary;
  source?: string;
  created_at: string;
  expires_at?: string;
}

export interface CreateActionIntentInput {
  target_id: string;
  symbol: string;
  chain?: string;
  suggested_action: string;
  recommendation_type?: string;
  confidence?: number;
  evidence_refs?: string[];
  risk_flags?: string[];
  reasons?: string[];
  source?: string;
  created_at?: string;
  expires_at?: string;
  operator_must_choose?: OperatorChoice[];
}

export interface ActionIntentValidationResult {
  valid: boolean;
  reasons: string[];
  forbidden_fields_present: string[];
}

export const DEFAULT_OPERATOR_CHOICES: OperatorChoice[] = [
  "venue",
  "account",
  "size",
  "order_type",
  "timing",
  "approval",
  "custody",
  "executor",
];

export const PROHIBITED_EXECUTION_FIELDS = [
  "venue",
  "account",
  "account_id",
  "wallet_address",
  "broker",
  "exchange",
  "order_type",
  "quantity",
  "amount",
  "notional",
  "notional_usd",
  "limit_price",
  "market_price",
  "slippage_bps",
  "deadline",
  "calldata",
  "transaction",
  "tx",
  "to",
  "data",
  "execute_url",
  "route",
  "router",
];

const DEFAULT_BOUNDARY: ActionIntentBoundary = {
  tradeos_role: "intelligence_and_non_executable_intent",
  operator_role: "execution_sizing_custody_approvals_and_risk",
  live_execution: "outside_public_kit",
  third_party_executor: "independent_if_used",
};

export function createActionIntent(input: CreateActionIntentInput): ActionIntent {
  const createdAt = input.created_at ?? new Date().toISOString();
  const evidenceRefs = dedupe(input.evidence_refs ?? []);
  const riskFlags = dedupe(input.risk_flags ?? []);
  const reasons = dedupe(input.reasons ?? []);
  const intentId = stableIntentId({
    target_id: input.target_id,
    symbol: input.symbol.toUpperCase(),
    suggested_action: input.suggested_action,
    evidence_refs: evidenceRefs,
    created_at: createdAt,
  });

  return {
    schema_version: ACTION_INTENT_SCHEMA_VERSION,
    intent_id: intentId,
    target_id: input.target_id,
    symbol: input.symbol.toUpperCase(),
    chain: input.chain,
    suggested_action: input.suggested_action,
    recommendation_type: input.recommendation_type,
    confidence: input.confidence,
    evidence_refs: evidenceRefs,
    risk_flags: riskFlags,
    reasons,
    non_executable: true,
    requires_operator_review: true,
    operator_must_choose: input.operator_must_choose ?? DEFAULT_OPERATOR_CHOICES,
    prohibited_execution_fields: PROHIBITED_EXECUTION_FIELDS,
    boundary: DEFAULT_BOUNDARY,
    source: input.source ?? "tradeos.symbol_cockpit",
    created_at: createdAt,
    expires_at: input.expires_at,
  };
}

export function isActionIntent(value: unknown): value is ActionIntent {
  return Boolean(value)
    && typeof value === "object"
    && (value as { schema_version?: unknown }).schema_version === ACTION_INTENT_SCHEMA_VERSION;
}

export function validateActionIntent(value: unknown): ActionIntentValidationResult {
  if (!isRecord(value)) {
    return { valid: false, reasons: ["intent_not_object"], forbidden_fields_present: [] };
  }
  const forbidden = PROHIBITED_EXECUTION_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(value, field));
  const reasons: string[] = [];
  if (value.schema_version !== ACTION_INTENT_SCHEMA_VERSION) {
    reasons.push("wrong_schema_version");
  }
  if (value.non_executable !== true) {
    reasons.push("non_executable_must_be_true");
  }
  if (value.requires_operator_review !== true) {
    reasons.push("requires_operator_review_must_be_true");
  }
  if (forbidden.length > 0) {
    reasons.push("contains_executable_fields");
  }
  if (!Array.isArray(value.operator_must_choose) || value.operator_must_choose.length === 0) {
    reasons.push("operator_must_choose_required");
  }
  return { valid: reasons.length === 0, reasons, forbidden_fields_present: forbidden };
}

export function actionIntentReviewSummary(intent: ActionIntent): string {
  return `${intent.symbol} ${intent.suggested_action}: non-executable intent; operator must choose ${intent.operator_must_choose.join(", ")}.`;
}

function stableIntentId(parts: Record<string, unknown>): string {
  const digest = createHash("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 18);
  return `action_intent_${digest}`;
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
