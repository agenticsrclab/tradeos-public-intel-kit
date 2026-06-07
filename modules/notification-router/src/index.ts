import type { RecommendationCard } from "@tradeos/cockpit-core";
import nodemailer from "nodemailer";

export type NotificationChannelKind = "stdout" | "webhook" | "email";
export type NotificationSeverity = "info" | "watch" | "warning" | "critical";

export interface SmtpNotificationConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  from?: string;
  secure?: boolean;
  startTls?: boolean;
  timeoutMs?: number;
}

export interface NotificationChannel {
  id: string;
  kind: NotificationChannelKind;
  target?: string;
  minSeverity?: NotificationSeverity;
  enabled?: boolean;
  subjectPrefix?: string;
  smtp?: SmtpNotificationConfig;
}

export interface NotificationDelivery {
  schema_version: "tradeos.module.notification_router.delivery.v1";
  delivery_id: string;
  channel_id: string;
  card_id: string;
  target_id: string;
  status: "sent" | "skipped" | "failed";
  reason: string;
  delivered_at: string;
}

export interface MailMessage {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface MailSendResult {
  accepted?: unknown[];
  rejected?: unknown[];
}

export type MailSender = {
  sendMail(message: MailMessage): Promise<MailSendResult>;
};

export type MailSenderFactory = (smtp: RequiredSmtpNotificationConfig) => MailSender;

export interface RequiredSmtpNotificationConfig {
  host: string;
  port: number;
  user?: string;
  password?: string;
  from: string;
  secure: boolean;
  startTls: boolean;
  timeoutMs: number;
}

const SEVERITY_RANK = {
  info: 1,
  watch: 2,
  warning: 3,
  critical: 4,
};

export class NotificationRouter {
  constructor(
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly mailSenderFactory: MailSenderFactory = createNodemailerSender,
  ) {}

