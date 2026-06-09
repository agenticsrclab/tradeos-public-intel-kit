# Symbol Intelligence Coverage

This page defines the current coverage boundary for the Symbol Cockpit and
Action Agent.

## Current Answer

The current coverage model has **two tiers**:

1. The full trading-intelligence cockpit universe is **21 symbols**. Those are
   the symbols shared by the TradeOS market-ingestion universe, price-forecaster
   `GP_SYMBOLS`, directional-bias tracked symbols, and the dashboard
   forecast-accuracy matrix.
2. The broader public thesis registry is **52 symbols**. Those symbols can have
   public thesis, discovery, watchlist, source-profile, or risk context, but
   they should not automatically be described as full cockpit trading coverage.

Full trading-intelligence coverage means the cockpit can expect the strongest
combination of TradeOS evidence for trader-facing calls: market ingestion,
forecast/bias signals, public-intel snapshots, source references, and local
cockpit layers such as feasibility, EA/risk, preflight, notification cards, and
ops review.

The cockpit UI defaults to the 21 full-coverage symbols. The underlying public
API and SDK can still read broader symbols where public-intel evidence exists.
For symbols outside the 21-symbol core, treat the response as **partial
discovery/risk/thesis coverage** unless TradeOS returns enough evidence to
support the call. Non-core symbols may have token-discovery, token-risk, thesis,
source-profile, public-candidate, or watchlist evidence, but they should not be
presented as having the same forecast/directional-bias/trading-evidence depth as
the core universe.

## Full Cockpit 21 Symbols

Use base symbols in the cockpit UI and `COCKPIT_WATCHLIST`. TradeOS services may
use venue-native forms internally.

| Base | USDT Form | Coinbase Form |
| --- | --- | --- |
| `BTC` | `BTCUSDT` | `BTC-USD` |
| `ETH` | `ETHUSDT` | `ETH-USD` |
| `SOL` | `SOLUSDT` | `SOL-USD` |
| `ADA` | `ADAUSDT` | `ADA-USD` |
| `DOGE` | `DOGEUSDT` | `DOGE-USD` |
| `XRP` | `XRPUSDT` | `XRP-USD` |
| `DOT` | `DOTUSDT` | `DOT-USD` |
| `POL` | `POLUSDT` | `POL-USD` |
| `LINK` | `LINKUSDT` | `LINK-USD` |
| `UNI` | `UNIUSDT` | `UNI-USD` |
| `VVV` | `VVVUSDT` | `VVV-USD` |
| `KTA` | `KTAUSDT` | `KTA-USD` |
| `AVAX` | `AVAXUSDT` | `AVAX-USD` |
| `NEAR` | `NEARUSDT` | `NEAR-USD` |
| `ARB` | `ARBUSDT` | `ARB-USD` |
| `OP` | `OPUSDT` | `OP-USD` |
| `SUI` | `SUIUSDT` | `SUI-USD` |
| `APT` | `APTUSDT` | `APT-USD` |
| `INJ` | `INJUSDT` | `INJ-USD` |
| `TIA` | `TIAUSDT` | `TIA-USD` |
| `FET` | `FETUSDT` | `FET-USD` |

Full local scanner list:

```bash
export COCKPIT_WATCHLIST=BTC,ETH,SOL,ADA,DOGE,XRP,DOT,POL,LINK,UNI,VVV,KTA,AVAX,NEAR,ARB,OP,SUI,APT,INJ,TIA,FET
```

## Broader Public Thesis Registry 52 Symbols

The public thesis registry currently includes:

```text
BTC, ETH, SOL, BNB, ADA, DOGE, SHIB, PEPE, BONK, XRP, DOT, POL, LINK, PYTH, API3,
UNI, AAVE, MKR, CRV, LDO, AERO, VVV, KTA, AVAX, NEAR, ARB, OP, SUI, APT, INJ,
TIA, FET, TAO, RNDR, AKT, STRK, ONDO, PENDLE, CFG, VIRTUAL, REPPO, SR, BRETT,
DEGEN, TOSHI, CLANKER, ZORA, MORPHO, WELL, AIXBT, SKI, KEYCAT
```

This registry is classification and thesis context. It is not a guarantee of
full forecast, directional-bias, market-ingestion, scanner, or trader-facing
evidence coverage for every symbol.

## Partial And Discovery Coverage

Do not describe non-core symbols as fully supported trading-intelligence names
unless TradeOS explicitly expands the core universe.

Examples of broader surfaces found in the TradeOS codebase:

| Surface | What It Means |
| --- | --- |
| Token discovery tracked symbols | Curated on-chain discovery can include names outside the 21 core, such as `AERO`, `VIRTUAL`, `REPPO`, `SR`, `BRETT`, `DEGEN`, `TOSHI`, `CLANKER`, `ZORA`, `MORPHO`, `WELL`, `AIXBT`, `SKI`, and `KEYCAT`. |
| Datalake/source-profile additions | Market or source-profile ingestion can include assets such as `ONDO`, `PENDLE`, and `CFG`. |
| Thesis/source registry | Public thesis and source-profile registries can include additional tracked names beyond the cockpit trading universe. |

Those surfaces are useful for discovery, risk review, and context. They are not
the same as full cockpit trading evidence unless the forecast, bias, ingestion,
and public-intel evidence stack also covers the symbol.

## Operator Rules

- Label the 21-symbol list as "full cockpit trading-intelligence coverage."
- Label broader registry names as "public thesis", "partial", "discovery", or
  "risk/thesis coverage" when they are outside the 21-symbol cockpit core.
- Label arbitrary non-registry names as partial or unsupported unless the
  response includes enough symbol-specific evidence.
- For bot preflight, treat `insufficient_evidence`, source errors, or partial
  coverage as a review/block condition before any execution adapter.
- Use the full `COCKPIT_WATCHLIST` list above for production-like cockpit
  scans; use a smaller sample such as `VVV,BTC,ETH,SOL` for local demos.
- When TradeOS expands the core universe, update this page and the local
  cockpit watchlist examples in the same change.

## Validation Sources

This page was validated against the current TradeOS codebase:

- `tradeos-main` production `SYMBOLS`, `SYMBOLS_COINBASE`, and
  `SYMBOLS_BINANCE` environment defaults.
- `tradeos-price-forecaster` `GP_SYMBOLS`.
- `tradeos-directional-bias` `BIAS_TRACKED_SYMBOLS_RAW`.
- Dashboard forecast-accuracy `ALL_SYMBOLS`.
- Token-discovery and datalake configs for broader partial/discovery coverage.
