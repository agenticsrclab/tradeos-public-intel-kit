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
const VERDICT_TONE = {
  buy_candidate: "buy",
  watch: "watch",
  avoid_new_long: "avoid",
  trim_or_reduce: "avoid",
  exit_or_sell_candidate: "avoid",
  insufficient_evidence: "thin",
};
const SCAN_CONCURRENCY = 3;
const RING_CIRCUMFERENCE = 2 * Math.PI * 19;
const PRICE_HISTORY_KEY = "cockpit-price-history";
const PRICE_HISTORY_LIMIT = 24;
const pulseResults = new Map();
const metricPrevious = new Map();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let scanInFlight = false;
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

function applyDensity(density) {
  const nextDensity = density === "compact" ? "compact" : "comfortable";
  root.dataset.density = nextDensity;
  localStorage.setItem("cockpit-density", nextDensity);
  const toggle = $("density-toggle");
  if (toggle) {
    toggle.textContent = nextDensity === "compact" ? "Comfy" : "Compact";
    toggle.title = `Switch to ${nextDensity === "compact" ? "comfortable" : "compact"} density`;
  }
}

function applyHero(state) {
  const collapsed = state === "collapsed";
  const hero = $("tradeHero");
  const toggle = $("hero-collapse");
  if (!hero || !toggle) return;
  hero.classList.toggle("collapsed", collapsed);
  toggle.textContent = collapsed ? "+" : "−";
  toggle.title = collapsed ? "Expand intro" : "Collapse intro";
  toggle.setAttribute("aria-expanded", String(!collapsed));
  localStorage.setItem("cockpit-hero", collapsed ? "collapsed" : "expanded");
}

