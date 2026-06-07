# Architecture

TradeOS public intelligence is a distribution surface for source-backed market
context. The public kit is intentionally thin: it helps builders consume,
summarize, and send feedback on public evidence without exposing TradeOS private
systems or making users pay TradeOS for inference.

The product ladder stays the same across the kit and TradeOS:

```text
Use TradeOS free.
Give useful feedback to unlock more public depth.
Build products on public intelligence.
Pay when you need scale, alerts, automation, private context, or data rights.
```

## System Shape

```text
Builder app / agent host / CLI / MCP client
        |
        | TypeScript SDK, Python SDK, CLI, or stdio MCP tools
        v
https://api.tradeos.tech/v1/public-intel
        |
        | public-safe evidence packets
        | source snapshot refs
        | generated_at / freshness
        | confidence / limitations
        | stable target IDs
        v
Builder product surface
        |
        | optional structured feedback
        v
TradeOS feedback-credit loop
```

Optional LLM path:

```text
TradeOS public evidence -> user-owned model key -> grounded answer
```

The default CLI provider is [Venice AI](https://venice.ai/pricing) through an
OpenAI-compatible endpoint. Users can replace it with another OpenAI-compatible
provider by configuring `OPENAI_BASE_URL`, `OPENAI_API_KEY`, and
`TRADEOS_AGENT_MODEL`.

## Feature Expansion Model

The public kit is not a bundle of hidden premium features. It is a connector to
TradeOS services.

```text
Local package capability: SDK methods, MCP tools, CLI commands
Service capability: public API, paid API, x402 resources, enterprise endpoints
User/account state: starter quota, dashboard credits, paid entitlement
```

More features arrive through one of these paths:

- package updates add new public helpers or tools;
- public API responses expose new public-safe fields;
- feedback credits unlock dashboard-only depth where TradeOS has enabled it;
- x402 or paid API entitlement unlocks premium machine resources;
- enterprise contracts unlock custom universe, exports, replay data, or support.

The local client should route requests, pass identifiers and credentials, and
surface explicit payment/entitlement errors. TradeOS services decide whether a
request is public, credit-eligible, paid, or private.

## Identity And Credentials

The default public path is keyless. `TRADEOS_PUBLIC_INTEL_KEY` is optional and
intended for app attribution or higher-trust production usage after TradeOS
issues a public-intel app key to a signed-in builder account.

```text
No key: public trial and low-friction integration
Optional public-intel key: identifies the builder app
Linked TradeOS user: enables durable starter quota and credit reconciliation
x402 payment: pays for a specific machine resource
Paid API key or contract entitlement: unlocks premium/enterprise resources
```

The builder app should keep TradeOS paid credentials server-side. End-user
identity should be linked only when the user wants TradeOS-visible benefits such
as dashboard credits, starter quota, or bring-your-own paid entitlement.

## Components

### Public Intelligence API

The API returns bounded public intelligence:

- market digest inputs;
- public candidates;
- thesis watchlists;
- claim proof lookups;
- source health;
- source snapshot references;
- freshness and confidence metadata;
- limitations and invalidation notes.

It does not expose raw private telemetry, execution data, exchange credentials,
or paid exports.

### SDKs

The TypeScript and Python SDKs are thin HTTP clients. They avoid local business
logic so builders can rely on TradeOS versioned response contracts.

### MCP Server

The MCP server is stdio-based and intended for local agent hosts such as Claude
Desktop and Cursor. It exposes read-mostly tools plus structured feedback write
tools.

### BYOK CLI

The CLI has two modes:

- evidence mode: fetch digest, candidates, watchlist, and feedback without an
  LLM;
- agent mode: send public evidence to the user's model provider and produce a
  grounded answer.

The CLI defaults to:

```text
LLM_PROVIDER=venice
OPENAI_BASE_URL=https://api.venice.ai/api/v1
TRADEOS_AGENT_MODEL=z-ai-glm-5-turbo
TRADEOS_AGENT_TIMEOUT_MS=45000
TRADEOS_AGENT_DIGEST_LIMIT=5
```

### Feedback Loop

Feedback writes attach labels to stable public targets:

```text
useful
not_useful
too_early
too_late
false_positive
missed_move
confusing_explanation
evidence_too_thin
```

Feedback can later become quality signal and dashboard credit. It must not
unlock raw exports, automation, private forecasts, or execution behavior.

## Data Boundaries

Allowed:

- public intelligence summaries;
- source refs and public proof IDs;
- confidence, freshness, limitations, invalidation;
- structured feedback labels;
- anonymous or app-level feedback identifiers.

Not allowed:

- raw VPIN, forecast, feature, or execution telemetry;
- private portfolio state;
- exchange API credentials;
- hidden dashboard scraping;
- personalized financial advice;
- trade placement or allocation instructions.

## Integration Choices

Use the CLI when you want:

- a fast demo;
- a local research workflow;
- Venice-backed questions over TradeOS evidence.

Use MCP when you want:

- Claude Desktop or Cursor integration;
- agent tool calls;
- feedback tools inside an agent host.

Use the TypeScript SDK when you want:

- a web app backend;
- a bot;
- a worker;
- an agent service in Node.js.

Use the Python SDK when you want:

- notebooks;
- data workflows;
- scheduled analysis;
- Python agent frameworks.
