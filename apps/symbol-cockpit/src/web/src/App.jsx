import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ConformanceBadgeStrip,
  ConformanceCheckList,
  PlatformPulseStrip,
  ProofCounterGrid,
  SourceBadge,
  SourceEventList,
  SourceMetricGrid,
  SourceServiceStatusList,
  StandardsTrialMatrix,
  useSourceTheme,
} from "@source-ui/react/index.js";
import { SOURCE_UI_THEME_STORAGE_KEY } from "@source-ui/contracts.js";
import {
  platformPulse,
  providerPassport,
  SOURCE_STANDARD_TRIALS,
  SOURCE_UI_CHECKS,
  uxConformance,
  verticalManifest,
} from "./sourceMetadata.js";

const apiBase = window.COCKPIT_API_BASE || "";
const LEGACY_THEME_STORAGE_KEY = "cockpit-theme";
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
const PRICE_HISTORY_KEY = "cockpit-price-history";
const PRICE_HISTORY_LIMIT = 24;
const RING_CIRCUMFERENCE = 2 * Math.PI * 19;

const storageGet = (key, fallback = "") => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

const storageSet = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Local preferences are best effort.
  }
};

function migrateLegacyThemePreference() {
  try {
    if (!localStorage.getItem(SOURCE_UI_THEME_STORAGE_KEY) && localStorage.getItem(LEGACY_THEME_STORAGE_KEY)) {
      localStorage.setItem(SOURCE_UI_THEME_STORAGE_KEY, localStorage.getItem(LEGACY_THEME_STORAGE_KEY));
    }
  } catch {
    // Source UI still applies the in-memory dark default.
  }
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

function loadPriceHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PRICE_HISTORY_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function savePriceHistory(history) {
  try {
    localStorage.setItem(PRICE_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Price history is local UI sugar, not a runtime dependency.
  }
}

function recordPrice(symbol, price, asOf) {
  if (!symbol || !Number.isFinite(Number(price))) return false;
  const history = loadPriceHistory();
  const rows = Array.isArray(history[symbol]) ? history[symbol] : [];
  const at = asOf || new Date().toISOString();
  if (rows.length > 0 && rows[rows.length - 1].at === at && rows[rows.length - 1].p === Number(price)) return false;
  rows.push({ p: Number(price), at });
  history[symbol] = rows.slice(-PRICE_HISTORY_LIMIT);
  savePriceHistory(history);
  return true;
}

function viewFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  return ["admin", "guide", "trade"].includes(hash) ? hash : "trade";
}

function App() {
  if (window.location.pathname === "/feedback") return <FeedbackPage />;
  return <CockpitPage />;
}

function CockpitPage() {
  const theme = useSourceTheme();
  const [symbol, setSymbol] = useState(() => (SUPPORTED_SYMBOLS.includes(storageGet("cockpit-symbol")) ? storageGet("cockpit-symbol") : "VVV"));
  const [chain, setChain] = useState(() => (CHAIN_OPTIONS.some((item) => item.value === storageGet("cockpit-chain")) ? storageGet("cockpit-chain") : "8453"));
  const [mode, setMode] = useState(() => storageGet("cockpit-mode", "trader"));
  const [density, setDensity] = useState(() => (storageGet("cockpit-density", "comfortable") === "compact" ? "compact" : "comfortable"));
  const [heroCollapsed, setHeroCollapsed] = useState(() => storageGet("cockpit-hero", "expanded") === "collapsed");
  const [view, setViewState] = useState(viewFromHash);
  const [health, setHealth] = useState(null);
  const [cards, setCards] = useState([]);
  const [ops, setOps] = useState(null);
  const [packet, setPacket] = useState(null);
  const [preflightResult, setPreflightResult] = useState(null);
  const [preflightError, setPreflightError] = useState("");
  const [answer, setAnswer] = useState("");
  const [askStatus, setAskStatus] = useState("Ready");
  const [busy, setBusy] = useState({});
  const [pulseResults, setPulseResults] = useState(() => new Map());
  const [pulseStatus, setPulseStatus] = useState("Not scanned yet");
  const [toasts, setToasts] = useState([]);
  const [priceVersion, setPriceVersion] = useState(0);
  const [commandStuck, setCommandStuck] = useState(false);
  const commandSentinelRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    migrateLegacyThemePreference();
    theme.setPreference(theme.preference || "dark");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.dataset.density = density;
    storageSet("cockpit-density", density);
  }, [density]);

  useEffect(() => {
    const onHashChange = () => setViewState(viewFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setView = useCallback((nextView) => {
    setViewState(nextView);
    if (nextView === "trade") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    } else if (window.location.hash !== `#${nextView}`) {
      window.location.hash = nextView;
    }
  }, []);

  useEffect(() => {
    const update = () => {
      setCommandStuck((commandSentinelRef.current?.getBoundingClientRect().bottom ?? 1) < 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const toast = useCallback((message, tone = "ok") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, message, tone, leaving: false }]);
    window.setTimeout(() => {
      setToasts((items) => items.map((item) => (item.id === id ? { ...item, leaving: true } : item)));
      window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 320);
    }, 4200);
  }, []);

  const refreshCards = useCallback(async () => {
    const result = await request("/api/recommendations");
    setCards((result.cards || []).slice(-8).reverse());
  }, []);

  const refreshOps = useCallback(async () => {
    setOps(await request("/api/ops"));
  }, []);

  const refreshHealth = useCallback(async () => {
    setHealth(await request("/healthz"));
  }, []);

  const review = useCallback(
    async (overrideSymbol) => {
      const nextSymbol = (overrideSymbol || symbol).trim().toUpperCase();
      setBusy((state) => ({ ...state, review: true }));
      try {
        const result = await request("/api/cockpit", {
          method: "POST",
          body: JSON.stringify({ symbol: nextSymbol, chain, mode }),
        });
        const nextPacket = result.packet;
        if (recordPrice(nextPacket.symbol, nextPacket.market_snapshot?.price_usd, nextPacket.market_snapshot?.price_as_of)) {
          setPriceVersion((value) => value + 1);
        }
        setPacket(nextPacket);
        await refreshCards();
        await refreshOps();
        return nextPacket;
      } finally {
        setBusy((state) => ({ ...state, review: false }));
      }
    },
    [chain, mode, refreshCards, refreshOps, symbol],
  );

  const preflight = useCallback(async () => {
    setBusy((state) => ({ ...state, preflight: true }));
    setPreflightError("");
    setPreflightResult({ pending: true });
    try {
      const result = await request("/api/preflight", {
        method: "POST",
        body: JSON.stringify({ symbol, chain, proposed_action: "buy", proposed_notional_usd: 250 }),
      });
      if (result.cockpit?.market_snapshot?.price_usd !== undefined) {
        recordPrice(result.cockpit.symbol, result.cockpit.market_snapshot.price_usd, result.cockpit.market_snapshot.price_as_of);
        setPriceVersion((value) => value + 1);
      }
      setPacket(result.cockpit);
      setPreflightResult(result);
      setAnswer(JSON.stringify(result.preflight, null, 2));
      await refreshCards();
      await refreshOps();
    } catch (error) {
      setPreflightError(error instanceof Error ? error.message : String(error));
      setAnswer(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy((state) => ({ ...state, preflight: false }));
    }
  }, [chain, refreshCards, refreshOps, symbol]);

  const ask = useCallback(async () => {
    setBusy((state) => ({ ...state, ask: true }));
    const startedAt = Date.now();
    const lines = [
      "Preparing the latest cockpit packet.",
      "Sending the question to the local action-agent bridge.",
      "Waiting on the BYOK Venice/OpenAI-compatible model.",
      "Grounding the answer in source refs and current evidence.",
    ];
    let index = 0;
    const renderStatus = () => {
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      const visible = lines.slice(0, Math.min(index + 1, lines.length));
      visible[visible.length - 1] = `${visible[visible.length - 1]}${".".repeat((index % 3) + 1)}`;
      if (index >= lines.length - 1) visible.push(`Still working: ${elapsedSeconds}s`);
      setAnswer(visible.join("\n"));
      setAskStatus(visible[visible.length - 1]);
      index += 1;
    };
    renderStatus();
    const timer = window.setInterval(renderStatus, 850);
    try {
      const result = await request("/api/action-agent", {
        method: "POST",
        body: JSON.stringify({ symbol, question: document.getElementById("question")?.value || "" }),
      });
      window.clearInterval(timer);
      setAskStatus("Answer ready");
      setAnswer(result.answer || JSON.stringify(result, null, 2));
    } catch (error) {
      window.clearInterval(timer);
      setAskStatus("Needs review");
      setAnswer(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy((state) => ({ ...state, ask: false }));
    }
  }, [symbol]);

  const scanWatchlist = useCallback(async () => {
    if (busy.scan) return;
    setBusy((state) => ({ ...state, scan: true }));
    setPulseResults(new Map());
    setPulseStatus(`Scanning 0/${SUPPORTED_SYMBOLS.length}`);
    const nextResults = new Map();
    try {
      let completed = 0;
      for (const nextSymbol of SUPPORTED_SYMBOLS) {
        try {
          const result = await request("/api/cockpit", {
            method: "POST",
            body: JSON.stringify({ symbol: nextSymbol, chain, mode }),
          });
          nextResults.set(nextSymbol, {
            symbol: nextSymbol,
            verdict: result.packet.verdict,
            action: result.packet.action,
            confidence: result.packet.confidence,
            price_usd: result.packet.market_snapshot?.price_usd,
          });
          if (recordPrice(nextSymbol, result.packet.market_snapshot?.price_usd, result.packet.market_snapshot?.price_as_of)) {
            setPriceVersion((value) => value + 1);
          }
        } catch (error) {
          nextResults.set(nextSymbol, { symbol: nextSymbol, verdict: "insufficient_evidence", error: error.message });
        }
        completed += 1;
        setPulseResults(new Map(nextResults));
        setPulseStatus(`Scanning ${completed}/${SUPPORTED_SYMBOLS.length}`);
      }
      setPulseStatus(`Scanned ${SUPPORTED_SYMBOLS.length} symbols at ${formatTime(new Date().toISOString())}`);
      const buyCount = [...nextResults.values()].filter((entry) => entry.verdict === "buy_candidate").length;
      toast(`Watchlist scan complete: ${buyCount} buy candidate${buyCount === 1 ? "" : "s"}.`, "ok");
      await refreshCards();
      await refreshOps();
    } catch (error) {
      setPulseStatus("Scan failed");
      toast(error instanceof Error ? error.message : String(error), "warn");
    } finally {
      setBusy((state) => ({ ...state, scan: false }));
    }
  }, [busy.scan, chain, mode, refreshCards, refreshOps, toast]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    refreshHealth();
    refreshCards();
    refreshOps();
    review().catch((error) => setAnswer(error instanceof Error ? error.message : String(error)));
  }, [refreshCards, refreshHealth, refreshOps, review]);

  useEffect(() => {
    const handler = (event) => {
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
        setView("trade");
        document.getElementById("question")?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [preflight, review, scanWatchlist, toast]);

  const handleSymbolChange = (event) => {
    setSymbol(event.target.value);
    storageSet("cockpit-symbol", event.target.value);
  };

  const handleChainChange = (event) => {
    setChain(event.target.value);
    storageSet("cockpit-chain", event.target.value);
  };

  const handleModeChange = (event) => {
    setMode(event.target.value);
    storageSet("cockpit-mode", event.target.value);
  };

  const handlePulseClick = async (nextSymbol) => {
    setSymbol(nextSymbol);
    storageSet("cockpit-symbol", nextSymbol);
    setView("trade");
    try {
      await review(nextSymbol);
    } catch (error) {
      toast(error instanceof Error ? error.message : String(error), "warn");
    }
  };

  const submitCardFeedback = async (targetId, label) => {
    await request("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ target_id: targetId, label }),
    });
    toast(`Feedback "${readable(label)}" submitted.`, "ok");
    await refreshOps();
  };

  const submitPaperOrder = async (targetId) => {
    const result = await request("/api/paper-orders", {
      method: "POST",
      body: JSON.stringify({ target_id: targetId, side: "BUY", approved: true, notional_usd: 100 }),
    });
    toast(`Paper order ${readable(result.status || "submitted")}.`, result.status === "filled" ? "ok" : "warn");
    await refreshOps();
  };

  return (
    <main className="shell">
      <Header
        density={density}
        onDensity={() => setDensity(density === "compact" ? "comfortable" : "compact")}
        theme={theme}
      />
      <HealthStrip health={health} />
      <SourceStandardStrip />
      <Ticker pulseResults={pulseResults} />
      <Hero collapsed={heroCollapsed} onToggle={() => {
        const next = !heroCollapsed;
        setHeroCollapsed(next);
        storageSet("cockpit-hero", next ? "collapsed" : "expanded");
      }} />
      <FlowLane />
      <div ref={commandSentinelRef} className="command-sentinel"></div>
      <CommandBar
        stuck={commandStuck}
        symbol={symbol}
        chain={chain}
        mode={mode}
        packet={packet}
        busy={busy}
        onSymbolChange={handleSymbolChange}
        onChainChange={handleChainChange}
        onModeChange={handleModeChange}
        onReview={() => review().catch((error) => toast(error.message, "warn"))}
        onPreflight={preflight}
        onScan={scanWatchlist}
      />
      <ViewTabs view={view} setView={setView} />
      <section className={`view ${view === "trade" ? "active" : ""}`} id="trade-view" data-view-panel="trade">
        <TradeView
          pulseStatus={pulseStatus}
          pulseResults={pulseResults}
          packet={packet}
          preflightResult={preflightResult}
          preflightError={preflightError}
          answer={answer}
          askStatus={askStatus}
          busy={busy}
          cards={cards}
          priceVersion={priceVersion}
          onPulseClick={handlePulseClick}
          onAsk={ask}
          onRefresh={async () => {
            await refreshCards();
            await refreshOps();
          }}
          onFeedback={(targetId, label) => submitCardFeedback(targetId, label).catch((error) => toast(error.message, "warn"))}
          onPaper={(targetId) => submitPaperOrder(targetId).catch((error) => toast(error.message, "warn"))}
        />
      </section>
      <section className={`view ${view === "admin" ? "active" : ""}`} id="admin-view" data-view-panel="admin">
        <AdminView ops={ops} />
      </section>
      <section className={`view ${view === "guide" ? "active" : ""}`} id="guide-view" data-view-panel="guide">
        <GuideView />
      </section>
      <Footer />
      <ToastHost toasts={toasts} />
    </main>
  );
}

function Header({ density, onDensity, theme }) {
  return (
    <section className="toolbar app-header">
      <div className="brand-lockup">
        <a href="https://tradeos.tech" target="_blank" rel="noreferrer" className="tradeos-mark" aria-label="TradeOS.tech">
          <span className="mark-orbit"></span>
          <span className="mark-core"></span>
        </a>
        <div>
          <div className="brand-row">
            <h1>TradeOS Symbol Cockpit</h1>
            <a href="https://tradeos.tech" target="_blank" rel="noreferrer" className="powered-link">
              Powered by TradeOS.tech
            </a>
          </div>
          <p className="subtitle">A private self-hosted trade decision cockpit over TradeOS intelligence.</p>
        </div>
      </div>
      <div className="toolbar-actions">
        <a href="https://tradeos.tech" target="_blank" rel="noreferrer" className="button-link">
          TradeOS.tech
        </a>
        <button id="density-toggle" className="icon-button" type="button" title={`Switch to ${density === "compact" ? "comfortable" : "compact"} density`} onClick={onDensity}>
          {density === "compact" ? "Comfy" : "Compact"}
        </button>
        <button
          id="theme-toggle"
          className="icon-button"
          type="button"
          title={`Switch to ${theme.resolvedTheme === "dark" ? "light" : "dark"} mode`}
          data-preference={theme.preference}
          onClick={() => theme.setPreference(theme.resolvedTheme === "dark" ? "light" : "dark")}
        >
          {theme.resolvedTheme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </section>
  );
}

function HealthStrip({ health }) {
  if (!health) {
    return (
      <section className="status-strip" id="health" aria-live="polite">
        <span className="status-chip">Checking local runtime</span>
      </section>
    );
  }
  return (
    <section className="status-strip" id="health" aria-live="polite">
      <span className={`status-chip ${health.status === "ok" ? "ok" : "warn"}`}>API {health.status}</span>
      <span className={`status-chip ${health.public_intel_key_configured ? "ok" : "warn"}`}>
        TradeOS key {health.public_intel_key_configured ? "set" : "not set"}
      </span>
      <span className={`status-chip ${health.venice_or_openai_key_configured ? "ok" : "warn"}`}>
        model key {health.venice_or_openai_key_configured ? "set" : "not set"}
      </span>
      <span className="status-chip ok">Paper-only runtime</span>
    </section>
  );
}

function SourceStandardStrip() {
  const proofItems = [
    { label: "Token namespace", value: verticalManifest.ux.token_namespace },
    { label: "Theme key", value: verticalManifest.ux.theme_storage_key },
    { label: "Provider passport", value: providerPassport.ux_conformance_level },
    { label: "Pulse claim", value: platformPulse.channels[0]?.claim || "distribution_health" },
  ];
  return (
    <section className="source-standard-strip source-platform-pulse" id="sourceStandard" aria-label="Source Intelligence Network UX standard">
      <div className="source-standard-head">
        <div className="source-standard-title">
          <strong>Source Intelligence UX</strong>
          <span>
            {verticalManifest.ux.token_namespace} · {verticalManifest.ux.theme_storage_key} · {verticalManifest.ux.theme_default} default
          </span>
        </div>
        <ConformanceBadgeStrip report={uxConformance} />
      </div>
      <ProofCounterGrid ariaLabel="Source UX proof counters" items={proofItems} />
      <PlatformPulseStrip viewModel={platformPulse} />
    </section>
  );
}

function Ticker({ pulseResults }) {
  const entries = [...pulseResults.values()].filter((entry) => !entry.error);
  const items = entries.map((entry) => {
    const tone = VERDICT_TONE[entry.verdict] || "thin";
    const price = entry.price_usd !== undefined ? ` ${formatUsd(entry.price_usd)}` : "";
    return (
      <span key={`${entry.symbol}-a`} className={`ticker-item ${tone}`}>
        {entry.symbol}
        {price} · {readable(entry.verdict)}
      </span>
    );
  });
  return (
    <div className="ticker-band" aria-hidden="true">
      <div className={`ticker-track ${entries.length ? "rolling" : ""}`} id="tickerTrack">
        {items}
        {items.map((item) => React.cloneElement(item, { key: `${item.key}-b` }))}
      </div>
    </div>
  );
}

function Hero({ collapsed, onToggle }) {
  return (
    <section className={`trade-hero ${collapsed ? "collapsed" : ""}`} id="tradeHero">
      <button id="hero-collapse" className="hero-collapse" type="button" title={collapsed ? "Expand intro" : "Collapse intro"} aria-expanded={String(!collapsed)} onClick={onToggle}>
        {collapsed ? "+" : "-"}
      </button>
      <div>
        <span className="eyebrow">Self-Hosted Operator Mode</span>
        <h2>Trade signal, local controls.</h2>
        <p className="hero-detail">
          TradeOS supplies evidence and feedback rails. This cockpit runs in the operator environment and does not custody assets, hold exchange keys, place live orders, manage accounts, or guarantee returns.
        </p>
      </div>
      <div className="boundary-grid hero-detail">
        <span>Local: keys, approvals, sizing, paper execution</span>
        <span>TradeOS: public intelligence, source refs, feedback IDs</span>
      </div>
    </section>
  );
}

function FlowLane() {
  const steps = Array.from({ length: 6 }, (_, index) => (
    <React.Fragment key={index}>
      <span>Review</span><em>-&gt;</em><span>Gate</span><em>-&gt;</em><span>Size</span><em>-&gt;</em><span>Execute</span><em>-&gt;</em>
    </React.Fragment>
  ));
  return (
    <div className="flow-lane" aria-hidden="true">
      <div className="flow-lane-track">{steps}</div>
    </div>
  );
}

function CommandBar({ stuck, symbol, chain, mode, packet, busy, onSymbolChange, onChainChange, onModeChange, onReview, onPreflight, onScan }) {
  return (
    <section className={`search-band trade-ticket ${stuck ? "stuck" : ""}`} id="commandBar">
      <label>
        <span>Symbol</span>
        <select id="symbol" aria-label="Symbol" value={symbol} onChange={onSymbolChange}>
          {SUPPORTED_SYMBOLS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label>
        <span>Chain</span>
        <select id="chain" aria-label="Chain" value={chain} onChange={onChainChange}>
          {CHAIN_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
      <label>
        <span>Mode</span>
        <select id="mode" aria-label="Mode" value={mode} onChange={onModeChange}>
          <option value="trader">Trader</option>
          <option value="swing">Swing</option>
          <option value="investor">Investor</option>
        </select>
      </label>
      <button id="review" className="primary" disabled={busy.review} onClick={onReview}>{busy.review ? "Reviewing" : "Review"}</button>
      <button id="preflight" disabled={busy.preflight} onClick={onPreflight}>{busy.preflight ? "Checking" : "Preflight Buy"}</button>
      <button id="scan" className="scan-button" disabled={busy.scan} onClick={onScan}>{busy.scan ? "Scanning" : "Scan Watchlist"}</button>
      <CommandVerdict packet={packet} />
    </section>
  );
}

function CommandVerdict({ packet }) {
  if (!packet) return <span id="commandVerdict" className="command-verdict" aria-live="polite"></span>;
  const tone = VERDICT_TONE[packet.verdict] || "thin";
  return (
    <span id="commandVerdict" className={`command-verdict ${tone}`} aria-live="polite" title={`Latest review: ${packet.symbol} · ${readable(packet.verdict)} · ${Math.round(packet.confidence * 100)}% confidence`}>
      <span className="cv-dot" aria-hidden="true"></span>
      <strong>{packet.symbol}</strong>
      <span>{readable(packet.verdict)}</span>
      <em>{Math.round(packet.confidence * 100)}%</em>
    </span>
  );
}

function ViewTabs({ view, setView }) {
  return (
    <section className="view-tabs" aria-label="Cockpit views">
      {[
        ["trade", "Trade Desk"],
        ["admin", "Admin & Ops"],
        ["guide", "Guide"],
      ].map(([id, label]) => (
        <button key={id} className={`tab-button ${view === id ? "active" : ""}`} type="button" data-view={id} onClick={() => setView(id)}>
          {label}
        </button>
      ))}
    </section>
  );
}

function TradeView({ pulseStatus, pulseResults, packet, preflightResult, preflightError, answer, askStatus, busy, cards, priceVersion, onPulseClick, onAsk, onRefresh, onFeedback, onPaper }) {
  return (
    <>
      <section className="panel pulse-panel" id="pulsePanel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Market Pulse</span>
            <p className="panel-caption">One-click verdict heatmap across the full 21-symbol coverage universe. Click a tile to load it in the cockpit.</p>
          </div>
          <span id="pulseStatus" className="inline-status">{pulseStatus}</span>
        </div>
        <PulseGrid pulseResults={pulseResults} onPulseClick={onPulseClick} />
        <div className="pulse-legend">
          <span className="legend-dot buy"></span><span>Buy candidate</span>
          <span className="legend-dot watch"></span><span>Watch</span>
          <span className="legend-dot avoid"></span><span>Avoid / trim / exit</span>
          <span className="legend-dot thin"></span><span>Insufficient evidence</span>
        </div>
      </section>

      <section className="trade-grid">
        <div className="trade-main-stack">
          <VerdictPanel packet={packet} priceVersion={priceVersion} />
          <PreflightPanel result={preflightResult} error={preflightError} />
        </div>
        <div className="side-stack">
          <div className="panel agent-panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Action Agent</span>
                <p className="panel-caption">BYOK Venice/OpenAI-compatible answer grounded in the current packet.</p>
              </div>
            </div>
            <textarea id="question" rows="4" aria-label="Action agent question" defaultValue="What should I do with this symbol?"></textarea>
            <div className="button-row">
              <button id="ask" className="primary" disabled={busy.ask} onClick={onAsk}>{busy.ask ? "Asking" : "Ask"}</button>
              <span id="askStatus" className="inline-status">{askStatus}</span>
            </div>
            <pre id="answer" aria-live="polite" tabIndex={0}>{answer}</pre>
          </div>

          <div className="panel inbox-panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Inbox</span>
                <p className="panel-caption">Recommendation cards, feedback, and paper-only action requests.</p>
              </div>
              <button id="refresh" onClick={onRefresh}>Refresh</button>
            </div>
            <Cards cards={cards} onFeedback={onFeedback} onPaper={onPaper} />
          </div>
        </div>
      </section>
    </>
  );
}

function PulseGrid({ pulseResults, onPulseClick }) {
  return (
    <div id="pulseGrid" className="pulse-grid">
      {SUPPORTED_SYMBOLS.map((symbol) => {
        const entry = pulseResults.get(symbol);
        if (!entry) {
          return (
            <button key={symbol} type="button" className="pulse-tile pending" data-pulse-symbol={symbol} title="Not scanned yet" onClick={() => onPulseClick(symbol)}>
              <strong>{symbol}</strong><span>--</span>
            </button>
          );
        }
        const tone = VERDICT_TONE[entry.verdict] || "thin";
        const confidence = entry.confidence !== undefined ? `${Math.round(entry.confidence * 100)}%` : "--";
        const title = entry.error || `${readable(entry.verdict)} · ${readable(entry.action || "")}`;
        return (
          <button key={symbol} type="button" className={`pulse-tile ${tone}`} data-pulse-symbol={symbol} title={title} onClick={() => onPulseClick(symbol)}>
            <strong>{symbol}</strong><span>{confidence}</span>
          </button>
        );
      })}
    </div>
  );
}

function VerdictPanel({ packet, priceVersion }) {
  const confidence = packet ? Math.round(packet.confidence * 100) : null;
  const dashOffset = packet ? RING_CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, Number(packet.confidence) || 0))) : RING_CIRCUMFERENCE;
  return (
    <div className="panel verdict-panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Verdict</span>
          <p className="panel-caption">Good, bad, ugly, next action, and source-backed caveats.</p>
        </div>
        <div className="confidence-cluster">
          <svg className="confidence-ring" viewBox="0 0 44 44" aria-hidden="true">
            <circle className="ring-track" cx="22" cy="22" r="19"></circle>
            <circle className="ring-fill" id="confidenceRing" cx="22" cy="22" r="19" data-tone={packet ? VERDICT_TONE[packet.verdict] || "watch" : "watch"} style={{ strokeDasharray: `${RING_CIRCUMFERENCE}`, strokeDashoffset: `${dashOffset}` }}></circle>
          </svg>
          <span id="confidence" className="pill">{confidence === null ? "--" : `${confidence}%`}</span>
        </div>
      </div>
      <h2 id="verdict">{packet ? `${packet.symbol}: ${readable(packet.verdict)}` : "Enter a symbol"}</h2>
      <p id="action">{packet ? String(packet.action || "").replaceAll("_", " ") : "The cockpit will show the current local recommendation."}</p>
      <MarketStrip packet={packet} priceVersion={priceVersion} />
      <div className="columns">
        <ListColumn title="Good" id="good" items={packet?.good || []} className="good" />
        <ListColumn title="Bad" id="bad" items={packet?.bad || []} className="bad" />
        <ListColumn title="Ugly" id="ugly" items={packet?.ugly || []} className="ugly" />
      </div>
      <div className="steps">
        <h3>Next</h3>
        <ol id="steps">{(packet?.next_steps || []).map((item, index) => <li key={index}>{item}</li>)}</ol>
      </div>
    </div>
  );
}

function MarketStrip({ packet, priceVersion }) {
  const stats = useMemo(() => {
    if (!packet) return [];
    const snapshot = packet.market_snapshot || {};
    const rows = [];
    if (snapshot.price_usd !== undefined) {
      rows.push({ label: "Price at review", value: formatUsd(snapshot.price_usd), detail: snapshot.price_source });
      const spark = sparklineData(packet.symbol, priceVersion);
      if (spark) rows.push({ spark, label: `Local trend (${spark.count} obs)` });
    }
    if (snapshot.target_price_usd !== undefined) {
      rows.push({ label: "Target price", value: formatUsd(snapshot.target_price_usd), detail: snapshot.target_price_source });
      if (snapshot.price_usd) {
        const upside = ((snapshot.target_price_usd - snapshot.price_usd) / snapshot.price_usd) * 100;
        rows.push({ label: "To target", value: `${upside >= 0 ? "+" : ""}${upside.toFixed(1)}%`, detail: "derived from evidence prices" });
      }
    }
    rows.push({
      label: "Evidence",
      value: `${packet.evidence_refs?.length ?? 0} refs · ${packet.source_summary?.matched_items ?? 0} matched`,
      detail: `${packet.source_summary?.source_count ?? 0} sources, ${packet.source_summary?.error_count ?? 0} errors`,
    });
    rows.push({ label: "As of", value: formatTime(snapshot.price_as_of || packet.generated_at), detail: packet.mode ? `${packet.mode} mode` : undefined });
    return rows;
  }, [packet, priceVersion]);

  return (
    <div id="marketStrip" className="market-strip">
      {stats.map((stat, index) => stat.spark ? <SparkStat key={index} stat={stat} /> : <MarketStat key={index} {...stat} />)}
    </div>
  );
}

function MarketStat({ label, value, detail }) {
  return (
    <div className="market-stat" title={detail || undefined}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SparkStat({ stat }) {
  const { spark } = stat;
  return (
    <div className="market-stat spark-stat" title={`Local price history from your last ${spark.count} reviews/scans of ${spark.symbol}. Not an exchange feed.`}>
      <span>{stat.label}</span>
      <div className="spark-row">
        <svg className={`sparkline ${spark.tone}`} viewBox={`0 0 ${spark.width} ${spark.height}`} preserveAspectRatio="none" aria-hidden="true">
          <polyline className="spark-fill" points={`0,${spark.height} ${spark.points.join(" ")} ${spark.width},${spark.height}`}></polyline>
          <polyline className="spark-line" points={spark.points.join(" ")}></polyline>
          <circle className="spark-dot" cx={spark.lastPoint[0]} cy={spark.lastPoint[1]} r="2.4"></circle>
        </svg>
        <strong className={spark.tone}>{spark.change >= 0 ? "+" : ""}{spark.change.toFixed(1)}%</strong>
      </div>
    </div>
  );
}

function ListColumn({ title, id, items, className }) {
  return (
    <div>
      <h3>{title}</h3>
      <ul id={id}>{items.map((item, index) => <li key={index} className={className}>{item}</li>)}</ul>
    </div>
  );
}

function PreflightPanel({ result, error }) {
  const pending = result?.pending;
  const preflight = result?.preflight;
  const decision = pending ? "checking" : error ? "error" : preflight?.decision || "not_run";
  const allowed = Boolean(preflight?.allowed);
  const reasons = pending
    ? [
        "Fetching fresh evidence for the selected symbol.",
        "Evaluating EA risk, feasibility, and paper-only execution boundaries.",
      ]
    : error
      ? ["The preflight did not complete. Check the local API logs and key configuration."]
      : preflight
        ? [
            `Allowed: ${allowed ? "yes" : "no"}`,
            `EA risk: ${result.ea_risk?.decision || "unknown"}`,
            `Feasibility: ${result.feasibility?.verdict || "unknown"}${result.feasibility?.recommended_size_usd !== undefined ? `, recommended size $${Number(result.feasibility.recommended_size_usd).toFixed(2)}` : ""}`,
            "To keep watching this symbol, re-run Review later or run the optional scanner worker on COCKPIT_WATCHLIST.",
            ...(preflight.next_steps || []),
          ]
        : ["Uses the selected symbol, selected chain, and a paper-only $250 buy proposal."];
  return (
    <div className="panel preflight-panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Preflight</span>
          <p className="panel-caption">Checks a paper buy against the latest verdict and local gates.</p>
        </div>
        <span id="preflightDecision" className={`pill ${decisionClass(decision, allowed)}`}>{pending ? "Checking" : error ? "Error" : preflight ? readable(decision) : "Not run"}</span>
      </div>
      <p id="preflightSummary" className="status-copy">
        {pending
          ? "Checking the proposed paper buy against the latest TradeOS packet and local gates."
          : error
            ? error
            : preflight
              ? `${preflight.reason || "Review before sending to your own execution system."} This is a one-time gate check, not a background watcher.`
              : "Run Preflight Buy before paper execution. It is a one-time gate check; it does not start a watcher or place a live order."}
      </p>
      <ul id="preflightReasons" className="compact-list">{reasons.map((item, index) => <li key={index}>{item}</li>)}</ul>
      <pre id="preflightRaw" tabIndex={0}>{preflight ? JSON.stringify(preflight, null, 2) : ""}</pre>
    </div>
  );
}

function Cards({ cards, onFeedback, onPaper }) {
  return (
    <div id="cards" className="cards">
      {cards.map((card) => (
        <article key={card.card_id || card.target_id} className={`card ${VERDICT_TONE[card.verdict] || ""}`.trim()}>
          <h4>{card.title}</h4>
          <p>{card.body}</p>
          <div className="card-meta">
            <span className={`mini-chip ${card.severity === "critical" || card.severity === "warning" ? "warn" : "ok"}`}>{card.severity}</span>
            <span>{Math.round(card.confidence * 100)}% confidence</span>
            <span>{card.evidence_refs?.length || 0} refs</span>
          </div>
          <div className="card-actions">
            <button className="secondary compact-button" data-target={card.target_id} data-label="useful" onClick={() => onFeedback(card.target_id, "useful")}>Useful</button>
            <button className="secondary compact-button" data-target={card.target_id} data-label="not_useful" onClick={() => onFeedback(card.target_id, "not_useful")}>Wrong</button>
            <button className="primary compact-button" data-target={card.target_id} data-paper="true" onClick={() => onPaper(card.target_id)}>Paper Buy</button>
          </div>
        </article>
      ))}
    </div>
  );
}

function AdminView({ ops }) {
  return (
    <section className="admin-grid">
      <div className="panel admin-summary">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Operator Console</span>
            <p className="panel-caption">Local modules that wrap every recommendation before action.</p>
          </div>
        </div>
        <MetricGrid ops={ops} />
      </div>
      <div className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Local Gates</span>
            <p className="panel-caption">EA/risk and feasibility are local policy gates, not TradeOS-hosted execution.</p>
          </div>
        </div>
        <div className="gate-explainer">
          <article><strong>EA Risk</strong><span>Scores whether the current evidence has enough expected advantage for new risk.</span></article>
          <article><strong>Feasibility</strong><span>Applies local account, sizing, drawdown, and blocked-asset policy for paper-only checks.</span></article>
          <article><strong>Execution Gateway</strong><span>Accepts only paper orders in this kit and writes local audit events.</span></article>
        </div>
        <ServiceGrid services={ops?.services || {}} />
      </div>
      <div className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Paper Execution</span>
            <p className="panel-caption">Paper orders are local simulations for review. This GUI does not place live trades.</p>
          </div>
        </div>
        <ApprovalList approvals={ops?.approvals?.latest || []} />
      </div>
      <SourceConformancePanel />
      <StandardsTrialPanel />
      <div className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Audit</span>
            <p className="panel-caption">Recent local audit and notification events.</p>
          </div>
        </div>
        <AuditList ops={ops} />
      </div>
      <div className="panel raw-ops-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Raw Ops</span>
            <p className="panel-caption">Full local ops snapshot for debugging and integration checks.</p>
          </div>
        </div>
        <pre id="ops" tabIndex={0}>{JSON.stringify(ops || {}, null, 2)}</pre>
      </div>
    </section>
  );
}

function MetricGrid({ ops }) {
  const metrics = [
    ["Open recs", ops?.recommendations?.open ?? 0, "Recommendations still open"],
    ["Risk cards", ops?.recommendations?.warning_or_critical ?? 0, "Warning or critical cards"],
    ["Pending", ops?.approvals?.pending ?? 0, "Paper approvals waiting"],
    ["Audit", ops?.audit?.length ?? 0, "Recent local audit events"],
  ].map(([label, value, caption]) => ({
    label,
    value,
    caption,
    countTo: Number.isFinite(Number(value)) ? Number(value) : 0,
  }));
  return <SourceMetricGrid id="opsSummary" className="metric-grid" itemClassName="metric-card" items={metrics} />;
}

function ServiceGrid({ services }) {
  const rows = Object.entries(services).map(([name, service]) => ({
    id: name,
    label: serviceLabel(name),
    description: serviceDescription(name),
    status: service.status,
    detail: service.detail,
    className: service.status === "ok" || service.status === "configured" ? "good" : "bad",
  }));
  return <SourceServiceStatusList id="serviceGrid" className="service-grid" rowClassName="service-row" services={rows} />;
}

function ApprovalList({ approvals }) {
  const events = approvals.map((approval) => ({
    id: approval.id || approval.target_id,
    title: approval.action || "approval",
    body: approval.summary || approval.target_id || "pending approval",
    status: approval.status || "pending",
  }));
  return (
    <SourceEventList
      id="approvalList"
      className="event-list"
      rowClassName="event-row"
      emptyClassName="empty-note"
      empty="No pending approvals. Paper requests from recommendation cards will appear here."
      items={events}
    />
  );
}

function AuditList({ ops }) {
  const events = [
    ...(ops?.audit || []).map((event) => ({ title: event.event_type, body: event.message, time: event.occurred_at })),
    ...(ops?.notifications?.latest || []).map((event) => ({ title: `notification_${event.status}`, body: event.reason, time: event.delivered_at })),
  ].slice(0, 8).map((event, index) => ({
    id: `${event.title || "event"}-${event.time || index}`,
    title: titleCase(event.title || "event"),
    body: event.body || "",
    time: formatTime(event.time),
  }));
  return (
    <SourceEventList
      id="auditList"
      className="event-list"
      rowClassName="event-row"
      emptyClassName="empty-note"
      empty="No local audit events yet."
      items={events}
    />
  );
}

function SourceConformancePanel() {
  const proofItems = [
    { label: "Routes", value: uxConformance.routes.join(" · ") },
    { label: "Checks", value: `${SOURCE_UI_CHECKS.length} total` },
    { label: "Font delivery", value: uxConformance.font_delivery },
    { label: "Boundary", value: verticalManifest.operator_boundary },
  ];
  return (
    <div className="panel source-uptake-panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Source UI Conformance</span>
          <p className="panel-caption">Live standards metadata used by this cockpit shell.</p>
        </div>
        <SourceBadge id="sourceConformanceStatus" tone="build">{uxConformance.visual_conformance_status}</SourceBadge>
      </div>
      <ProofCounterGrid id="sourceConformanceGrid" className="source-standard-grid" ariaLabel="Source UI conformance counters" items={proofItems} />
      <ConformanceCheckList id="sourceConformanceChecks" checks={SOURCE_UI_CHECKS} />
    </div>
  );
}

function StandardsTrialPanel() {
  return (
    <div className="panel source-uptake-panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Standards Trial Matrix</span>
          <p className="panel-caption">How this React/Vite cockpit exercises the Source UI SDK against TradeOS anchors.</p>
        </div>
        <SourceBadge tone="agent">reference uptake</SourceBadge>
      </div>
      <StandardsTrialMatrix id="sourceStandardsLab" trials={SOURCE_STANDARD_TRIALS} />
    </div>
  );
}

function GuideView() {
  return (
    <>
      <section className="panel flow-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">How The Flow Works</span>
            <p className="panel-caption">What to click, what happens, and what never happens in this paper-only cockpit.</p>
          </div>
        </div>
        <div className="flow-steps">
          <article><strong>1. Review</strong><span>Fetches fresh TradeOS evidence for the selected symbol and updates the verdict and inbox card.</span></article>
          <article><strong>2. Preflight Buy</strong><span>Runs a one-time paper-buy gate check. It does not subscribe, poll, watch, or place a live order.</span></article>
          <article><strong>3. Ask</strong><span>Uses your BYOK model to explain the latest packet with source-backed context.</span></article>
          <article><strong>4. Paper Buy</strong><span>Records a local paper execution only when you click it. Live execution is not included in this kit.</span></article>
        </div>
        <p className="status-copy">
          If a result says watch, that is a recommendation state. To keep monitoring it, re-run Review later or run the optional scanner worker on `COCKPIT_WATCHLIST`.
        </p>
      </section>
      <section className="guide-grid">
        <GuideCard title="Review symbols and ask the action agent" kicker="Trade Desk" items={[
          "Pick one of the 21 full-coverage symbols, choose chain context, then run Review.",
          "Review fetches current TradeOS evidence and creates the latest verdict, next steps, and inbox card.",
          "Good, Bad, Ugly, and Next explain why the verdict exists. They are not an order ticket.",
          "Ask sends the latest packet to your BYOK Venice/OpenAI-compatible model and shows progress while it waits.",
        ]} />
        <GuideCard title="Check actionability before paper orders" kicker="Preflight And Paper" items={[
          "Preflight Buy is a one-time paper-only $250 buy check against the current verdict and local gates.",
          "It does not start watching, subscribe, poll, notify by itself, or place a live order.",
          "If it says Allowed: no, the proposed buy is blocked even if feasibility shows a small sized-down amount.",
          "If it says watch, that means wait for stronger evidence; re-run Review later or run the optional scanner worker.",
          "Paper Buy on a card records a local paper execution result only after you click it.",
        ]} />
        <GuideCard title="Inspect local controls" kicker="Admin & Ops" items={[
          "Operator Console summarizes open recommendations, risk cards, approvals, and audit events.",
          "Local Gates show TradeOS intel, EA risk, feasibility, and paper execution health.",
          "Raw Ops is the full local snapshot for integration testing and support.",
        ]} />
        <div className="panel">
          <span className="eyebrow">Coverage</span>
          <h3>Full trading-intelligence symbols</h3>
          <p className="status-copy">These 21 symbols have full cockpit trading-intelligence coverage. Other symbols may still have discovery or risk evidence, but should be labeled partial coverage.</p>
          <div id="supportedSymbols" className="symbol-cloud">
            {SUPPORTED_SYMBOLS.map((item) => <span key={item} className="symbol-chip">{item}</span>)}
          </div>
        </div>
      </section>
    </>
  );
}

function GuideCard({ kicker, title, items }) {
  return (
    <div className="panel">
      <span className="eyebrow">{kicker}</span>
      <h3>{title}</h3>
      <ul className="compact-list">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
    </div>
  );
}

function Footer() {
  return (
    <footer className="legal-footer">
      <strong>Powered by TradeOS.tech intelligence.</strong>
      <span>Self-hosted recommendations are operator-controlled. TradeOS is not the broker, custodian, account manager, exchange-key holder, or live execution venue for this local cockpit.</span>
      <a href="https://tradeos.tech" target="_blank" rel="noreferrer" className="text-link">TradeOS.tech home</a>
      <span className="kbd-hint" aria-hidden="true">Shortcuts: <kbd>R</kbd> review · <kbd>P</kbd> preflight · <kbd>S</kbd> scan · <kbd>/</kbd> ask</span>
    </footer>
  );
}

function ToastHost({ toasts }) {
  return (
    <div id="toastHost" className="toast-host" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.tone} ${toast.leaving ? "leaving" : ""}`}>{toast.message}</div>
      ))}
    </div>
  );
}

function FeedbackPage() {
  const theme = useSourceTheme();
  const params = new URLSearchParams(window.location.search);
  const targetId = params.get("target_id") || "";
  const label = params.get("label") || "useful";
  const symbol = params.get("symbol") || "unknown symbol";
  const verdict = params.get("verdict") || "unknown verdict";
  const cardId = params.get("card_id") || "";
  const [feedbackLabel, setFeedbackLabel] = useState(label);
  const [note, setNote] = useState("");
  const [result, setResult] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    migrateLegacyThemePreference();
    theme.setPreference(theme.preference || "dark");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setResult("Submitting...");
    try {
      if (!targetId) throw new Error("Missing target_id.");
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ target_id: targetId, label: feedbackLabel, note: note.trim() || undefined }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || response.statusText);
      setResult(`Feedback recorded.\n\n${JSON.stringify(payload, null, 2)}`);
    } catch (error) {
      setResult(error instanceof Error ? error.message : String(error));
      setSubmitting(false);
    }
  };

  return (
    <main className="feedback-shell">
      <section className="toolbar feedback-toolbar">
        <div className="brand-lockup">
          <a href="https://tradeos.tech" target="_blank" rel="noreferrer" className="tradeos-mark" aria-label="TradeOS.tech">
            <span className="mark-orbit"></span><span className="mark-core"></span>
          </a>
          <div>
            <div className="brand-row">
              <h1>Recommendation Feedback</h1>
              <a href="https://tradeos.tech" target="_blank" rel="noreferrer" className="powered-link">Powered by TradeOS.tech</a>
            </div>
            <p className="subtitle">Feedback improves TradeOS intelligence without moving custody or execution out of your environment.</p>
          </div>
        </div>
        <div className="toolbar-actions">
          <a href="https://tradeos.tech" target="_blank" rel="noreferrer" className="button-link">TradeOS.tech</a>
          <button id="theme-toggle" className="icon-button" type="button" title={`Switch to ${theme.resolvedTheme === "dark" ? "light" : "dark"} mode`} data-preference={theme.preference} onClick={() => theme.setPreference(theme.resolvedTheme === "dark" ? "light" : "dark")}>
            {theme.resolvedTheme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </section>
      <section className="panel feedback-panel">
        <div className="panel-head">
          <span className="eyebrow">Feedback</span>
          <a href="/" className="text-link">Cockpit</a>
        </div>
        <h1>Review Recommendation</h1>
        <p id="summary" className="muted">
          {targetId ? `${symbol}: ${verdict.replaceAll("_", " ")} · target ${targetId}${cardId ? ` · card ${cardId}` : ""}` : "Missing target_id. Open this page from a cockpit recommendation email or card."}
        </p>
        <form id="feedback-form" className="feedback-form" onSubmit={submit}>
          <label>
            Label
            <select id="label" aria-label="Feedback label" value={feedbackLabel} onChange={(event) => setFeedbackLabel(event.target.value)}>
              <option value="useful">Useful</option>
              <option value="not_useful">Wrong</option>
              <option value="missing_context">Missing context</option>
              <option value="too_early">Too early</option>
              <option value="too_late">Too late</option>
              <option value="evidence_too_thin">Evidence too thin</option>
            </select>
          </label>
          <label>
            Note
            <textarea id="note" rows="4" placeholder="Optional context for TradeOS or your builder backend" value={note} onChange={(event) => setNote(event.target.value)}></textarea>
          </label>
          <button id="submit" className="primary" type="submit" disabled={submitting}>Submit Feedback</button>
        </form>
        <pre id="result" className="feedback-result" tabIndex={0}>{result}</pre>
      </section>
      <footer className="legal-footer">
        <strong>Self-hosted operator boundary.</strong>
        <span>TradeOS receives the feedback payload and source refs you submit. Local keys, account state, approvals, portfolio notes, and execution remain with the operator.</span>
        <a href="https://tradeos.tech" target="_blank" rel="noreferrer" className="text-link">TradeOS.tech home</a>
      </footer>
    </main>
  );
}

function sparklineData(symbol, version) {
  void version;
  const rows = loadPriceHistory()[symbol] || [];
  if (rows.length < 2) return null;
  const prices = rows.map((row) => row.p);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const width = 120;
  const height = 30;
  const step = width / (prices.length - 1);
  const points = prices.map((price, index) => `${(index * step).toFixed(1)},${(height - 3 - ((price - min) / span) * (height - 6)).toFixed(1)}`);
  const last = points[points.length - 1].split(",").map(Number);
  const tone = prices[prices.length - 1] >= prices[0] ? "up" : "down";
  const change = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
  return { symbol, points, lastPoint: last, tone, change, count: rows.length, width, height };
}

function decisionClass(decision, allowed) {
  if (allowed || decision === "approve") return "good-state";
  if (decision === "avoid" || decision === "insufficient_evidence" || decision === "error") return "bad-state";
  if (decision === "watch" || decision === "review" || decision === "checking") return "warn-state";
  return "neutral";
}

function readable(value) {
  return titleCase(String(value || "").replace(/_/g, " "));
}

function titleCase(value) {
  return String(value || "").replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatUsd(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  const digits = amount >= 1000 ? 2 : amount >= 1 ? 2 : 4;
  return "$" + amount.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function serviceLabel(value) {
  return SERVICE_LABELS[value] || titleCase(value);
}

function serviceDescription(value) {
  return SERVICE_COPY[value] || "Local service status for the current cockpit runtime.";
}

export default App;
