import type { BriefingConfig, OutputPlatform } from "./types.js";

export async function publishBriefing(text: string, config: BriefingConfig): Promise<void> {
  switch (config.platform) {
    case "stdout":
      console.log(text);
      return;
    case "discord":
      await postDiscord(text, required(config.discordWebhookUrl, "DISCORD_WEBHOOK_URL"));
      return;
    case "telegram":
      await postTelegram(
        text,
        required(config.telegramBotToken, "TELEGRAM_BOT_TOKEN"),
        required(config.telegramChatId, "TELEGRAM_CHAT_ID"),
      );
      return;
    default:
      throw new Error(`Unsupported platform: ${config.platform satisfies never}`);
  }
}

export function parsePlatform(value: string | undefined): OutputPlatform {
  const normalized = (value || "stdout").toLowerCase();
  switch (normalized) {
    case "stdout":
    case "discord":
    case "telegram":
      return normalized;
    default:
      throw new Error("TRADEOS_BRIEFING_PLATFORM must be stdout, discord, or telegram.");
  }
}

async function postDiscord(text: string, webhookUrl: string): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      content: truncate(text, 1900),
      allowed_mentions: { parse: [] },
    }),
  });
  await assertOk(response, "Discord webhook");
}

async function postTelegram(text: string, botToken: string, chatId: string): Promise<void> {
  const url = `https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: truncate(text, 3900),
      disable_web_page_preview: true,
    }),
  });
  await assertOk(response, "Telegram Bot API");
}

async function assertOk(response: Response, label: string): Promise<void> {
  if (response.ok) {
    return;
  }
  const body = await response.text();
  throw new Error(`${label} publish failed: ${response.status} ${response.statusText} ${body}`);
}

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} is required for this platform.`);
  }
  return value;
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 30).trim()}\n\n[truncated for platform limit]`;
}
