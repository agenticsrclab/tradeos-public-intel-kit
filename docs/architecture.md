# Architecture

TradeOS public intelligence is a distribution surface for source-backed market
context. In product terms, TradeOS supplies the crypto market Data Intelligence
OS, builders create product demand through workflows and distribution, and
feedback writes return quality signals to TradeOS. The public kit is
intentionally thin: it helps builders consume, summarize, and send feedback on
public evidence without exposing TradeOS private systems or making users pay
TradeOS for inference.

The flagship architecture is a private self-hosted control plane. TradeOS
provides intelligence and feedback targets. The Symbol Cockpit, feasibility
checks, expected-advantage checks, execution adapters, and operations dashboard
run under the self-hosted operator's control.

The product ladder stays the same across the kit and TradeOS:

```text
Use TradeOS free.
Earn Data Intel Credits by improving intelligence quality.
Build products on public intelligence.
Pay when you need private intelligence products, scale, alerts, automation, or data rights.
```

## System Shape

```text
TradeOS Data Intelligence OS
        |
        | source-backed public evidence, stable IDs, caveats, paid-depth paths
        v
Private self-hosted builder app / agent host / CLI / MCP client
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
Private local product surface
        |
        | optional structured feedback
        v
TradeOS Data Intel Credit loop
```

Optional LLM path:

```text
TradeOS public evidence -> user-owned model key -> grounded answer
```

