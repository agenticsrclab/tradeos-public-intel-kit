import {
  createPlatformPulseViewModel,
  createProviderPassportUxMetadata,
  createUxConformanceReport,
  createVerticalManifest,
  REQUIRED_UX_CHECK_IDS,
} from "@source-ui/contracts.js";

export const PUBLIC_ROUTES = ["/", "/feedback"];
export const ADMIN_ROUTES = ["/#admin"];
export const PROVIDER_REVIEW_SCREENSHOTS = [
  { route: "/", theme: "dark", viewport: "desktop", path: "conformance/screenshots/desktop-dark-cockpit.png" },
  { route: "/#admin", theme: "light", viewport: "desktop", path: "conformance/screenshots/desktop-light-admin.png" },
  { route: "/feedback", theme: "dark", viewport: "desktop", path: "conformance/screenshots/desktop-dark-feedback.png" },
  { route: "/", theme: "dark", viewport: "mobile", path: "conformance/screenshots/mobile-dark-cockpit.png" },
  { route: "/#admin", theme: "light", viewport: "mobile", path: "conformance/screenshots/mobile-light-admin.png" },
  { route: "/feedback", theme: "dark", viewport: "mobile", path: "conformance/screenshots/mobile-dark-feedback.png" },
];

export const SOURCE_UI_CHECKS = [
  {
    id: "source-ui-stylesheet",
    status: "pass",
    detail: "Loads /source-ui/source-ui.css before local CSS.",
  },
  {
    id: "tradeos-token-namespace",
    status: "pass",
    detail: "Uses tradeos.css-vars.v1 through Source UI tokens and local compatibility aliases.",
  },
  {
    id: "theme-contract",
    status: "pass",
    detail: "Uses tradeos.theme, dark default, and Source UI React theme runtime.",
  },
  {
    id: "font-delivery",
    status: "pass",
    detail: "Uses package-managed Fontsource assets bundled by Vite.",
  },
  {
    id: "platform-pulse",
    status: "pass",
    detail: "Renders Source Intelligence UX pulse metadata in the cockpit header.",
  },
  {
    id: "evidence-feedback-boundary",
    status: "pass",
    detail: "Feedback stays attached to packet targets while local keys, approvals, and execution state remain operator-controlled.",
  },
  {
    id: "operator-boundary",
    status: "pass",
    detail: "Self-hosted operator execution boundary is visible in the hero, footer, manifest, and admin view.",
  },
  {
    id: "visual-screenshots",
    status: "pass",
    detail: "Canonical provider-review screenshots are generated and committed for cockpit, admin, and feedback surfaces on desktop and mobile.",
  },
  {
    id: "accessibility-smoke",
    status: "pass",
    detail: "The Playwright suite runs axe WCAG 2 A/AA, WCAG 2.1 A/AA, and best-practice checks on cockpit, admin, and feedback surfaces.",
  },
  {
    id: "no-horizontal-overflow",
    status: "pass",
    detail: "The Symbol Cockpit Playwright suite checks document overflow.",
  },
  {
    id: "no-text-overlap",
    status: "warning",
    detail: "Controls and badges wrap, but manual screenshot review is required before marking this pass.",
  },
  {
    id: "tradeos-reference-uptake",
    status: "pass",
    detail: "Admin & Ops renders a trial matrix that maps Source UI standards to TradeOS dashboard anchors and cockpit surfaces.",
  },
  {
    id: "framework-neutral-sdk",
    status: "pass",
    detail: "The React/Vite cockpit still consumes the same Source UI CSS, contracts, theme, and conformance artifacts.",
  },
  {
    id: "react-adapter-coverage",
    status: "pass",
    detail: "The cockpit uses the Source UI React adapter for theme, proof, conformance, status-list, service-list, event-list, and trial-matrix primitives.",
  },
];

