# Safety Boundaries

This kit is public-intelligence distribution infrastructure.

Tradebot builders may use it as a context, risk, monitoring, or explainability
layer. The public kit itself must not be presented as an execution engine or as
a guaranteed trading signal.

It must not:

- place trades;
- accept exchange API credentials;
- expose portfolio state unless a future private deployment explicitly adds it;
- return raw VPIN, forecast, feature, or execution telemetry;
- scrape private dashboard pages;
- bypass TradeOS entitlements;
- provide personalized financial advice;
- imply guaranteed outcomes or returns.

LLM examples must keep model provider keys local or server-side. Browser-only
examples must not ask users to paste model API keys into public client code.