function initStickyCommandBar() {
  const bar = $("commandBar");
  if (!bar) return;
  const sentinel = document.createElement("div");
  sentinel.className = "command-sentinel";
  bar.before(sentinel);
  const update = () => {
    bar.classList.toggle("stuck", sentinel.getBoundingClientRect().bottom < 0);
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
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
    node.className = `card ${VERDICT_TONE[card.verdict] || ""}`.trim();
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
  renderConfidenceRing(packet.confidence, packet.verdict);
  renderCommandVerdict(packet);
  renderMarketStrip(packet);
  renderList("good", packet.good, "good");
  renderList("bad", packet.bad, "bad");
  renderList("ugly", packet.ugly, "ugly");
  renderList("steps", packet.next_steps);
}

function renderCommandVerdict(packet) {
  const chip = $("commandVerdict");
  if (!chip) return;
  const tone = VERDICT_TONE[packet.verdict] || "thin";
  chip.className = `command-verdict ${tone}`;
  chip.innerHTML = `
    <span class="cv-dot" aria-hidden="true"></span>
    <strong>${escapeHtml(packet.symbol)}</strong>
    <span>${escapeHtml(readable(packet.verdict))}</span>
    <em>${Math.round(packet.confidence * 100)}%</em>
  `;
  chip.title = `Latest review: ${packet.symbol} · ${readable(packet.verdict)} · ${Math.round(packet.confidence * 100)}% confidence`;
}

function renderConfidenceRing(confidence, verdict) {
  const ring = $("confidenceRing");
  if (!ring) return;
  const clamped = Math.max(0, Math.min(1, Number(confidence) || 0));
  ring.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
  ring.style.strokeDashoffset = `${RING_CIRCUMFERENCE * (1 - clamped)}`;
  ring.dataset.tone = VERDICT_TONE[verdict] || "watch";
}

function loadPriceHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PRICE_HISTORY_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function recordPrice(symbol, price, asOf) {
  if (!symbol || !Number.isFinite(Number(price))) return;
  const history = loadPriceHistory();
  const rows = Array.isArray(history[symbol]) ? history[symbol] : [];
  const at = asOf || new Date().toISOString();
  if (rows.length > 0 && rows[rows.length - 1].at === at && rows[rows.length - 1].p === Number(price)) return;
  rows.push({ p: Number(price), at });
  history[symbol] = rows.slice(-PRICE_HISTORY_LIMIT);
  try {
    localStorage.setItem(PRICE_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Quota errors should never break the cockpit.
  }
}

function sparklineSvg(symbol) {
  const rows = loadPriceHistory()[symbol] || [];
  if (rows.length < 2) return "";
  const prices = rows.map((row) => row.p);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const width = 120;
  const height = 30;
  const step = width / (prices.length - 1);
  const points = prices.map((price, index) => `${(index * step).toFixed(1)},${(height - 3 - ((price - min) / span) * (height - 6)).toFixed(1)}`);
  const rising = prices[prices.length - 1] >= prices[0];
  const tone = rising ? "up" : "down";
  const change = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
  return `
    <div class="market-stat spark-stat" title="Local price history from your last ${rows.length} reviews/scans of ${symbol}. Not an exchange feed.">
      <span>Local trend (${rows.length} obs)</span>
      <div class="spark-row">
        <svg class="sparkline ${tone}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
          <polyline class="spark-fill" points="0,${height} ${points.join(" ")} ${width},${height}"></polyline>
          <polyline class="spark-line" points="${points.join(" ")}"></polyline>
          <circle class="spark-dot" cx="${points[points.length - 1].split(",")[0]}" cy="${points[points.length - 1].split(",")[1]}" r="2.4"></circle>
        </svg>
        <strong class="${tone}">${change >= 0 ? "+" : ""}${change.toFixed(1)}%</strong>
      </div>
    </div>
  `;
}

function renderMarketStrip(packet) {
  const strip = $("marketStrip");
  if (!strip) return;
  const snapshot = packet.market_snapshot || {};
  const stats = [];
  if (snapshot.price_usd !== undefined) {
    recordPrice(packet.symbol, snapshot.price_usd, snapshot.price_as_of);
    stats.push(marketStat("Price at review", formatUsd(snapshot.price_usd), snapshot.price_source));
    const spark = sparklineSvg(packet.symbol);
    if (spark) stats.push(spark);
  }
  if (snapshot.target_price_usd !== undefined) {
    stats.push(marketStat("Target price", formatUsd(snapshot.target_price_usd), snapshot.target_price_source));
    if (snapshot.price_usd) {
      const upside = ((snapshot.target_price_usd - snapshot.price_usd) / snapshot.price_usd) * 100;
      stats.push(marketStat("To target", `${upside >= 0 ? "+" : ""}${upside.toFixed(1)}%`, "derived from evidence prices"));
    }
  }
  stats.push(
    marketStat(
      "Evidence",
      `${packet.evidence_refs?.length ?? 0} refs · ${packet.source_summary?.matched_items ?? 0} matched`,
      `${packet.source_summary?.source_count ?? 0} sources, ${packet.source_summary?.error_count ?? 0} errors`,
    ),
  );
  stats.push(marketStat("As of", formatTime(snapshot.price_as_of || packet.generated_at), packet.mode ? `${packet.mode} mode` : undefined));
  strip.innerHTML = stats.join("");
}

function marketStat(label, value, detail) {
  return `
    <div class="market-stat" ${detail ? `title="${escapeHtml(detail)}"` : ""}>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function formatUsd(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  const digits = amount >= 1000 ? 2 : amount >= 1 ? 2 : 4;
  return "$" + amount.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
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
  animateMetricValues();

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
      <strong data-count-to="${Number.isFinite(Number(value)) ? Number(value) : 0}">${escapeHtml(value)}</strong>
      <small>${escapeHtml(caption)}</small>
    </div>
  `;
}

function animateMetricValues() {
  document.querySelectorAll("#opsSummary [data-count-to]").forEach((node) => {
    const target = Number(node.dataset.countTo);
    if (!Number.isFinite(target)) return;
    const label = node.previousElementSibling?.textContent || "";
    const from = metricPrevious.has(label) ? metricPrevious.get(label) : 0;
    metricPrevious.set(label, target);
    if (reducedMotion.matches || from === target) {
      node.textContent = String(target);
      return;
    }
    const duration = 520;
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - (1 - progress) ** 3;
      node.textContent = String(Math.round(from + (target - from) * eased));
      if (progress < 1 && node.isConnected) {
        requestAnimationFrame(tick);
      } else {
        node.textContent = String(target);
      }
    };
    requestAnimationFrame(tick);
  });
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

async function scanWatchlist() {
  if (scanInFlight) return;
  scanInFlight = true;
  setBusy("scan", true, "Scanning");
  const queue = [...SUPPORTED_SYMBOLS];
  let completed = 0;
  const updateStatus = () => {
    $("pulseStatus").textContent = `Scanning ${completed}/${SUPPORTED_SYMBOLS.length}`;
  };
  updateStatus();
  renderPulseGrid();
  try {
    const workers = Array.from({ length: SCAN_CONCURRENCY }, async () => {
      while (queue.length > 0) {
        const symbol = queue.shift();
        try {
          const result = await request("/api/cockpit", {
            method: "POST",
            body: JSON.stringify({ symbol, chain: selectedChain(), mode: $("mode").value }),
          });
          pulseResults.set(symbol, {
            symbol,
            verdict: result.packet.verdict,
            action: result.packet.action,
            confidence: result.packet.confidence,
            price_usd: result.packet.market_snapshot?.price_usd,
          });
          recordPrice(symbol, result.packet.market_snapshot?.price_usd, result.packet.market_snapshot?.price_as_of);
        } catch (error) {
          pulseResults.set(symbol, { symbol, verdict: "insufficient_evidence", error: error.message });
        }
        completed += 1;
        updateStatus();
        renderPulseGrid();
        renderTicker();
      }
    });
    await Promise.all(workers);
    $("pulseStatus").textContent = `Scanned ${SUPPORTED_SYMBOLS.length} symbols at ${formatTime(new Date().toISOString())}`;
    toast(`Watchlist scan complete: ${buyCount()} buy candidate${buyCount() === 1 ? "" : "s"}.`, "ok");
    await refreshCards();
    await refreshOps();
  } catch (error) {
    $("pulseStatus").textContent = "Scan failed";
    toast(error.message, "warn");
  } finally {
    scanInFlight = false;
    setBusy("scan", false);
  }
}

function buyCount() {
  return [...pulseResults.values()].filter((entry) => entry.verdict === "buy_candidate").length;
}

function renderPulseGrid() {
  const grid = $("pulseGrid");
  if (!grid) return;
  grid.innerHTML = SUPPORTED_SYMBOLS.map((symbol) => {
    const entry = pulseResults.get(symbol);
    if (!entry) {
      return `<button type="button" class="pulse-tile pending" data-pulse-symbol="${symbol}" title="Not scanned yet"><strong>${symbol}</strong><span>--</span></button>`;
    }
    const tone = VERDICT_TONE[entry.verdict] || "thin";
    const confidence = entry.confidence !== undefined ? `${Math.round(entry.confidence * 100)}%` : "--";
    const title = entry.error ? escapeHtml(entry.error) : `${readable(entry.verdict)} · ${readable(entry.action || "")}`;
    return `
      <button type="button" class="pulse-tile ${tone}" data-pulse-symbol="${symbol}" title="${title}">
        <strong>${symbol}</strong>
        <span>${confidence}</span>
      </button>
    `;
  }).join("");
}

function renderTicker() {
  const track = $("tickerTrack");
  if (!track) return;
  const entries = [...pulseResults.values()].filter((entry) => !entry.error);
  if (entries.length === 0) {
    track.innerHTML = "";
    track.classList.remove("rolling");
    return;
  }
  const items = entries
    .map((entry) => {
      const tone = VERDICT_TONE[entry.verdict] || "thin";
      const price = entry.price_usd !== undefined ? ` ${formatUsd(entry.price_usd)}` : "";
      return `<span class="ticker-item ${tone}">${entry.symbol}${price} · ${readable(entry.verdict)}</span>`;
    })
    .join("");
  track.innerHTML = items + items;
  track.classList.add("rolling");
}

function toast(message, tone = "ok") {
  const host = $("toastHost");
  if (!host) return;
  const node = document.createElement("div");
  node.className = `toast ${tone}`;
  node.textContent = message;
  host.appendChild(node);
  window.setTimeout(() => {
    node.classList.add("leaving");
    window.setTimeout(() => node.remove(), 320);
  }, 4200);
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
  const selected = localStorage.getItem("cockpit-symbol") || symbolSelect.value || "VVV";
  symbolSelect.innerHTML = SUPPORTED_SYMBOLS.map((symbol) => `<option value="${symbol}">${symbol}</option>`).join("");
  symbolSelect.value = SUPPORTED_SYMBOLS.includes(selected) ? selected : "VVV";

  const chainSelect = $("chain");
  const selectedChainValue = localStorage.getItem("cockpit-chain") || chainSelect.value || "8453";
  chainSelect.innerHTML = CHAIN_OPTIONS.map(
    (chain) => `<option value="${chain.value}">${escapeHtml(chain.label)}</option>`,
  ).join("");
  chainSelect.value = CHAIN_OPTIONS.some((chain) => chain.value === selectedChainValue) ? selectedChainValue : "8453";

  const modeSelect = $("mode");
  const selectedMode = localStorage.getItem("cockpit-mode");
  if (selectedMode && [...modeSelect.options].some((option) => option.value === selectedMode)) {
    modeSelect.value = selectedMode;
  }

  symbolSelect.addEventListener("change", () => localStorage.setItem("cockpit-symbol", symbolSelect.value));
  chainSelect.addEventListener("change", () => localStorage.setItem("cockpit-chain", chainSelect.value));
  modeSelect.addEventListener("change", () => localStorage.setItem("cockpit-mode", modeSelect.value));

  const supportedSymbols = $("supportedSymbols");
  if (supportedSymbols) {
    supportedSymbols.innerHTML = SUPPORTED_SYMBOLS.map((symbol) => `<span class="symbol-chip">${symbol}</span>`).join("");
  }
}

function bindKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const inEditable =
      target instanceof HTMLElement &&
      (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);
    if (inEditable || event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === "r") {
      event.preventDefault();
      review().catch((error) => toast(error.message, "warn"));
    } else if (key === "p") {
      event.preventDefault();
      preflight();
    } else if (key === "s") {
      event.preventDefault();
      scanWatchlist();
    } else if (key === "/") {
      event.preventDefault();
      selectView("trade");
      $("question").focus();
    }
  });
}

