import type { ActionRecipe } from "./types.js";

export const DEFAULT_ACTION_RECIPES: ActionRecipe[] = [
  {
    id: "flow_stress_watcher",
    title: "Flow-stress watcher",
    mode: "all",
    recommendation_type: "watchlist_scanner",
    trigger: "VPIN, liquidity, flow, or sell-pressure stress appears in evidence.",
    default_severity: "warning",
  },
  {
    id: "fusion_quality_degradation",
    title: "Fusion quality degradation",
    mode: "trader",
    recommendation_type: "watchlist_scanner",
    trigger: "Fusion confidence, agreement, or signal quality degrades.",
    default_severity: "warning",
  },
  {
    id: "broader_market_selloff",
    title: "Broader market selloff watcher",
    mode: "all",
    recommendation_type: "watchlist_scanner",
    trigger: "Market pulse points to broad risk-off pressure.",
    default_severity: "watch",
  },
  {
    id: "sector_pressure_watcher",
    title: "Sector pressure watcher",
    mode: "all",
    recommendation_type: "watchlist_scanner",
    trigger: "Sector or narrative support weakens versus the symbol.",
    default_severity: "watch",
  },
  {
    id: "token_risk_watcher",
    title: "Token-risk watcher",
    mode: "investor",
    recommendation_type: "watchlist_scanner",
    trigger: "Tokenomics, liquidity, identity, sellability, or contract risk appears.",
    default_severity: "critical",
  },
  {
    id: "forecast_bias_divergence",
    title: "Forecast and bias divergence watcher",
    mode: "trader",
    recommendation_type: "watchlist_scanner",
    trigger: "Forecast, directional bias, and current price action disagree.",
    default_severity: "warning",
  },
  {
    id: "bot_preflight_gate",
    title: "Bot preflight gate",
    mode: "trader",
    recommendation_type: "trade_preflight",
    trigger: "A local bot requests approve, avoid, watch, or insufficient-evidence guidance.",
    default_severity: "critical",
  },
  {
    id: "weekly_thesis_drift",
    title: "Weekly thesis drift summary",
    mode: "investor",
    recommendation_type: "weekly_thesis_drift",
    trigger: "Longer-horizon evidence gets better, worse, or stale over the week.",
    default_severity: "info",
  },
];

