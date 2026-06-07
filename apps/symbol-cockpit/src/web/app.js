const apiBase = window.COCKPIT_API_BASE || "";
let latestTargetId = "";
const SUPPORTED_SYMBOLS = [
  "BTC",
  "ETH",
  "SOL",
  "ADA",
  "DOGE",
  "XRP",
  "DOT",
  "POL",
  "LINK",
  "UNI",
  "VVV",
  "KTA",
  "AVAX",
  "NEAR",
  "ARB",
  "OP",
  "SUI",
  "APT",
  "INJ",
  "TIA",
  "FET",
];
const CHAIN_OPTIONS = [
  { value: "8453", label: "Base 8453" },
  { value: "1", label: "Ethereum 1" },
  { value: "42161", label: "Arbitrum 42161" },
  { value: "10", label: "Optimism 10" },
  { value: "137", label: "Polygon 137" },
];
const SERVICE_LABELS = {
  tradeos_public_intel: "TradeOS Public Intel",
  ea_risk: "EA Risk",
  execution_gateway: "Execution Gateway",
};
const SERVICE_COPY = {
  tradeos_public_intel: "Public evidence, source refs, prices, and feedback targets.",
  feasibility: "Local account, sizing, drawdown, and blocked-asset policy for paper-only checks.",
  ea_risk: "Expected-advantage gate over confidence, verdict, good, bad, and ugly evidence.",
  execution_gateway: "Paper-only execution adapter and local audit trail.",
};

const $ = (id) => document.getElementById(id);
const root = document.documentElement;

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  root.dataset.theme = nextTheme;
  localStorage.setItem("cockpit-theme", nextTheme);
  $("theme-toggle").textContent = nextTheme === "dark" ? "Light" : "Dark";
  $("theme-toggle").title = `Switch to ${nextTheme === "dark" ? "light" : "dark"} mode`;
}

function selectView(view) {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === view);
  });
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { "content-type": "application/json" },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || response.statusText);
  return payload;
}

async function refreshHealth() {
  const health = await request("/healthz");
  $("health").innerHTML = `
    <span class="status-chip ${health.status === "ok" ? "ok" : "warn"}">API ${escapeHtml(health.status)}</span>
    <span class="status-chip ${health.public_intel_key_configured ? "ok" : "warn"}">TradeOS key ${health.public_intel_key_configured ? "set" : "not set"}</span>
    <span class="status-chip ${health.venice_or_openai_key_configured ? "ok" : "warn"}">model key ${health.venice_or_openai_key_configured ? "set" : "not set"}</span>
    <span class="status-chip ok">Paper-only runtime</span>
  `;
}

async function review() {
  setBusy("review", true, "Reviewing");
  try {
    const result = await request("/api/cockpit", {
      method: "POST",
      body: JSON.stringify({
        symbol: selectedSymbol(),
        chain: selectedChain(),
        mode: $("mode").value,
      }),
    });
    renderPacket(result.packet);
    await refreshCards();
    await refreshOps();
  } finally {
    setBusy("review", false);
  }
}

async function preflight() {
  setBusy("preflight", true, "Checking");
  renderPreflightPending();
  try {
    const result = await request("/api/preflight", {
      method: "POST",
      body: JSON.stringify({
        symbol: selectedSymbol(),
        chain: selectedChain(),
        proposed_action: "buy",
        proposed_notional_usd: 250,
      }),
    });
    renderPacket(result.cockpit);
    renderPreflight(result);
    $("answer").textContent = JSON.stringify(result.preflight, null, 2);
    await refreshCards();
    await refreshOps();
  } catch (error) {
    renderPreflightError(error);
    $("answer").textContent = error.message;
  } finally {
    setBusy("preflight", false);
  }
}

async function ask() {
  const stopStatus = streamAnswerStatus();
  setBusy("ask", true, "Asking");
  try {
    const result = await request("/api/action-agent", {
      method: "POST",
      body: JSON.stringify({ symbol: selectedSymbol(), question: $("question").value }),
    });
    stopStatus();
    $("askStatus").textContent = "Answer ready";
    $("answer").textContent = result.answer || JSON.stringify(result, null, 2);
  } catch (error) {
    stopStatus();
    $("askStatus").textContent = "Needs review";
    $("answer").textContent = error.message;
  } finally {
    setBusy("ask", false);
  }
}

async function refreshCards() {
  const result = await request("/api/recommendations");
  $("cards").innerHTML = "";
  for (const card of result.cards.slice(-8).reverse()) {
    const node = document.createElement("article");
    node.className = "card";
    node.innerHTML = `
      <h4>${escapeHtml(card.title)}</h4>
      <p>${escapeHtml(card.body)}</p>
      <div class="card-meta">
        <span class="mini-chip ${card.severity === "critical" || card.severity === "warning" ? "warn" : "ok"}">${escapeHtml(card.severity)}</span>
        <span>${Math.round(card.confidence * 100)}% confidence</span>
        <span>${escapeHtml(card.evidence_refs?.length || 0)} refs</span>
      </div>
      <div class="card-actions">
        <button class="secondary compact-button" data-target="${card.target_id}" data-label="useful">Useful</button>
        <button class="secondary compact-button" data-target="${card.target_id}" data-label="not_useful">Wrong</button>
        <button class="primary compact-button" data-target="${card.target_id}" data-paper="true">Paper Buy</button>
      </div>
    `;
    $("cards").appendChild(node);
  }
}

