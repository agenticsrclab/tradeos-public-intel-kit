# TradeOS Symbol Cockpit

Private self-hosted TradeOS Action Agent and Symbol Cockpit.

For the consumer-facing product walkthrough, reading model, requirements,
dependencies, launch path, and safety boundary, see
[Flagship Symbol Cockpit](../../docs/flagship-symbol-cockpit.md).

Run locally:

```bash
cd apps/symbol-cockpit
cp .env.example .env
npm install
npm run dev:api
```

Open `http://127.0.0.1:18100`.

Coverage:

The current full TradeOS trading-intelligence universe for cockpit reads is 21
symbols:

```text
BTC, ETH, SOL, ADA, DOGE, XRP, DOT, POL, LINK, UNI, VVV, KTA,
AVAX, NEAR, ARB, OP, SUI, APT, INJ, TIA, FET
```

The cockpit accepts other symbols, but non-core symbols should be treated as
partial discovery/risk coverage unless TradeOS returns enough evidence for a
stronger read. For a full scanner run:

```bash
COCKPIT_WATCHLIST=BTC,ETH,SOL,ADA,DOGE,XRP,DOT,POL,LINK,UNI,VVV,KTA,AVAX,NEAR,ARB,OP,SUI,APT,INJ,TIA,FET npm run dev:api
```

See [Symbol Intelligence Coverage](../../docs/symbol-intelligence-coverage.md).

Core endpoints:

| Endpoint | Purpose |
| --- | --- |
| `GET /healthz` | Local runtime, TradeOS key, and model-key status. |
| `POST /api/cockpit` | Symbol to verdict/action packet. |
| `POST /api/preflight` | Local bot preflight over TradeOS evidence. |
| `POST /api/action-agent` | Venice/OpenAI-compatible cockpit assistant. |
| `POST /api/feedback` | Opt-in feedback to TradeOS public-intel feedback writes. |
| `POST /api/paper-orders` | Paper-only execution gateway with approval boundary. |
| `GET /api/ops` | Local ops snapshot for recommendations, approvals, audit, and kill switch. |

Live e2e sweep against a running cockpit:

```bash
npm --workspace @tradeos/symbol-cockpit run e2e:live
```

That checks health, web shell, TradeOS evidence, cockpit verdict, preflight,
Venice/OpenAI-compatible action agent, approval boundary, kill switch, paper
fill, and ops snapshot. It skips real feedback writes by default; enable one
feedback write with:

```bash
COCKPIT_E2E_SUBMIT_FEEDBACK=true npm --workspace @tradeos/symbol-cockpit run e2e:live
```

Headless UI/API integration tests:

```bash
npm --workspace @tradeos/symbol-cockpit run e2e:headless
```

Operator review email alerts are opt-in and reuse the shared TradeOS SMTP
settings:

```bash
COCKPIT_ALERT_EMAIL_ENABLED=true
COCKPIT_ALERT_EMAIL_TO=operator@example.com
COCKPIT_ALERT_EMAIL_MIN_SEVERITY=warning
COCKPIT_FEEDBACK_BASE_URL=https://tradeos.tech/feedback
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-user>
SMTP_PASSWORD=<smtp-password-or-app-password>
```

Alert emails include the price at the time of the note when TradeOS evidence
contains a price field, any supplied target price, the drivers/evidence that
triggered the card, and feedback buttons. `COCKPIT_FEEDBACK_BASE_URL` controls
where those feedback buttons open. The default is the hosted TradeOS feedback
page. For private self-hosted feedback, set `COCKPIT_PUBLIC_BASE_URL` and point
`COCKPIT_FEEDBACK_BASE_URL` at your cockpit `/feedback` page.

To require a live e2e email delivery, start the cockpit with email enabled and
run:

```bash
COCKPIT_E2E_REQUIRE_EMAIL=true npm --workspace @tradeos/symbol-cockpit run e2e:live
```

Privacy boundary:

- model keys, public-intel keys, account tokens, and future exchange keys stay
  server-side;
- TradeOS sees public-intelligence requests and feedback the runtime sends;
- local notes, portfolio state, approvals, execution logs, and strategy context
  stay local unless explicitly included;
- execution is paper-only in this kit.

Compose:

```bash
docker compose up
docker compose --profile risk up
docker compose --profile execution up
```

The `execution` profile starts only the paper gateway. Live adapters are not
included in this public kit.