  async deliver(card: RecommendationCard, channels: NotificationChannel[], now = new Date()): Promise<NotificationDelivery[]> {
    const deliveries: NotificationDelivery[] = [];
    for (const channel of channels) {
      const deliveryBase = {
        schema_version: "tradeos.module.notification_router.delivery.v1" as const,
        delivery_id: `delivery_${channel.id}_${card.card_id}`,
        channel_id: channel.id,
        card_id: card.card_id,
        target_id: card.target_id,
        delivered_at: now.toISOString(),
      };
      if (channel.enabled === false) {
        deliveries.push({ ...deliveryBase, status: "skipped", reason: "channel_disabled" });
        continue;
      }
      if (SEVERITY_RANK[card.severity] < SEVERITY_RANK[channel.minSeverity ?? "info"]) {
        deliveries.push({ ...deliveryBase, status: "skipped", reason: "below_min_severity" });
        continue;
      }
      if (channel.kind === "stdout") {
        deliveries.push({ ...deliveryBase, status: "sent", reason: `${card.title}: ${card.body}` });
        continue;
      }
      if (channel.kind === "email") {
        deliveries.push(await this.deliverEmail(card, channel, deliveryBase));
        continue;
      }
      if (!channel.target) {
        deliveries.push({ ...deliveryBase, status: "failed", reason: "missing_webhook_target" });
        continue;
      }
      try {
        const response = await this.fetchImpl(channel.target, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ card }),
        });
        deliveries.push({ ...deliveryBase, status: response.ok ? "sent" : "failed", reason: String(response.status) });
      } catch (error: unknown) {
        deliveries.push({
          ...deliveryBase,
          status: "failed",
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return deliveries;
  }

  private async deliverEmail(
    card: RecommendationCard,
    channel: NotificationChannel,
    deliveryBase: Omit<NotificationDelivery, "status" | "reason">,
  ): Promise<NotificationDelivery> {
    if (!channel.target) {
      return { ...deliveryBase, status: "failed", reason: "missing_email_target" };
    }
    const smtp = resolveSmtpConfig(channel.smtp);
    if (!smtp.ok) {
      return { ...deliveryBase, status: "failed", reason: `missing_email_config:${smtp.missing.join(",")}` };
    }
    try {
      const response = await this.mailSenderFactory(smtp.config).sendMail({
        from: smtp.config.from,
        to: channel.target,
        subject: buildEmailSubject(card, channel.subjectPrefix),
        text: buildEmailBody(card),
        html: buildEmailHtml(card),
      });
      const accepted = response.accepted?.length ?? 0;
      const rejected = response.rejected?.length ?? 0;
      return {
        ...deliveryBase,
        status: accepted > 0 && rejected === 0 ? "sent" : "failed",
        reason: `smtp_accepted=${accepted};smtp_rejected=${rejected}`,
      };
    } catch (error: unknown) {
      return {
        ...deliveryBase,
        status: "failed",
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export function emailChannelFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  options: {
    id?: string;
    target?: string;
    minSeverity?: NotificationSeverity;
    enabled?: boolean;
    subjectPrefix?: string;
  } = {},
): NotificationChannel | undefined {
  const enabled = options.enabled ?? parseBoolean(firstEnv(env, "COCKPIT_ALERT_EMAIL_ENABLED"), false);
  if (!enabled) {
    return undefined;
  }
  return {
    id: options.id ?? "operator_email",
    kind: "email",
    target: options.target ?? firstEnv(env, "COCKPIT_ALERT_EMAIL_TO", "ALERT_EMAIL_TO"),
    minSeverity: options.minSeverity ?? severityFromEnv(firstEnv(env, "COCKPIT_ALERT_EMAIL_MIN_SEVERITY"), "warning"),
    subjectPrefix: options.subjectPrefix ?? firstEnv(env, "COCKPIT_ALERT_EMAIL_SUBJECT_PREFIX") ?? "TradeOS Symbol Cockpit",
    smtp: {
      host: firstEnv(env, "COCKPIT_SMTP_HOST", "SMTP_HOST"),
      port: numberFrom(firstEnv(env, "COCKPIT_SMTP_PORT", "SMTP_PORT"), 587),
      user: firstEnv(env, "COCKPIT_SMTP_USER", "SMTP_USER"),
      password: firstEnv(env, "COCKPIT_SMTP_PASSWORD", "SMTP_PASSWORD"),
      from: firstEnv(env, "COCKPIT_SMTP_FROM", "SMTP_FROM", "SMTP_USER"),
      secure: parseBoolean(firstEnv(env, "COCKPIT_SMTP_SECURE", "SMTP_SECURE"), false),
      startTls: parseBoolean(firstEnv(env, "COCKPIT_SMTP_STARTTLS", "SMTP_STARTTLS"), true),
      timeoutMs: numberFrom(firstEnv(env, "COCKPIT_SMTP_TIMEOUT_MS", "SMTP_TIMEOUT_MS"), 10_000),
    },
  };
}

function buildEmailSubject(card: RecommendationCard, prefix = "TradeOS Symbol Cockpit"): string {
  return `[${prefix} ${card.severity.toUpperCase()}] ${card.symbol} ${card.verdict}`;
}

function buildEmailBody(card: RecommendationCard): string {
  const price = card.market_snapshot?.price_usd === undefined ? "not supplied by evidence" : formatUsd(card.market_snapshot.price_usd);
  const targetPrice =
    card.market_snapshot?.target_price_usd === undefined ? "not supplied by evidence" : formatUsd(card.market_snapshot.target_price_usd);
  const feedbackUrl = card.feedback_url ?? card.feedback_target.url;
  return [
    "TradeOS Symbol Cockpit Alert",
    "",
    `Symbol: ${card.symbol}`,
    `Chain: ${card.chain ?? "n/a"}`,
    `Verdict: ${card.verdict}`,
    `Action: ${card.action}`,
    `Severity: ${card.severity}`,
    `Confidence: ${Math.round(card.confidence * 100)}%`,
    `Price at note: ${price}`,
    `Price source: ${card.market_snapshot?.price_source ?? "n/a"}`,
    `Price as of: ${card.market_snapshot?.price_as_of ?? card.created_at}`,
    `Target price: ${targetPrice}`,
    `Target source: ${card.market_snapshot?.target_price_source ?? "n/a"}`,
    `Target ID: ${card.target_id}`,
    `Card ID: ${card.card_id}`,
    "",
    card.title,
    card.body,
    "",
    "What triggered this:",
    ...driverLines("Ugly", card.drivers?.ugly),
    ...driverLines("Bad", card.drivers?.bad),
    ...driverLines("Good", card.drivers?.good),
    "",
    "Next steps:",
    ...(card.drivers?.next_steps?.length ? card.drivers.next_steps.map((item) => `- ${item}`) : ["- Review locally before taking action."]),
    "",
    `Feedback target: ${card.feedback_target.target_id}`,
    `Feedback URL: ${feedbackUrl ?? "not configured"}`,
    `Evidence refs: ${card.evidence_refs.join(", ") || "none"}`,
    ...(card.evidence?.length ? card.evidence.map((item) => `- ${item.source}: ${item.id}${item.url ? ` (${item.url})` : ""}`) : []),
    "",
    "Execution, sizing, custody, and live approvals remain local-only.",
  ].join("\n");
}

function buildEmailHtml(card: RecommendationCard): string {
  const feedbackUrl = card.feedback_url ?? card.feedback_target.url;
  const usefulUrl = feedbackUrlForLabel(feedbackUrl, "useful");
  const wrongUrl = feedbackUrlForLabel(feedbackUrl, "not_useful");
  const missingContextUrl = feedbackUrlForLabel(feedbackUrl, "missing_context");
  const price = card.market_snapshot?.price_usd === undefined ? "Not supplied" : formatUsd(card.market_snapshot.price_usd);
  const targetPrice = card.market_snapshot?.target_price_usd === undefined ? "Not supplied" : formatUsd(card.market_snapshot.target_price_usd);
  const severityColor = severityAccent(card.severity);
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f5f7fb;color:#111827;font-family:Inter,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="width:680px;max-width:94%;background:#ffffff;border:1px solid #d9e0ea;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;border-left:6px solid ${severityColor};background:#101827;color:#ffffff;">
                <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#cbd5e1;">TradeOS Symbol Cockpit</div>
                <h1 style="margin:6px 0 0;font-size:24px;line-height:1.25;">${escapeHtml(card.symbol)}: ${escapeHtml(readable(card.verdict))}</h1>
                <div style="margin-top:8px;color:#dbeafe;font-size:14px;">${escapeHtml(readable(card.action))} | ${escapeHtml(card.severity)} | ${Math.round(card.confidence * 100)}% confidence</div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    ${metricCell("Price at note", price, card.market_snapshot?.price_source)}
                    ${metricCell("Target price", targetPrice, card.market_snapshot?.target_price_source)}
                    ${metricCell("Chain", card.chain ?? "n/a", `As of ${card.market_snapshot?.price_as_of ?? card.created_at}`)}
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 18px;">
                ${section("Recommendation", `<p style="margin:0;color:#1f2937;line-height:1.55;">${escapeHtml(card.body)}</p>`)}
                ${section("What Triggered This", driversHtml(card))}
                ${section("Evidence", evidenceHtml(card))}
                ${section("Next Local Steps", listHtml(card.drivers?.next_steps ?? ["Review locally before taking action."]))}
                ${section(
                  "Feedback",
                  feedbackUrl
                    ? `<p style="margin:0 0 12px;color:#374151;line-height:1.5;">These links open a feedback form with the stable target prefilled. The click itself does not place an order.</p>
                       ${buttonHtml(usefulUrl, "Useful")}
                       ${buttonHtml(wrongUrl, "Wrong")}
                       ${buttonHtml(missingContextUrl, "Missing Context")}`
                    : `<p style="margin:0;color:#374151;line-height:1.5;">Feedback URL is not configured. Target ID: <code>${escapeHtml(card.target_id)}</code></p>`,
                )}
                <p style="margin:18px 0 0;padding-top:14px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;line-height:1.5;">
                  Execution, sizing, custody, and live approvals remain local-only. Target ID: ${escapeHtml(card.target_id)}. Card ID: ${escapeHtml(card.card_id)}.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function metricCell(label: string, value: string, detail?: string): string {
  return `<td style="width:33.33%;padding:0 8px 0 0;vertical-align:top;">
    <div style="border:1px solid #e5e7eb;border-radius:10px;padding:12px;background:#fbfdff;">
      <div style="font-size:12px;color:#6b7280;">${escapeHtml(label)}</div>
      <div style="margin-top:4px;font-size:18px;font-weight:700;color:#111827;">${escapeHtml(value)}</div>
      <div style="margin-top:4px;font-size:11px;color:#6b7280;word-break:break-word;">${escapeHtml(detail ?? "")}</div>
    </div>
  </td>`;
}

function section(title: string, body: string): string {
  return `<div style="margin-top:16px;">
    <h2 style="margin:0 0 8px;font-size:14px;line-height:1.3;color:#111827;">${escapeHtml(title)}</h2>
    ${body}
  </div>`;
}

function driversHtml(card: RecommendationCard): string {
  const parts = [
    driverGroupHtml("Ugly", card.drivers?.ugly, "#fee2e2"),
    driverGroupHtml("Bad", card.drivers?.bad, "#fef3c7"),
    driverGroupHtml("Good", card.drivers?.good, "#dcfce7"),
  ].filter(Boolean);
  return parts.join("") || `<p style="margin:0;color:#374151;">No driver details supplied.</p>`;
}

function driverGroupHtml(label: string, items: string[] | undefined, background: string): string {
  if (!items?.length) {
    return "";
  }
  return `<div style="margin:8px 0;padding:10px 12px;border-radius:10px;background:${background};">
    <div style="font-weight:700;font-size:12px;color:#111827;">${escapeHtml(label)}</div>
    ${listHtml(items)}
  </div>`;
}

function evidenceHtml(card: RecommendationCard): string {
  const items = card.evidence?.length
    ? card.evidence.map((item) => `${item.source}: ${item.id}${item.freshness ? ` (${item.freshness})` : ""}${item.url ? ` - ${item.url}` : ""}`)
    : card.evidence_refs;
  return listHtml(items.length ? items.slice(0, 12) : ["No evidence refs supplied."]);
}

function listHtml(items: string[]): string {
  return `<ul style="margin:0;padding-left:18px;color:#374151;line-height:1.5;">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

function buttonHtml(url: string | undefined, label: string): string {
  if (!url) {
    return "";
  }
  return `<a href="${escapeAttribute(url)}" style="display:inline-block;margin:0 8px 8px 0;padding:9px 12px;border-radius:8px;background:#111827;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;">${escapeHtml(label)}</a>`;
}

function feedbackUrlForLabel(baseUrl: string | undefined, label: string): string | undefined {
  if (!baseUrl) {
    return undefined;
  }
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("label", label);
    return url.toString();
  } catch {
    return undefined;
  }
}

function driverLines(label: string, items: string[] | undefined): string[] {
  return items?.length ? [`${label}:`, ...items.map((item) => `- ${item}`)] : [];
}

function formatUsd(value: number): string {
  if (value >= 100) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (value >= 1) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 4 })}`;
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 8 })}`;
}

function readable(value: string): string {
  return value.replace(/_/g, " ");
}

function severityAccent(severity: string): string {
  switch (severity) {
    case "critical":
      return "#dc2626";
    case "warning":
      return "#f59e0b";
    case "watch":
      return "#2563eb";
    default:
      return "#059669";
  }
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(value: unknown): string {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function resolveSmtpConfig(smtp: SmtpNotificationConfig | undefined):
  | { ok: true; config: RequiredSmtpNotificationConfig }
  | { ok: false; missing: string[] } {
  const port = smtp?.port ?? 587;
  const secure = smtp?.secure ?? port === 465;
  const config: RequiredSmtpNotificationConfig = {
    host: smtp?.host?.trim() ?? "",
    port,
    user: smtp?.user?.trim() || undefined,
    password: smtp?.password || undefined,
    from: smtp?.from?.trim() || smtp?.user?.trim() || "",
    secure,
    startTls: smtp?.startTls ?? !secure,
    timeoutMs: smtp?.timeoutMs ?? 10_000,
  };
  const missing = [];
  if (!config.host) missing.push("smtp_host");
  if (!config.from) missing.push("smtp_from");
  if (config.user && !config.password) missing.push("smtp_password");
  return missing.length ? { ok: false, missing } : { ok: true, config };
}

function createNodemailerSender(smtp: RequiredSmtpNotificationConfig): MailSender {
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    requireTLS: smtp.startTls && !smtp.secure,
    auth: smtp.user ? { user: smtp.user, pass: smtp.password ?? "" } : undefined,
    connectionTimeout: smtp.timeoutMs,
    greetingTimeout: smtp.timeoutMs,
    socketTimeout: smtp.timeoutMs,
  });
  return {
    async sendMail(message: MailMessage): Promise<MailSendResult> {
      return transport.sendMail(message);
    },
  };
}

function firstEnv(env: NodeJS.ProcessEnv, ...names: string[]): string | undefined {
  for (const name of names) {
    const value = env[name];
    if (value?.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  return ["1", "true", "yes", "y", "on"].includes(value.trim().toLowerCase());
}

function numberFrom(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function severityFromEnv(value: string | undefined, fallback: NotificationSeverity): NotificationSeverity {
  return value === "info" || value === "watch" || value === "warning" || value === "critical" ? value : fallback;
}