async function refreshOps() {
  const snapshot = await request("/api/ops");
  $("ops").textContent = JSON.stringify(snapshot, null, 2);
  renderOpsAdmin(snapshot);
}

function renderPacket(packet) {
  latestTargetId = packet.target_id;
  $("verdict").textContent = `${packet.symbol}: ${packet.verdict.replaceAll("_", " ")}`;
  $("action").textContent = packet.action.replaceAll("_", " ");
  $("confidence").textContent = `${Math.round(packet.confidence * 100)}%`;
  renderList("good", packet.good, "good");
  renderList("bad", packet.bad, "bad");
  renderList("ugly", packet.ugly, "ugly");
  renderList("steps", packet.next_steps);
}

function renderList(id, items, className = "") {
  const node = $(id);
  node.innerHTML = "";
  for (const item of items || []) {
    const li = document.createElement("li");
    li.className = className;
    li.textContent = item;
    node.appendChild(li);
  }
}

function renderOpsAdmin(snapshot) {
  $("opsSummary").innerHTML = [
    metricCard("Open recs", snapshot.recommendations?.open ?? 0, "Recommendations still open"),
    metricCard("Risk cards", snapshot.recommendations?.warning_or_critical ?? 0, "Warning or critical cards"),
    metricCard("Pending", snapshot.approvals?.pending ?? 0, "Paper approvals waiting"),
    metricCard("Audit", snapshot.audit?.length ?? 0, "Recent local audit events"),
  ].join("");

  const services = snapshot.services || {};
  $("serviceGrid").innerHTML = Object.entries(services)
    .map(([name, service]) => {
      const detail = service.detail ? ` · ${escapeHtml(service.detail)}` : "";
      return `
        <div class="service-row">
          <span><strong>${escapeHtml(serviceLabel(name))}</strong><small>${escapeHtml(serviceDescription(name))}</small></span>
          <strong class="${service.status === "ok" || service.status === "configured" ? "good" : "bad"}">${escapeHtml(service.status)}${detail}</strong>
        </div>
      `;
    })
    .join("");

  const approvals = snapshot.approvals?.latest || [];
  $("approvalList").innerHTML = approvals.length
    ? approvals
        .map((approval) => `
          <article class="event-row">
            <strong>${escapeHtml(approval.action || "approval")}</strong>
            <span>${escapeHtml(approval.summary || approval.target_id || "pending approval")}</span>
            <small>${escapeHtml(approval.status || "pending")}</small>
          </article>
        `)
        .join("")
    : `<p class="empty-note">No pending approvals. Paper requests from recommendation cards will appear here.</p>`;

  const audit = snapshot.audit || [];
  const notifications = snapshot.notifications?.latest || [];
  const events = [
    ...audit.map((event) => ({
      title: event.event_type,
      body: event.message,
      time: event.occurred_at,
    })),
    ...notifications.map((event) => ({
      title: `notification_${event.status}`,
      body: event.reason,
      time: event.delivered_at,
    })),
  ].slice(0, 8);
  $("auditList").innerHTML = events.length
    ? events
        .map((event) => `
          <article class="event-row">
            <strong>${titleCase(event.title || "event")}</strong>
            <span>${escapeHtml(event.body || "")}</span>
            <small>${formatTime(event.time)}</small>
          </article>
        `)
        .join("")
    : `<p class="empty-note">No local audit events yet.</p>`;
}

function renderPreflightPending() {
  $("preflightDecision").className = "pill neutral";
  $("preflightDecision").textContent = "Checking";
  $("preflightSummary").textContent = "Checking the proposed paper buy against the latest TradeOS packet and local gates.";
  renderList("preflightReasons", [
    "Fetching fresh evidence for the selected symbol.",
    "Evaluating EA risk, feasibility, and paper-only execution boundaries.",
  ]);
  $("preflightRaw").textContent = "";
}

function renderPreflight(result) {
  const preflight = result.preflight;
  const decision = preflight?.decision || "review";
  const allowed = Boolean(preflight?.allowed);
  $("preflightDecision").className = `pill ${decisionClass(decision, allowed)}`;
  $("preflightDecision").textContent = readable(decision);
  $("preflightSummary").textContent = `${preflight?.reason || "Review before sending to your own execution system."} This is a one-time gate check, not a background watcher.`;
  const reasons = [
    `Allowed: ${allowed ? "yes" : "no"}`,
    `EA risk: ${result.ea_risk?.decision || "unknown"}`,
    `Feasibility: ${result.feasibility?.verdict || "unknown"}${result.feasibility?.recommended_size_usd !== undefined ? `, recommended size $${Number(result.feasibility.recommended_size_usd).toFixed(2)}` : ""}`,
    "To keep watching this symbol, re-run Review later or run the optional scanner worker on COCKPIT_WATCHLIST.",
    ...(preflight?.next_steps || []),
  ];
  renderList("preflightReasons", reasons);
  $("preflightRaw").textContent = JSON.stringify(preflight, null, 2);
}