export const SOURCE_STANDARD_TRIALS = [
  {
    id: "tokens-theme",
    label: "Tokens and theme",
    module: "source-ui.css + React theme hook",
    cockpit: "root data-theme, tradeos.theme, dark/light toggle",
    tradeos: "globals.css + themeStore.ts",
    status: "pass",
  },
  {
    id: "shell-layout",
    label: "Shell and layout",
    module: "source-shell, source-page-frame, source-app-header",
    cockpit: "toolbar, status strip, source pulse, tabbed workbench",
    tradeos: "MainLayout + PublicDashboardLayout",
    status: "pass",
  },
  {
    id: "proof-counters",
    label: "Proof counters",
    module: "Source UI React ProofCounterGrid",
    cockpit: "Source UX strip and conformance proof counters",
    tradeos: "ProofPagePattern.ProofCounterGrid",
    status: "pass",
  },
  {
    id: "evidence-cockpit",
    label: "Evidence cockpit",
    module: "EvidenceRefViewModel + source evidence classes",
    cockpit: "verdict evidence summary, source refs, source summary",
    tradeos: "ProofPagePattern.EvidenceCockpit",
    status: "pass",
  },
  {
    id: "feedback-loop",
    label: "Feedback and outcome",
    module: "FeedbackTargetViewModel + feedback panel classes",
    cockpit: "recommendation card labels and /feedback target flow",
    tradeos: "FeedbackLoopSignalStrip + Feedback pages",
    status: "pass",
  },
  {
    id: "platform-pulse",
    label: "Platform Pulse",
    module: "Source UI React PlatformPulseStrip",
    cockpit: "Source UX strip and 21-symbol market pulse",
    tradeos: "PlatformLoops + public dashboard pulse sections",
    status: "pass",
  },
  {
    id: "service-catalog",
    label: "Service catalog",
    module: "service SKU/trust classes",
    cockpit: "Admin Local Gates service grid",
    tradeos: "IntelligenceCatalog + AgenticMarketplace",
    status: "pass",
  },
  {
    id: "operator-boundary",
    label: "Boundary badges",
    module: "Source UI React OperatorBoundary",
    cockpit: "hero, footer, manifest, admin conformance panel",
    tradeos: "public/private/admin boundary copy",
    status: "pass",
  },
  {
    id: "states-controls",
    label: "States and controls",
    module: "buttons, forms, tabs, states, 44px targets",
    cockpit: "review/preflight/ask/scan controls and loading states",
    tradeos: "Button, Tabs, Card, Toast, form primitives",
    status: "pass",
  },
  {
    id: "react-adapter",
    label: "React adapter",
    module: "packages/source-ui/src/react",
    cockpit: "React/Vite app uses Source UI adapter primitives across proof, conformance, services, events, and trial matrix",
    tradeos: "dashboard-2 React component library",
    status: "pass",
  },
];

export const verticalManifest = createVerticalManifest({
  vertical_id: "tradeos-symbol-cockpit",
  display_name: "TradeOS Symbol Cockpit",
  description: "Self-hosted symbol review cockpit demonstrating sdk-native Source Intelligence Network UX adoption.",
  surface_roles: ["public_intel", "admin_ops"],
  public_routes: PUBLIC_ROUTES,
  admin_routes: ADMIN_ROUTES,
  capabilities: ["symbol_review", "source_evidence", "feedback_intake", "operator_workbench", "platform_pulse"],
  source_boundaries: [
    { id: "operator-workspace", label: "Operator workspace", policy: "self_host_operator_controls_execution" },
    { id: "tradeos-public-intel", label: "TradeOS public intelligence", policy: "public_intel_and_feedback_only" },
  ],
  operator_boundary: "self_host_operator_controls_execution",
  ux: {
    conformance_level: "sdk_native",
    visual_conformance_status: "pass",
    visual_conformance_checked_at: "2026-06-12T05:30:00.000Z",
    font_delivery: "package_managed_fontsource",
  },
});

export const uxConformance = createUxConformanceReport({
  app_id: "tradeos-symbol-cockpit",
  conformance_level: "sdk_native",
  font_delivery: "package_managed_fontsource",
  visual_conformance_status: "pass",
  checked_at: "2026-06-12T05:30:00.000Z",
  routes: [...PUBLIC_ROUTES, ...ADMIN_ROUTES],
  screenshots: PROVIDER_REVIEW_SCREENSHOTS,
  checks: SOURCE_UI_CHECKS,
});

export const providerPassport = createProviderPassportUxMetadata({
  provider_id: "tradeos-symbol-cockpit",
  surface_url: "/",
  ux_conformance_level: "sdk_native",
  font_delivery: "package_managed_fontsource",
  visual_conformance_status: "pass",
  visual_conformance_checked_at: "2026-06-12T05:30:00.000Z",
  ux_conformance_report_url: "/conformance/ux-conformance.json",
});

export const platformPulse = createPlatformPulseViewModel({
  channels: [
    {
      id: "source-ui",
      label: "Source UI",
      status: "healthy",
      claim: "quality_reviewed",
      detail: "React/Vite reference uptake with committed provider-review screenshots and axe audit coverage.",
      source_mix: { api: 1, agent: 1 },
      interest: { requests: 1, feedback_signals: 0 },
    },
    {
      id: "operator-boundary",
      label: "Boundary",
      status: "healthy",
      claim: "distribution_health",
      detail: "Self-hosted execution and keys stay with the operator.",
      source_mix: { human_account: 1 },
      interest: { requests: 1 },
    },
  ],
});

for (const requiredCheckId of REQUIRED_UX_CHECK_IDS) {
  if (!SOURCE_UI_CHECKS.some((check) => check.id === requiredCheckId)) {
    console.warn(`Missing Source UI check: ${requiredCheckId}`);
  }
}

if (typeof window !== "undefined") {
  window.__SOURCE_VERTICAL_MANIFEST__ = verticalManifest;
  window.__SOURCE_UI_CONFORMANCE__ = uxConformance;
  window.__SOURCE_PROVIDER_PASSPORT_UX__ = providerPassport;
  window.__SOURCE_PLATFORM_PULSE__ = platformPulse;
}
