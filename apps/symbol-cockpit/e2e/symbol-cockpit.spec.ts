import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { buildEvidenceBundle, type SymbolCockpitQuery } from "@tradeos/cockpit-core";
import { NotificationRouter, type MailMessage } from "@tradeos/module-notification-router";
import type { Server } from "node:http";

let server: Server;
let baseURL = "";
let sentEmail: MailMessage[] = [];

test.beforeAll(async () => {
  process.env.COCKPIT_WEB_ROOT = fileURLToPath(new URL("../src/web/", import.meta.url));
  sentEmail = [];

  const [{ createApiServer }, { SymbolCockpitRuntime }] = await Promise.all([
    import("../src/api/http.js"),
    import("../src/runtime.js"),
  ]);

  const runtime = new SymbolCockpitRuntime({
    evidence: {
      client: { baseUrl: "https://public-intel.example.test", apiKey: "test-public-key" },
      async fetchSymbolEvidence(query: SymbolCockpitQuery) {
        const symbol = query.symbol.toUpperCase();
        return {
          bundle: buildEvidenceBundle(query, {
            watchlist_snapshot: {
              rows: [
                {
                  event_id: "watch_vvv_1",
                  symbol,
                  summary: `${symbol} flow stress warning with degraded liquidity and adverse funding.`,
                },
              ],
            },
            digest: {
              digest_id: "digest_vvv_1",
              headline: `${symbol} remains weak while market context is bearish.`,
              bullets: [
                `${symbol} downtrend persisted after an adverse selloff.`,
                `${symbol} recovery evidence is still fragile and low confidence.`,
              ],
            },
            candidates: { rows: [] },
            thesis_watchlist: { rows: [{ thesis_id: "thesis_vvv_1", symbol, status: "risk_review" }] },
          }),
          app_attribution: { valid: true, app: "headless-symbol-cockpit" },
        };
      },
      async submitCockpitFeedback(input: { targetId: string; label: string }) {
        return { status: "accepted_shadow", target_id: input.targetId, label: input.label };
      },
    } as never,
    actionAgent: {
      apiKey: "test-model-key",
      async answer() {
        return {
          schema_version: "tradeos.symbol_cockpit.action_agent_answer.v1",
          model: "headless-test-model",
          provider_base_url: "https://model.example.test",
          answer:
            "Direct answer: avoid a new long. Evidence used: flow stress and weak recovery. Local-only next action: keep it on watch and do not execute live orders.",
          used_evidence_refs: [],
        };
      },
    } as never,
    notificationRouter: new NotificationRouter(fetch, () => ({
      async sendMail(message) {
        sentEmail.push(message);
        return { accepted: [message.to], rejected: [] };
      },
    })),
    notificationChannels: [
      {
        id: "operator_email",
        kind: "email",
        target: "operator@example.com",
        minSeverity: "warning",
        smtp: { host: "smtp.example.test", from: "cockpit@example.test" },
      },
      { id: "stdout", kind: "stdout", minSeverity: "warning" },
    ],
  });

  server = createApiServer({ runtime });
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Cockpit test server did not bind to a TCP port.");
  }
  baseURL = `http://127.0.0.1:${address.port}`;
  process.env.COCKPIT_PUBLIC_BASE_URL = baseURL;
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("reviews, alerts, preflights, asks, paper executes, and reports ops status", async ({ page }) => {
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText}`));

  await page.goto(baseURL);

  await expect(page.getByRole("heading", { name: "TradeOS Symbol Cockpit" })).toBeVisible();
  await expect(page.locator(".toolbar-actions .button-link")).toContainText("TradeOS.tech");
  await expect(page.locator("#symbol option")).toHaveCount(21);
  await expect(page.locator("#symbol")).toHaveValue("VVV");
  await expect(page.locator("#chain")).toHaveValue("8453");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("#health")).toContainText("API ok");
  await expect(page.locator("#health")).toContainText("TradeOS key set");
  await expect(page.locator("#health")).toContainText("model key set");
  await expect(page.locator("#health")).toContainText("Paper-only runtime");
  await expect(page.getByRole("button", { name: "Pause Entries" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Resume Entries" })).toHaveCount(0);
  await page.getByRole("button", { name: "Admin & Ops" }).click();
  await expect(page.locator("#admin-view")).toContainText("Operator Console");
  await expect(page.locator("#serviceGrid")).toContainText("TradeOS Public Intel");
  await expect(page.locator("#serviceGrid")).toContainText("EA Risk");
  await expect(page.locator("#serviceGrid")).toContainText("Execution Gateway");
  await expect(page.locator("#admin-view")).toContainText("Expected-advantage gate");
  await page.getByRole("button", { name: "Guide" }).click();
  await expect(page.locator("#guide-view")).toContainText("Full trading-intelligence symbols");
  await expect(page.locator("#guide-view")).toContainText("It does not start watching");
  await expect(page.locator("#supportedSymbols .symbol-chip")).toHaveCount(21);
  await expect(page.locator("#supportedSymbols")).toContainText("FET");
  await page.getByRole("button", { name: "Trade Desk" }).click();

  await expect(page.locator(".flow-panel")).toContainText("How The Flow Works");
  await expect(page.locator(".flow-panel")).toContainText("one-time paper-buy gate check");
  const flowBox = await page.locator(".top-flow").boundingBox();
  const tabsBox = await page.locator(".view-tabs").boundingBox();
  expect(flowBox?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(tabsBox?.y ?? Number.NEGATIVE_INFINITY);
  await expect(page.locator("#verdict")).toContainText("VVV");
  await expect(page.locator("#action")).toContainText(/avoid new long|trim or tighten risk|review exit/);
  await expect(page.locator("#cards article").first()).toContainText("VVV");

  await expect.poll(() => sentEmail.length).toBeGreaterThan(0);
  expect(sentEmail.at(-1)?.to).toBe("operator@example.com");
  expect(sentEmail.at(-1)?.subject).toMatch(/VVV (avoid_new_long|trim_or_reduce|exit_or_sell_candidate)/);
  expect(sentEmail.at(-1)?.html).toContain("What Triggered This");
  expect(sentEmail.at(-1)?.html).toContain("label=useful");
  expect(sentEmail.at(-1)?.text).toContain("Price at note:");

  let snapshot = await opsSnapshot(page);
  expect(snapshot.notifications.sent).toBeGreaterThanOrEqual(1);
  expect(snapshot.audit.some((event: { event_type: string }) => event.event_type === "notification_sent")).toBe(true);

  await page.getByRole("button", { name: "Preflight Buy" }).click();
  await expect(page.locator("#preflightDecision")).toContainText("Avoid");
  await expect(page.locator("#preflightSummary")).toContainText("Proposed entry conflicts");
  await expect(page.locator("#preflightSummary")).toContainText("not a background watcher");
  await expect(page.locator("#preflightReasons")).toContainText("optional scanner worker");
  await expect(page.locator("#answer")).toContainText('"decision": "avoid"');

  await page.locator("#question").fill("What should I do with this symbol?");
  await page.getByRole("button", { name: "Ask" }).click();
  await expect(page.locator("#answer")).toContainText("Local-only next action");
  await expect(page.locator("#askStatus")).toContainText("Answer ready");

  const feedbackTarget = await page.locator('#cards button[data-label="useful"]').first().getAttribute("data-target");
  expect(feedbackTarget).toBeTruthy();
  await page.goto(`${baseURL}/feedback?target_id=${feedbackTarget}&symbol=VVV&verdict=avoid_new_long&label=useful`);
  await expect(page.getByRole("heading", { name: "Review Recommendation" })).toBeVisible();
  await expect(page.locator("#summary")).toContainText("VVV");
  await page.locator("#note").fill("Headless feedback page validation.");
  await page.getByRole("button", { name: "Submit Feedback" }).click();
  await expect(page.locator("#result")).toContainText("Feedback recorded");
  await page.goto(baseURL);

  await page.locator('#cards button[data-paper="true"]').first().click();
  await expect.poll(async () => (await opsSnapshot(page)).audit.some((event: { event_type: string }) => event.event_type === "paper_fill")).toBe(true);

  snapshot = await opsSnapshot(page);
  expect(snapshot.services.execution_gateway.detail).toBe("paper");
  expect(snapshot.recommendations.open).toBeGreaterThanOrEqual(1);
  expect(pageErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

async function opsSnapshot(page: Page) {
  const raw = await page.locator("#ops").textContent();
  return JSON.parse(raw || "{}");
}