The recommended CLI provider is [Venice AI](https://venice.ai/pricing) through
an OpenAI-compatible endpoint because it fits the self-hosted, BYOK privacy
posture. Users can replace it with another OpenAI-compatible provider by
configuring `OPENAI_BASE_URL`, `OPENAI_API_KEY`, and `TRADEOS_AGENT_MODEL`.

## Flagship Runtime: Symbol Cockpit

The most concrete builder product shape is a private self-hosted Symbol
Cockpit:

```text
symbol -> TradeOS intelligence -> good / bad / ugly -> trade recommendation -> feedback
```

The cockpit can run on the operator's local machine, private server, team
workstation, or agent host. TradeOS is not the local runtime. TradeOS is the
source-grounded intelligence layer the runtime calls.

```text
Private self-hosted cockpit / action agent
        |
        | symbol, chain, horizon, optional app key
        v
TradeOS public-intel API
        |
        | evidence, freshness, caveats, target IDs
        v
Good / Bad / Ugly trade recommendation
        |
        | useful / wrong / late / missed / acted / avoided
        v
Feedback with provenance
```

The cockpit should produce trade/action recommendation cards such as:

- buy candidate if local risk rules pass;
- avoid new long;
- watch for recovery;
- trim or review existing exposure;
- exit candidate;
- bot preflight failed;
- stronger candidate than watchlist peers;
- insufficient evidence.

Those cards are valuable because they turn public intelligence into a consumer
workflow people can act on. The self-hosted runtime can be opinionated while
TradeOS remains the intelligence product layer rather than the broker,
custodian, or hosted execution engine.

Future local modules fit behind the same boundary:

```text
TradeOS evidence -> local recommendation -> non-executable action intent
                 -> local feasibility gate -> local EA/risk gate
                 -> optional local execution adapter
                 -> local operations dashboard and audit log
```

The self-hosted operator owns keys, approvals, sizing, strategy memory, exchange
connectors, and final execution.

The reference implementation follows that split:

```text
apps/symbol-cockpit
  web/API/worker product runtime

packages/cockpit-core
  verdict packet, recommendation card, bot preflight contracts

packages/action-intent
  non-executable action intent schemas and validation

packages/policy-core
  approval, kill-switch, feasibility, account-gate, actionability contracts

packages/tradeos-connectors
  TradeOS public-intel aggregation and Venice/OpenAI-compatible action agent

modules/
  feasibility, ea-risk, execution-gateway, ops-dashboard, notification-router
```

`modules/execution-gateway` is paper-only in this kit. Live adapters should be
added behind the `execution` Compose profile only after a separate security
review.

## Product Roles

| Role | Owned By | Examples |
| --- | --- | --- |
| Intelligence supply | TradeOS | digest inputs, candidates, thesis watchlists, token snapshots, proofs, caveats, freshness, stable IDs |
| Product packaging | Builder | briefings, bots, watchlists, dashboards, widgets, notebooks, validation packs |
| Distribution | Builder | paid community, SaaS, API product, MCP host, agent workflow, newsletter, customer dashboard |
| Feedback and provenance | Builder product plus TradeOS | usefulness labels, missed-move labels, app attribution, source metadata, credit reconciliation |
| Paid depth | TradeOS | premium pulse, alerts, webhooks, automation-safe reads, validation APIs, exports, data rights |

The local kit should make those roles visible. Builders should sell the
workflow around the intelligence, not raw endpoint access.

For the Symbol Cockpit, the workflow is the private deployment itself: the
customer pays for an agent they can run where their keys and strategy already
live.

## Privacy Model

Self-hosting makes the cockpit private by deployment, but TradeOS API calls are
still requests to TradeOS. The runtime should make that boundary visible and
use it as a product feature: sensitive state remains local; intelligence calls
are explicit.

| Mode | Local To Builder/User | Sent To TradeOS |
| --- | --- | --- |
| Public Intel Mode | UI state, optional local notes | symbol, chain, horizon, public query |
| Private Local Mode | portfolio, wallet context, strategy notes, bot rules, logs | generic symbol or market queries only |
| Attributed Feedback Mode | private intelligence context unless user includes it | target ID, label, provenance, optional app/user attribution |
| Paid / Private Intelligence Mode | runtime, secrets, execution keys | authenticated paid request and entitlement scope |

Default rules:

- keep model-provider keys local or server-side;
- keep wallet, exchange, and bot secrets out of TradeOS;
- do not send local strategy notes unless the user explicitly chooses to;
- send feedback only with clear target IDs and provenance;
- separate builder app identity from user identity;
- surface x402 or paid-entitlement requirements instead of hiding them.

## Feature Expansion Model

The public kit is not a bundle of hidden premium features. It is a connector to
TradeOS services.

```text
Local package capability: SDK methods, MCP tools, CLI commands
Service capability: public API, paid API, x402 resources, enterprise endpoints
User/account state: starter quota, scoped DTI credits, paid entitlement
```

More features arrive through one of these paths:

- package updates add new public helpers or tools;
- public API responses expose new public-safe fields;
- human DTI unlocks public dashboard depth, public Ask packs, or read-only Review Lab where TradeOS has enabled it;
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
Linked TradeOS user: enables durable starter quota and DTI credit reconciliation
x402 payment: pays for a specific machine resource
Paid API key or contract entitlement: unlocks premium/enterprise resources
```

The builder app should keep TradeOS paid credentials server-side. End-user
identity should be linked only when the user wants TradeOS-visible benefits such
as DTI credits, starter quota, or bring-your-own paid entitlement.

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

Feedback can later become quality signal, app reputation, quota confidence, or
scoped human DTI credit. Human DTI is not API-convertible and must not unlock
raw exports, automation, private forecasts, paid API scale, or execution
behavior.

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
- guaranteed returns or hidden assumptions;
- TradeOS-hosted custody, exchange keys, or order placement;
- unsupported allocation instructions that are not tied to evidence,
  freshness, user-defined rules, and explicit approvals.

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

## Future Open-Source Services

The kit should evolve toward an open ecosystem without changing TradeOS'
foundational role.

| Phase | Open-Source Surface | TradeOS Role |
| --- | --- | --- |
| 1 | Public kit, Symbol Cockpit, action recipes | public intelligence and feedback product layer |
| 2 | Action intents and bot preflight runtime | non-executable review bridge before user-owned automation |
| 3 | Feasibility and EA components | benchmark intelligence, validation, outcomes, paid depth |
| 4 | Optional execution adapters | intelligence and validation layer, not custodian or broker |

Execution adapters, when they exist, should remain optional and user-owned.
They need separate security review and must not be implied by public-intel
reads.
