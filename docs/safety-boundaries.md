# Safety Boundaries

This kit is public-intelligence distribution infrastructure.

The safest default product shape is private and self-hosted:

```text
TradeOS provides intelligence.
The Symbol Cockpit runs in the individual operator's private environment.
Keys, custody, portfolio state, sizing rules, approvals, and execution stay local
to that operator.
```

Tradebot builders may use it as a context, risk, monitoring, or explainability
layer. The Symbol Cockpit and Action Agent may present actionable
recommendations. The public kit itself must not be presented as TradeOS-hosted
execution, custody, managed account service, or guaranteed trading system.

Builders can package, document, or extend the cockpit for users to self-host.
They should not operate a shared cockpit for customers, collect customer
exchange credentials, custody customer assets, control customer accounts, or
place orders for customers.

Action intents are allowed only as non-executable review artifacts. They must
require operator review and must not include executable order fields such as
venue, account ID, quantity, notional, order type, route, calldata, transaction
body, or execute URL.

The Symbol Cockpit and Action Agent may produce recommendation language such as
"buy candidate," "avoid new long," "watch," "trim exposure," "exit candidate,"
"bot preflight failed," or "insufficient evidence." That language is allowed
when it is evidence-first, shows assumptions and invalidation, and makes clear
who controls execution. It is not a promise of outcome, and TradeOS does not
place the trade.

It must not:

- place trades from TradeOS infrastructure;
- accept exchange API credentials;
- expose portfolio state unless a future private deployment explicitly adds it;
- return raw VPIN, forecast, feature, or execution telemetry;
- scrape private dashboard pages;
- bypass TradeOS entitlements;
- hide that sizing, allocation, and final execution are controlled by the
  self-hosted operator using the cockpit for their own account context;
- manage third-party accounts or run third-party execution as part of the public
  TradeOS kit boundary;
- route action intents to a live executor from TradeOS infrastructure;
- imply guaranteed outcomes or returns.

## Private Deployment Boundary

Self-hosted operators can run the cockpit or action agent on their own hardware,
which keeps local context private by deployment. That does not make TradeOS API
calls invisible to TradeOS.

Treat the private deployment as the main security feature. A good cockpit
should be useful without asking the user to upload account credentials,
strategy memory, exchange keys, or complete portfolio state to TradeOS.

Keep local unless explicitly shared:

- portfolio and wallet context;
- strategy notes and memory;
- bot rules;
- execution logs;
- model-provider keys;
- exchange, wallet, or broker credentials.

Recommended local-only controls:

- paper mode before live mode;
- explicit approval gates;
- position-size and loss-limit rules;
- kill switch;
- local audit log;
- local execution adapter status;
- operator review queue for automation.

Sent to TradeOS when used:

- symbol, chain, and horizon for public intelligence reads;
- app-key attribution;
- account token when the user chooses account-owned state;
- feedback target IDs, labels, and provenance;
- paid/x402 entitlement context for paid resources.

LLM examples must keep model provider keys local or server-side. Browser-only
examples must not ask users to paste model API keys into public client code.

If a builder uses the cockpit to manage third-party accounts, receive customer
credentials, or run execution for other users, that builder is outside the
public kit's supported private-use boundary and owns the resulting security,
legal, compliance, and operational obligations. The public kit should not imply
that TradeOS absorbs those obligations.
