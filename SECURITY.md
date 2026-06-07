# Security

This repository is a public Data Intelligence distribution kit. It must
not handle exchange credentials, trading execution, private forecasts, raw
VPIN/features, or portfolio state.

## Supported Boundary

- Read TradeOS public intelligence.
- Submit structured feedback and public claim outcomes.
- Use user-provided model provider credentials in local or server-side examples.

## Prohibited Boundary

- Do not add tools that place trades.
- Do not request exchange API keys.
- Do not bypass TradeOS entitlements.
- Do not expose raw private telemetry.
- Do not put model provider API keys in browser-only examples.

Report security issues privately to the TradeOS maintainers.
