import { createHash, randomUUID } from "node:crypto";

export function stableId(prefix: string, value: unknown): string {
  const body = JSON.stringify(canonical(value));
  const hash = createHash("sha256").update(body).digest("hex").slice(0, 24);
  return `${prefix}_${hash}`;
}

export function idempotencyKey(prefix = "tradeos_public_intel"): string {
  return `${prefix}_${randomUUID()}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonical);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  return value;
}