initializeSelectors();
$("review").addEventListener("click", review);
$("preflight").addEventListener("click", preflight);
$("ask").addEventListener("click", ask);
$("theme-toggle").addEventListener("click", () => {
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});
$("density-toggle").addEventListener("click", () => {
  applyDensity(root.dataset.density === "compact" ? "comfortable" : "compact");
});
$("hero-collapse").addEventListener("click", () => {
  applyHero($("tradeHero").classList.contains("collapsed") ? "expanded" : "collapsed");
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
  try {
    if (target.dataset.label) {
      await request("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ target_id: target.dataset.target, label: target.dataset.label }),
      });
      toast(`Feedback "${readable(target.dataset.label)}" submitted.`, "ok");
    }
    if (target.dataset.paper) {
      const result = await request("/api/paper-orders", {
        method: "POST",
        body: JSON.stringify({ target_id: target.dataset.target, side: "BUY", approved: true, notional_usd: 100 }),
      });
      toast(`Paper order ${readable(result.status || "submitted")}.`, result.status === "filled" ? "ok" : "warn");
    }
    await refreshOps();
  } catch (error) {
    toast(error.message, "warn");
  }
});
$("scan").addEventListener("click", scanWatchlist);
$("pulseGrid").addEventListener("click", async (event) => {
  const tile = event.target instanceof Element ? event.target.closest("[data-pulse-symbol]") : null;
  if (!tile) return;
  const symbol = tile.dataset.pulseSymbol;
  if (!SUPPORTED_SYMBOLS.includes(symbol)) return;
  $("symbol").value = symbol;
  localStorage.setItem("cockpit-symbol", symbol);
  selectView("trade");
  try {
    await review();
  } catch (error) {
    toast(error.message, "warn");
  }
});

applyTheme(localStorage.getItem("cockpit-theme") || "light");
applyDensity(localStorage.getItem("cockpit-density") || "comfortable");
applyHero(localStorage.getItem("cockpit-hero") || "expanded");
initStickyCommandBar();
selectView("trade");
bindKeyboardShortcuts();
renderPulseGrid();
await refreshHealth();
await refreshCards();
await refreshOps();
if (latestTargetId === "") {
  review().catch((error) => {
    $("answer").textContent = error.message;
  });
}
