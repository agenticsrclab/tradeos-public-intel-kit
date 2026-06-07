import { randomUUID } from "node:crypto";
import type { ApprovalDecision, ApprovalRequest } from "./types.js";

export function createApprovalRequest(input: {
  target_id: string;
  action: string;
  summary: string;
  ttlSeconds?: number;
  now?: Date;
}): ApprovalRequest {
  const now = input.now ?? new Date();
  return {
    approval_id: `approval_${randomUUID()}`,
    target_id: input.target_id,
    action: input.action,
    summary: input.summary,
    status: "pending",
    requested_at: now.toISOString(),
    expires_at: input.ttlSeconds ? new Date(now.getTime() + input.ttlSeconds * 1000).toISOString() : undefined,
  };
}

export function decideApproval(
  request: ApprovalRequest,
  status: "approved" | "rejected",
  options: { operator_id?: string; reason?: string; now?: Date } = {},
): { request: ApprovalRequest; decision: ApprovalDecision } {
  const now = options.now ?? new Date();
  const decision: ApprovalDecision = {
    approval_id: request.approval_id,
    status,
    decided_at: now.toISOString(),
    operator_id: options.operator_id,
    reason: options.reason,
  };
  return {
    request: {
      ...request,
      status,
    },
    decision,
  };
}

export function expireApproval(request: ApprovalRequest, now = new Date()): ApprovalRequest {
  if (request.status !== "pending" || !request.expires_at) {
    return request;
  }
  if (new Date(request.expires_at).getTime() > now.getTime()) {
    return request;
  }
  return {
    ...request,
    status: "expired",
  };
}

