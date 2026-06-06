import type { JsonObject } from "@tradeos/public-intel-sdk";

export function jsonText(value: unknown): { content: Array<{ type: "text"; text: string }> } {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

export function safetyEnvelope(payload: JsonObject): JsonObject {
  return {
    safety_notice:
      "TradeOS public intelligence is descriptive evidence, not personalized financial advice or a trade instruction.",
    ...payload,
  };
}

