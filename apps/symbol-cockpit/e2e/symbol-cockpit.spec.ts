import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { buildEvidenceBundle, type SymbolCockpitQuery } from "@tradeos/cockpit-core";
import { NotificationRouter, type MailMessage } from "@tradeos/module-notification-router";
import type { Server } from "node:http";

let server: Server;
let baseURL = "";
let sentEmail: MailMessage[] = [];
const screenshotRoot = fileURLToPath(new URL("../conformance/screenshots/", import.meta.url));
const fixedEvidenceTime = "2026-06-11T16:00:00.000Z";
let evidenceTick = 0;

test.beforeAll(async () => {
  process.env.COCKPIT_WEB_ROOT = fileURLToPath(new URL("../dist/web/", import.meta.url));
  process.env.COCKPIT_CONFORMANCE_ROOT = fileURLToPath(new URL("../conformance/", import.meta.url));
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
              token: {
                symbol,
                current_price_usd: 0.0421,
                target_price_usd: 0.055,
                price_as_of: new Date(Date.parse(fixedEvidenceTime) + evidenceTick++ * 60_000).toISOString(),
              },
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
  await expect(page.locator("body")).toHaveClass(/source-shell/);
  await expect(page.locator('link[href="/source-ui/source-ui.css"]')).toHaveCount(1);
  await expect(page.locator('link[href*="fonts.googleapis.com"]')).toHaveCount(0);
  expect(
    await page.evaluate(async () => {
      const [css, contracts, theme, conformance] = await Promise.all([
        fetch("/source-ui/source-ui.css"),
        fetch("/source-ui/contracts.js"),
        fetch("/source-ui/theme.js"),
        fetch("/conformance/ux-conformance.json"),
      ]);
      return [css.ok, contracts.ok, theme.ok, conformance.ok];
    }),
  ).toEqual([true, true, true, true]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  await expect(page.locator(".toolbar-actions .button-link")).toContainText("TradeOS.tech");
  await expect(page.locator("#symbol option")).toHaveCount(21);
  await expect(page.locator("#symbol")).toHaveValue("VVV");
  await expect(page.locator("#chain")).toHaveValue("8453");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("tradeos.theme"))).toBe("dark");
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => localStorage.getItem("tradeos.theme"))).toBe("light");
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("#sourceStandard")).toContainText("tradeos.css-vars.v1");
  await expect(page.locator("#sourceStandard")).toContainText("tradeos.theme");
  await expect(page.locator("#sourceStandard")).toContainText("sdk_native");
  const sourceUx = await page.evaluate(
    () => {
      const source = window as unknown as {
          __SOURCE_VERTICAL_MANIFEST__: { public_routes: string[]; admin_routes: string[] };
          __SOURCE_UI_CONFORMANCE__: {
            token_namespace: string;
            theme_storage_key: string;
            routes: string[];
            checks: Array<{ id: string; status: string }>;
          };
          __SOURCE_PROVIDER_PASSPORT_UX__: { provider_id: string; ux_conformance_level: string };
        };
      return {
        manifest: source.__SOURCE_VERTICAL_MANIFEST__,
        conformance: source.__SOURCE_UI_CONFORMANCE__,
        passport: source.__SOURCE_PROVIDER_PASSPORT_UX__,
      };
    },
  );
  const uxConformance = sourceUx.conformance;
  expect(uxConformance.token_namespace).toBe("tradeos.css-vars.v1");
  expect(uxConformance.theme_storage_key).toBe("tradeos.theme");
  expect(sourceUx.manifest.public_routes).toEqual(["/", "/feedback"]);
  expect(sourceUx.manifest.admin_routes).toEqual(["/#admin"]);
  expect(sourceUx.passport.provider_id).toBe("tradeos-symbol-cockpit");
  expect(sourceUx.passport.ux_conformance_level).toBe("sdk_native");
  expect(uxConformance.routes).toEqual(["/", "/feedback", "/#admin"]);
  for (const checkId of [
    "source-ui-stylesheet",
    "tradeos-token-namespace",
    "theme-contract",
    "font-delivery",
    "platform-pulse",
    "evidence-feedback-boundary",
    "operator-boundary",
    "visual-screenshots",
    "accessibility-smoke",
    "no-horizontal-overflow",
    "no-text-overlap",
  ]) {
    expect(uxConformance.checks.some((check) => check.id === checkId)).toBe(true);
  }
  for (const checkId of ["tradeos-reference-uptake", "framework-neutral-sdk", "react-adapter-coverage"]) {
    expect(uxConformance.checks.some((check) => check.id === checkId)).toBe(true);
  }
  await expect(page.locator("#health")).toContainText("API ok");
  await expect(page.locator("#health")).toContainText("TradeOS key set");
  await expect(page.locator("#health")).toContainText("model key set");
  await expect(page.locator("#health")).toContainText("Paper-only runtime");
  await expect(page.getByRole("button", { name: "Pause Entries" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Resume Entries" })).toHaveCount(0);
  await page.getByRole("button", { name: "Admin & Ops" }).click();
  await expect(page).toHaveURL(/#admin$/);
  await expect(page.locator("#admin-view")).toContainText("Operator Console");
  await expect(page.locator("#admin-view")).toContainText("Source UI Conformance");
  await expect(page.locator("#sourceConformanceGrid")).toContainText("package_managed_fontsource");
  await expect(page.locator("#sourceConformanceChecks")).toContainText("source-ui-stylesheet");
  await expect(page.locator("#sourceConformanceChecks")).toContainText("no-horizontal-overflow");
  await expect(page.locator("#sourceStandardsLab .source-standard-trial")).toHaveCount(10);
  await expect(page.locator('#sourceStandardsLab [data-standard="tokens-theme"]')).toContainText("globals.css + themeStore.ts");
  await expect(page.locator('#sourceStandardsLab [data-standard="proof-counters"]')).toContainText("ProofPagePattern");
  await expect(page.locator('#sourceStandardsLab [data-standard="feedback-loop"]')).toContainText("FeedbackLoopSignalStrip");
  await expect(page.locator('#sourceStandardsLab [data-standard="react-adapter"]')).toContainText("React/Vite app uses Source UI adapter primitives");
  await expect(page.locator("#serviceGrid")).toContainText("TradeOS Public Intel");
  await expect(page.locator("#serviceGrid")).toContainText("EA Risk");
  await expect(page.locator("#serviceGrid")).toContainText("Execution Gateway");
  await expect(page.locator("#admin-view")).toContainText("Expected-advantage gate");
  await page.getByRole("button", { name: "Guide" }).click();
  await expect(page.locator("#guide-view")).toContainText("Full trading-intelligence symbols");
  await expect(page.locator("#guide-view")).toContainText("It does not start watching");
  await expect(page.locator("#supportedSymbols .symbol-chip")).toHaveCount(21);
  await expect(page.locator("#supportedSymbols")).toContainText("FET");

  // Onboarding flow lives in the Guide tab, not in the trade workspace.
  await expect(page.locator("#guide-view .flow-panel")).toContainText("How The Flow Works");
  await expect(page.locator("#guide-view .flow-panel")).toContainText("one-time paper-buy gate check");
  await page.getByRole("button", { name: "Trade Desk" }).click();
  await expect(page).not.toHaveURL(/#admin$/);
  await expect(page.locator("#trade-view .flow-panel")).toHaveCount(0);

  // Symmetric flow: command bar -> tabs -> pulse heatmap -> verdict workspace.
  const commandBox = await page.locator(".search-band").boundingBox();
  const tabsBox = await page.locator(".view-tabs").boundingBox();
  const pulseBox = await page.locator("#pulsePanel").boundingBox();
  const verdictBox = await page.locator(".verdict-panel").boundingBox();
  expect(commandBox!.y).toBeLessThan(tabsBox!.y);
  expect(tabsBox!.y).toBeLessThan(pulseBox!.y);
  expect(pulseBox!.y).toBeLessThan(verdictBox!.y);
  await expect(page.locator("#verdict")).toContainText("VVV");
  await expect(page.locator("#action")).toContainText(/avoid new long|trim or tighten risk|review exit/);
  await expect(page.locator("#cards article").first()).toContainText("VVV");

  await expect(page.locator("#marketStrip .market-stat")).not.toHaveCount(0);
  await expect(page.locator("#marketStrip")).toContainText("Evidence");

  // Sticky command center: pins on scroll and surfaces the latest verdict inline.
  await page.evaluate(() => {
    const commandBar = document.getElementById("commandBar");
    window.scrollTo({ top: (commandBar?.offsetTop ?? 0) + 80, behavior: "instant" });
    window.dispatchEvent(new Event("scroll"));
  });
  await expect(page.locator("#commandBar")).toHaveClass(/stuck/);
  await expect(page.locator("#commandVerdict")).toBeVisible();
  await expect(page.locator("#commandVerdict")).toContainText("VVV");
  const stuckBox = await page.locator("#commandBar").boundingBox();
  expect(stuckBox!.y).toBeLessThanOrEqual(1);
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    window.dispatchEvent(new Event("scroll"));
  });
  await expect(page.locator("#commandBar")).not.toHaveClass(/stuck/);

  // Hero collapses to a single line and persists the preference.
  await page.locator("#hero-collapse").click();
  await expect(page.locator("#tradeHero")).toHaveClass(/collapsed/);
  await expect(page.locator("#tradeHero .boundary-grid")).toBeHidden();
  await page.locator("#hero-collapse").click();
  await expect(page.locator("#tradeHero")).not.toHaveClass(/collapsed/);
  await expect(page.locator("#tradeHero .boundary-grid")).toBeVisible();

  await expect(page.locator("html")).toHaveAttribute("data-density", "comfortable");
  await page.locator("#density-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-density", "compact");
  await expect(page.locator(".pulse-legend")).toBeHidden();
  await page.locator("#density-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-density", "comfortable");
  await expect(page.locator(".pulse-legend")).toBeVisible();
  const ringOffset = await page.locator("#confidenceRing").evaluate((node) => node.style.strokeDashoffset);
  expect(Number.parseFloat(ringOffset)).toBeGreaterThan(0);

  await expect(page.locator("#pulseGrid .pulse-tile")).toHaveCount(21);
  await page.getByRole("button", { name: "Scan Watchlist" }).click();
  await expect(page.locator("#pulseStatus")).toContainText("Scanned 21 symbols", { timeout: 30_000 });
  await expect(page.locator("#pulseGrid .pulse-tile.pending")).toHaveCount(0);
  await expect(page.locator("#toastHost .toast").first()).toContainText("Watchlist scan complete");
  await expect(page.locator("#tickerTrack .ticker-item").first()).toBeVisible();

  await page.locator('#pulseGrid [data-pulse-symbol="BTC"]').click();
  await expect(page.locator("#symbol")).toHaveValue("BTC");
  await expect(page.locator("#verdict")).toContainText("BTC");
  await page.locator("#symbol").selectOption("VVV");
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(page.locator("#verdict")).toContainText("VVV");

  // Sparkline appears once the symbol has at least two locally observed prices.
  await expect(page.locator("#marketStrip .spark-stat")).toHaveCount(1);
  await expect(page.locator("#marketStrip .sparkline")).toBeVisible();
  const sparkPoints = await page.locator("#marketStrip .sparkline .spark-line").getAttribute("points");
  expect((sparkPoints || "").split(" ").length).toBeGreaterThanOrEqual(2);

  // Ops metric values render as integers after the count-up animation settles.
  await expect.poll(async () => {
    const values = await page.locator("#opsSummary [data-count-to]").allTextContents();
    return values.length > 0 && values.every((value) => /^\d+$/.test(value.trim()));
  }).toBe(true);

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

test("writes provider-review screenshots and passes accessibility audit", async ({ page }, testInfo) => {
  const viewport = testInfo.project.name.includes("mobile") ? "mobile" : "desktop";
  await mkdir(screenshotRoot, { recursive: true });

  await page.goto(baseURL);
  await expect(page.getByRole("heading", { name: "TradeOS Symbol Cockpit" })).toBeVisible();
  await expect(page.locator("#verdict")).toContainText("VVV");
  await expectNoHorizontalOverflow(page);
  await expectNoA11yViolations(page);
  await screenshotForReview(page, `${viewport}-dark-cockpit.png`);

  await setTheme(page, "light");
  await page.getByRole("button", { name: "Admin & Ops" }).click();
  await expect(page).toHaveURL(/#admin$/);
  await expect(page.locator("#admin-view")).toContainText("Source UI Conformance");
  await expectNoHorizontalOverflow(page);
  await expectNoA11yViolations(page);
  await screenshotForReview(page, `${viewport}-light-admin.png`);

  const targetId = await page.locator('#cards button[data-label="useful"]').first().getAttribute("data-target");
  await page.goto(`${baseURL}/feedback?target_id=${targetId || "review-target"}&symbol=VVV&verdict=avoid_new_long&label=useful`);
  await setTheme(page, "dark");
  await expect(page.getByRole("heading", { name: "Review Recommendation" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectNoA11yViolations(page);
  await screenshotForReview(page, `${viewport}-dark-feedback.png`);
});

async function opsSnapshot(page: Page) {
  const raw = await page.locator("#ops").textContent();
  return JSON.parse(raw || "{}");
}

async function setTheme(page: Page, theme: "dark" | "light") {
  await page.evaluate((nextTheme) => {
    localStorage.setItem("tradeos.theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
  }, theme);
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
}

async function expectNoA11yViolations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
    .analyze();
  expect(result.violations).toEqual([]);
}

async function screenshotForReview(page: Page, name: string) {
  await page.evaluate(() => document.fonts?.ready);
  await page.screenshot({ path: `${screenshotRoot}${name}`, fullPage: true });
}
