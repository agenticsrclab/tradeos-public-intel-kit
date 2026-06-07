import type { JsonObject, SymbolCockpitPacket } from "@tradeos/cockpit-core";

export interface OpenAICompatibleModelOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export interface ActionAgentAnswer {
  schema_version: "tradeos.symbol_cockpit.action_agent_answer.v1";
  model: string;
  provider_base_url: string;
  answer: string;
  used_evidence_refs: string[];
}

const DEFAULT_VENICE_BASE_URL = "https://api.venice.ai/api/v1";
const DEFAULT_VENICE_MODEL = "z-ai-glm-5-turbo";

export class OpenAICompatibleActionAgent {
  readonly apiKey?: string;
  readonly baseUrl: string;
  readonly model: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;

  constructor(options: OpenAICompatibleModelOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.VENICE_API_KEY ?? process.env.OPENAI_API_KEY;
    this.baseUrl = (options.baseUrl ?? process.env.OPENAI_BASE_URL ?? DEFAULT_VENICE_BASE_URL).replace(/\/+$/, "");
    this.model = options.model ?? process.env.TRADEOS_AGENT_MODEL ?? DEFAULT_VENICE_MODEL;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.timeoutMs = options.timeoutMs ?? Number(process.env.TRADEOS_AGENT_TIMEOUT_MS ?? 45_000);
  }

  async answer(question: string, cockpit: SymbolCockpitPacket): Promise<ActionAgentAnswer> {
    if (!this.apiKey) {
      throw new Error("VENICE_API_KEY or OPENAI_API_KEY is required for the cockpit action agent.");
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You are the local TradeOS Symbol Cockpit action agent. Ground every answer in the provided evidence packet. Do not claim guaranteed returns, custody assets, or place orders.",
            },
            {
              role: "user",
              content: buildActionAgentPrompt(question, cockpit),
            },
          ],
        }),
        signal: controller.signal,
      });
      const text = await response.text();
      const payload = text ? (JSON.parse(text) as JsonObject) : {};
      if (!response.ok) {
        throw new Error(`Model provider request failed: ${response.status} ${response.statusText}`);
      }
      const answer = extractAnswer(payload);
      return {
        schema_version: "tradeos.symbol_cockpit.action_agent_answer.v1",
        model: this.model,
        provider_base_url: this.baseUrl,
        answer,
        used_evidence_refs: cockpit.evidence_refs,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function buildActionAgentPrompt(question: string, cockpit: SymbolCockpitPacket): string {
  return `Question: ${question}

Use only this Symbol Cockpit packet and preserve uncertainty:
${JSON.stringify(cockpit, null, 2)}

Answer format:
- Direct answer
- Evidence used
- Local-only next action
- Limitation`;
}

function extractAnswer(payload: JsonObject): string {
  const choices = payload.choices;
  if (Array.isArray(choices)) {
    const first = choices[0] as JsonObject | undefined;
    const message = first?.message;
    if (message && typeof message === "object" && !Array.isArray(message)) {
      const content = (message as JsonObject).content;
      if (typeof content === "string") {
        return content.trim();
      }
    }
  }
  return "";
}