function renderPreflightError(error) {
  $("preflightDecision").className = "pill bad-state";
  $("preflightDecision").textContent = "Error";
  $("preflightSummary").textContent = error instanceof Error ? error.message : String(error);
  renderList("preflightReasons", ["The preflight did not complete. Check the local API logs and key configuration."]);
  $("preflightRaw").textContent = "";
}

function metricCard(label, value, caption) {
  return `
    <div class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(caption)}</small>
    </div>
  `;
}

function titleCase(value) {
  return String(value || "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function serviceLabel(value) {
  return SERVICE_LABELS[value] || titleCase(value);
}

function serviceDescription(value) {
  return SERVICE_COPY[value] || "Local service status for the current cockpit runtime.";
}

function selectedSymbol() {
  return $("symbol").value.trim().toUpperCase();
}

function selectedChain() {
  return $("chain").value.trim();
}

function readable(value) {
  return titleCase(String(value || "").replace(/_/g, " "));
}

function decisionClass(decision, allowed) {
  if (allowed || decision === "approve") return "good-state";
  if (decision === "avoid" || decision === "insufficient_evidence") return "bad-state";
  if (decision === "watch" || decision === "review") return "warn-state";
  return "neutral";
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function streamAnswerStatus() {
  const lines = [
    "Preparing the latest cockpit packet.",
    "Sending the question to the local action-agent bridge.",
    "Waiting on the BYOK Venice/OpenAI-compatible model.",
    "Grounding the answer in source refs and current evidence.",
  ];
  let index = 0;
  const startedAt = Date.now();
  const render = () => {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const visible = lines.slice(0, Math.min(index + 1, lines.length));
    const suffix = ".".repeat((index % 3) + 1);
    visible[visible.length - 1] = `${visible[visible.length - 1]}${suffix}`;
    if (index >= lines.length - 1) {
      visible.push(`Still working: ${elapsedSeconds}s`);
    }
    $("answer").textContent = visible.join("\n");
    $("askStatus").textContent = visible[visible.length - 1];
    index += 1;
  };
  render();
  const timer = window.setInterval(render, 850);
  return () => window.clearInterval(timer);
}

function setBusy(id, busy, busyLabel = "Working") {
  const node = $(id);
  if (!node.dataset.idleLabel) {
    node.dataset.idleLabel = node.textContent;
  }
  node.disabled = busy;
  node.textContent = busy ? busyLabel : node.dataset.idleLabel;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function initializeSelectors() {
  const symbolSelect = $("symbol");
  const selected = symbolSelect.value || "VVV";
  symbolSelect.innerHTML = SUPPORTED_SYMBOLS.map((symbol) => `<option value="${symbol}">${symbol}</option>`).join("");
  symbolSelect.value = SUPPORTED_SYMBOLS.includes(selected) ? selected : "VVV";

  const chainSelect = $("chain");
  const selectedChainValue = chainSelect.value || "8453";
  chainSelect.innerHTML = CHAIN_OPTIONS.map(
    (chain) => `<option value="${chain.value}">${escapeHtml(chain.label)}</option>`,
  ).join("");
  chainSelect.value = CHAIN_OPTIONS.some((chain) => chain.value === selectedChainValue) ? selectedChainValue : "8453";

  const supportedSymbols = $("supportedSymbols");
  if (supportedSymbols) {
    supportedSymbols.innerHTML = SUPPORTED_SYMBOLS.map((symbol) => `<span class="symbol-chip">${symbol}</span>`).join("");
  }
}

initializeSelectors();
$("review").addEventListener("click", review);
$("preflight").addEventListener("click", preflight);
$("ask").addEventListener("click", ask);
$("theme-toggle").addEventListener("click", () => {
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});
document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => selectView(button.dataset.view));
});
$("refresh").addEventListener("click", async () => {
  await refreshCards();
  await refreshOps();
});
$("cards").addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  if (target.dataset.label) {
    await request("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ target_id: target.dataset.target, label: target.dataset.label }),
    });
  }
  if (target.dataset.paper) {
    await request("/api/paper-orders", {
      method: "POST",
      body: JSON.stringify({ target_id: target.dataset.target, side: "BUY", approved: true, notional_usd: 100 }),
    });
  }
  await refreshOps();
});

applyTheme(localStorage.getItem("cockpit-theme") || "light");
selectView("trade");
await refreshHealth();
await refreshCards();
await refreshOps();
if (latestTargetId === "") {
  review().catch((error) => {
    $("answer").textContent = error.message;
  });
}
