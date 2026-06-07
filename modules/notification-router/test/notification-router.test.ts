import { describe, expect, it } from "vitest";
import { NotificationRouter, emailChannelFromEnv, type MailMessage } from "../src/index.js";

const warningCard = {
  schema_version: "tradeos.symbol_cockpit.recommendation_card.v1" as const,
  card_id: "card_1",
  target_id: "rec_1",
  symbol: "VVV",
  title: "VVV avoid",
  body: "Avoid new long.",
  verdict: "avoid_new_long" as const,
  action: "avoid_new_long" as const,
  severity: "warning" as const,
  confidence: 0.7,
  evidence_refs: ["watchlist_snapshot:wle_1"],
  evidence: [{ id: "watchlist_snapshot:wle_1", source: "watchlist_snapshot", target: "VVV", freshness: "latest" }],
  drivers: {
    good: ["Some public evidence exists for the symbol."],
    bad: ["Liquidity is thin."],
    ugly: ["Flow stress is elevated."],
    next_steps: ["Avoid a new long until flow stress normalizes."],
  },
  market_snapshot: {
    price_usd: 0.0421,
    price_source: "watchlist_snapshot:token.current_price_usd",
    price_as_of: "2026-06-07T13:00:00.000Z",
    target_price_usd: 0.055,
    target_price_source: "watchlist_snapshot:token.target_price_usd",
  },
  feedback_target: { target_type: "cockpit_recommendation" as const, target_id: "rec_1" },
  feedback_url: "https://tradeos.tech/feedback?target_type=cockpit_recommendation&target_id=rec_1",
  status: "open" as const,
  created_at: "now",
};

describe("NotificationRouter", () => {
  it("skips channels below severity and sends stdout deliveries", async () => {
    const router = new NotificationRouter();
    const deliveries = await router.deliver(
      warningCard,
      [
        { id: "critical_only", kind: "stdout", minSeverity: "critical" },
        { id: "warnings", kind: "stdout", minSeverity: "warning" },
      ],
    );

    expect(deliveries[0].status).toBe("skipped");
    expect(deliveries[1].status).toBe("sent");
    expect(deliveries[1].target_id).toBe("rec_1");
  });

  it("sends email deliveries through an injected SMTP sender", async () => {
    const sent: MailMessage[] = [];
    const router = new NotificationRouter(fetch, () => ({
      async sendMail(message) {
        sent.push(message);
        return { accepted: [message.to], rejected: [] };
      },
    }));

    const deliveries = await router.deliver(warningCard, [
      {
        id: "operator_email",
        kind: "email",
        target: "tradeos.contact@gmail.com",
        minSeverity: "warning",
        smtp: {
          host: "smtp.example.test",
          port: 587,
          user: "mailer@example.test",
          password: "secret",
          from: "alerts@example.test",
        },
      },
    ]);

    expect(deliveries[0].status).toBe("sent");
    expect(deliveries[0].reason).toContain("smtp_accepted=1");
    expect(sent[0].to).toBe("tradeos.contact@gmail.com");
    expect(sent[0].subject).toContain("VVV avoid_new_long");
    expect(sent[0].text).toContain("Price at note: $0.0421");
    expect(sent[0].text).toContain("Target price: $0.055");
    expect(sent[0].text).toContain("Flow stress is elevated.");
    expect(sent[0].html).toContain("TradeOS Symbol Cockpit");
    expect(sent[0].html).toContain("label=useful");
    expect(sent[0].html).toContain("watchlist_snapshot:wle_1");
    expect(sent[0].text).toContain("Execution, sizing, custody, and live approvals remain local-only.");
  });

  it("fails email deliveries without exposing SMTP secrets when config is incomplete", async () => {
    const router = new NotificationRouter();
    const deliveries = await router.deliver(warningCard, [
      {
        id: "bad_email",
        kind: "email",
        target: "tradeos.contact@gmail.com",
        smtp: { host: "smtp.example.test", user: "mailer@example.test" },
      },
    ]);

    expect(deliveries[0].status).toBe("failed");
    expect(deliveries[0].reason).toContain("missing_email_config");
    expect(deliveries[0].reason).toContain("smtp_password");
    expect(deliveries[0].reason).not.toContain("mailer@example.test");
  });

  it("builds an email channel from TradeOS-compatible environment names", () => {
    const channel = emailChannelFromEnv({
      COCKPIT_ALERT_EMAIL_ENABLED: "true",
      ALERT_EMAIL_TO: "tradeos.contact@gmail.com",
      SMTP_HOST: "smtp.example.test",
      SMTP_PORT: "587",
      SMTP_USER: "mailer@example.test",
      SMTP_PASSWORD: "secret",
    });

    expect(channel?.kind).toBe("email");
    expect(channel?.target).toBe("tradeos.contact@gmail.com");
    expect(channel?.smtp?.host).toBe("smtp.example.test");
    expect(channel?.smtp?.password).toBe("secret");
  });
});
