#!/usr/bin/env node
import OpenAI from "openai";
import { TradeOSPublicIntelClient } from "@tradeos/public-intel-sdk";
import type { JsonObject } from "@tradeos/public-intel-sdk";
import { buildAskPrompt, extractDigestSummary } from "./prompt.js";

const DEFAULT_LLM_PROVIDER = "venice";
const DEFAULT_OPENAI_COMPATIBLE_BASE_URL = "https://api.venice.ai/api/v1";
const DEFAULT_VENICE_MODEL = "z-ai-glm-5-turbo";
const DEFAULT_AGENT_TIMEOUT_MS = 45_000;
const DEFAULT_AGENT_MAX_RETRIES = 1;
const DEFAULT_ASK_DIGEST_LIMIT = 5;

async function main(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;
  const client = new TradeOSPublicIntelClient({
    appName: process.env.TRADEOS_CLIENT_APP ?? "tradeos-agent-cli",
    appVersion: process.env.TRADEOS_CLIENT_VERSION ?? "0.1.0",
  });

  switch (command) {
    case "auth": {
      const appAttribution = await appAttributionStatus(client);
      printJson({
        schema_version: "tradeos.public_intel.cli_auth_status.v1",
        api_base: client.baseUrl,
        public_intel_key_configured: Boolean(process.env.TRADEOS_PUBLIC_INTEL_KEY),
        client_app: client.appName,
        client_version: client.appVersion,
        app_attribution: appAttribution,
        api_key_generation: "available_with_tradeos_account_token",
        note:
          "Use tradeos-intel keys create/list/revoke with TRADEOS_ACCOUNT_TOKEN. The CLI does not include TradeOS login yet.",
      });
      return;
    }
    case "keys": {
      await handleKeysCommand(client, rest);
      return;
    }
    case "digest": {
      const digest = await client.getMarketDigest(parseFlags(rest));
      printJson(extractDigestSummary(digest));
      return;
    }
    case "candidates": {
      printJson(await client.getPublicCandidates(parseFlags(rest)));
      return;
    }
    case "watchlist": {
      printJson(await client.getThesisWatchlist(parseFlags(rest)));
      return;
    }
    case "feedback": {
      const flags = parseFlags(rest);
      const targetType = String(flags.targetType ?? flags.target_type ?? "digest");
      const targetId = String(flags.targetId ?? flags.target_id ?? "");
      const label = String(flags.label ?? "");
      if (!targetId || !label) {
        throw new Error("feedback requires --target-id and --label");
      }
      printJson(
        await client.submitDigestFeedback({
          targetType,
          targetId,
          label,
          optionalNote: flags.note ? String(flags.note) : undefined,
          consentForDatasetUse: Boolean(flags.consentForDatasetUse ?? flags.consent),
          anonymousSessionIdOrUserId: optionalString(flags.anonymousSessionId ?? flags.userId ?? flags.sessionId),
          clientApp: optionalString(flags.clientApp),
          clientVersion: optionalString(flags.clientVersion),
          feedbackSource: optionalString(flags.feedbackSource ?? flags.source),
          automationLevel: optionalString(flags.automationLevel),
          agentId: optionalString(flags.agentId),
          agentRunId: optionalString(flags.agentRunId),
          agentModel: optionalString(flags.agentModel),
          agentConfidence: optionalNumber(flags.agentConfidence),
          provenanceNote: optionalString(flags.provenanceNote),
        }),
      );
      return;
    }
    case "ask": {
      const question = rest.join(" ").trim();
      if (!question) {
        throw new Error('ask requires a question, for example: tradeos-intel ask "What changed?"');
      }
      const digest = extractDigestSummary(
        await client.getMarketDigest({ limit: envNumber("TRADEOS_AGENT_DIGEST_LIMIT", DEFAULT_ASK_DIGEST_LIMIT) }),
      );
      const answer = await askWithOpenAICompatible(question, digest);
      console.log(answer);
      return;
    }
    case "help":
    case undefined:
      console.log(helpText());
      return;
    default:
      throw new Error(`Unknown command: ${command}\n\n${helpText()}`);
  }
}

async function handleKeysCommand(client: TradeOSPublicIntelClient, args: string[]): Promise<void> {
  const [subcommand, ...rest] = args;
  const flags = parseFlags(rest);
  switch (subcommand) {
    case "create": {
      const appName = optionalString(flags.appName ?? flags.app) ?? client.appName;
      printJson(
        await client.createAppKey(
          {
            appName,
            scopes: optionalStringList(flags.scopes),
            expiresAt: optionalString(flags.expiresAt),
          },
          { accountToken: requireAccountToken() },
        ),
      );
      return;
    }
    case "list": {
      printJson(await client.listAppKeys({ accountToken: requireAccountToken() }));
      return;
    }
    case "revoke": {
      const keyId = optionalString(flags.keyId ?? flags.id ?? rest.find((item) => !item.startsWith("--")));
      if (!keyId) {
        throw new Error("keys revoke requires --key-id <id>");
      }
      printJson(await client.revokeAppKey(keyId, { accountToken: requireAccountToken() }));
      return;
    }
    default:
      throw new Error(`Unknown keys command: ${subcommand ?? ""}\n\n${helpText()}`);
  }
}

async function appAttributionStatus(client: TradeOSPublicIntelClient): Promise<JsonObject> {
  try {
    return await client.getAppAttribution();
  } catch (error: unknown) {
    return {
      status: "unavailable",
      valid: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function requireAccountToken(): string {
  const token = process.env.TRADEOS_ACCOUNT_TOKEN;
  if (!token) {
    throw new Error("TRADEOS_ACCOUNT_TOKEN is required for app-key management.");
  }
  return token;
}

async function askWithOpenAICompatible(question: string, evidence: JsonObject): Promise<string> {
  const provider = process.env.LLM_PROVIDER ?? DEFAULT_LLM_PROVIDER;
  const isVenice = provider === DEFAULT_LLM_PROVIDER;
  const apiKey = isVenice ? process.env.VENICE_API_KEY ?? process.env.OPENAI_API_KEY : process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      isVenice
        ? "VENICE_API_KEY is required for ask by default. OPENAI_API_KEY also works for Venice-compatible config."
        : "OPENAI_API_KEY is required for ask with non-Venice providers.",
    );
  }
  const model = process.env.TRADEOS_AGENT_MODEL ?? (isVenice ? DEFAULT_VENICE_MODEL : undefined);
  if (!model) {
    throw new Error("TRADEOS_AGENT_MODEL is required for ask with non-Venice providers.");
  }
  const baseURL = process.env.OPENAI_BASE_URL ?? (isVenice ? DEFAULT_OPENAI_COMPATIBLE_BASE_URL : undefined);
  const timeout = envNumber("TRADEOS_AGENT_TIMEOUT_MS", DEFAULT_AGENT_TIMEOUT_MS);
  const maxRetries = envNumber("TRADEOS_AGENT_MAX_RETRIES", DEFAULT_AGENT_MAX_RETRIES);
  const openai = new OpenAI({
    apiKey,
    baseURL,
    timeout,
    maxRetries,
  });
  const response = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are a cautious public intelligence assistant. You do not provide personalized financial advice or trade instructions.",
      },
      {
        role: "user",
        content: buildAskPrompt(question, evidence),
      },
    ],
  });
  return response.choices[0]?.message?.content?.trim() || "";
}

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseFlags(args: string[]): Record<string, string | number | boolean> {
  const flags: Record<string, string | number | boolean> = {};
  for (let index = 0; index < args.length; index += 1) {
    const raw = args[index];
    if (!raw?.startsWith("--")) {
      continue;
    }
    const key = camelCase(raw.slice(2));
    const next = args[index + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
      continue;
    }
    flags[key] = numericIfPossible(next);
    index += 1;
  }
  return flags;
}

function camelCase(value: string): string {
  return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function numericIfPossible(value: string): string | number {
  const numeric = Number(value);
  return Number.isFinite(numeric) && value.trim() !== "" ? numeric : value;
}

function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(value);
}

function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function optionalStringList(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

function helpText(): string {
  return `TradeOS public intelligence CLI

Commands:
  auth
  keys create --app-name <name> [--scopes public_intel.feedback:write]
  keys list
  keys revoke --key-id <pubkey_id>
  digest [--limit 10] [--chain-id 8453]
  candidates [--limit 10] [--chain-id 8453]
  watchlist [--limit 10] [--chain-id 8453]
  feedback --target-id <id> --label useful [--target-type digest]
    [--feedback-source human|human_assisted|agent|automation]
    [--automation-level none|assisted|automated|autonomous]
    [--agent-id <id>] [--agent-run-id <id>] [--agent-model <model>]
  ask "What changed in crypto market stress?"

Environment:
  TRADEOS_API_BASE=https://api.tradeos.tech/v1/public-intel
  TRADEOS_ACCOUNT_TOKEN=
  TRADEOS_PUBLIC_INTEL_KEY=
  TRADEOS_CLIENT_APP=tradeos-agent-cli
  TRADEOS_CLIENT_VERSION=0.1.0
  LLM_PROVIDER=venice
  OPENAI_BASE_URL=https://api.venice.ai/api/v1
  VENICE_API_KEY=...
  TRADEOS_AGENT_MODEL=z-ai-glm-5-turbo
  TRADEOS_AGENT_TIMEOUT_MS=45000
  TRADEOS_AGENT_DIGEST_LIMIT=5
`;
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
