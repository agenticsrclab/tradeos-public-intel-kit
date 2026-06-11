# Earn as a Builder: Commercial Distribution Field Guides

These guides show how a builder can earn on top of TradeOS by packaging TradeOS
intelligence into paid services, workflows, agents, vertical apps, and
agent-economy distribution channels without copying TradeOS private keys,
wallets, live agent IDs, or internal host details.

They are based on the TradeOS field setup reviewed on June 7, 2026:

- a read-only crypto intelligence runtime;
- an AntSeed-facing OpenAI-compatible provider service;
- an x402 pay-per-call gateway;
- a Virtuals ACP adapter and seller bridge;
- generated marketplace submission bundles for x402 directories and agent-skill
  marketplaces.

Live proof is now part of the builder pitch.
[Platform Pulse](https://tradeos.tech/market) shows feedback-loop activity,
x402 challenge demand, source attribution by human/API/agent/automation, and
settlement health. Use it to show that buyers and crawlers are discovering paid
intelligence, but keep the language precise: unpaid `402 Payment Required`
challenges are demand signals, not seller-wallet revenue.

Use them as field guides, not permanent protocol documentation. Agent platforms
move quickly. Re-check the official docs, dashboards, Discord support notes, and
API responses before a production launch.

## How Builders Earn

TradeOS works best as the intelligence layer under concrete paid services.
The examples below are starter product shapes, not the full menu. Builders can
package any source-grounded intelligence service, workflow, vertical app, or
agent deliverable they can explain, price, support, and operate inside the
TradeOS safety and data-rights boundaries.

Good builder products may include:

- single-call intelligence checks;
- recurring market or watchlist workflows;
- private dashboard refreshes;
- research concierge services;
- alerting and monitoring services;
- vertical intelligence apps for funds, creators, communities, real estate,
  supply-chain, compliance, or other domains;
- agent skills that combine TradeOS evidence with the builder's own domain
  logic, customer context, or workflow automation.

The first publishable service should still be narrow, testable, and easy for a
buyer to understand. Expand from there as demand and operating capacity become
clear.

## Builder Flywheel

The commercial flywheel should be simple enough for builders to repeat:

```text
TradeOS evidence
  -> builder packages a paid service, workflow, agent, dashboard, or vertical app
  -> customers use the builder product
  -> feedback, outcomes, and provenance flow back through stable TradeOS IDs
  -> TradeOS improves source coverage, ranking, caveats, and confidence
  -> the builder product becomes more useful and differentiated
  -> successful workflows upgrade to paid TradeOS, x402, or enterprise access
```

The builder owns packaging, support, customer workflow, and distribution.
TradeOS owns the intelligence layer, feedback targets, paid depth, and data
rights boundary.

Starter examples:

| Product | Good First Channel | Why It Works |
| --- | --- | --- |
| Symbol risk dossier | x402 or ACP | Fixed input/output, clear pay-per-read value. |
| Market pulse packet | x402, AntSeed, ACP | Broad utility for bots, dashboards, and communities. |
| VPIN shock or flow-stress check | x402 or ACP | Low-price, high-frequency preflight check. |
| Watchlist intelligence brief | AntSeed or ACP | Easy to package as an agent task. |
| Token due-diligence packet | ACP or AntSeed | Higher-context deliverable with evidence and caveats. |
| Dataset concierge packet | ACP or enterprise lead-gen | Good for qualifying larger data buyers. |

Keep public listings focused on source-grounded intelligence products. Do not
market TradeOS as a broker, custodian, managed account service, copy-trading
service, or execution router.

## TradeOS SKU Layers Builders Can Package

The starter examples above should map back to the current TradeOS product
ladder:

| TradeOS Layer | What Builders Can Package | Upgrade Boundary |
| --- | --- | --- |
| Public intelligence products | free market context widgets, digest briefings, Token Radar summaries, Fusion Signal Lite explanations, watchlist/dossier workflows, and Ask TradeOS experiences | bounded public reads and feedback writes; no execution, custody, private context, alerts, exports, or bulk scale |
| DTI credit unlock SKUs | user-facing education around refresh boost, symbol pack, history window, evidence depth, Token Discovery detail, Fusion detail, Review Lab passes, and AskTradeOS question packs | human DTI unlocks temporary public GUI depth only; builder app reputation DTI is quota confidence, not personal credit or paid capacity |
| Private intelligence passes | routing users to `private_30m`, `private_1h`, or `private_4h` when they need broader private dashboard context | exact x402 pay-per-view read access; no admin actions, execution, custody, exports, API resale, or silent renewal |
| Agent/API/x402 data SKUs | paid router, Venice raw inference, Venice intel router, token-risk, discovery, risk-gated discovery, signal-quality, evidence-pack, fusion-history, Market Pulse Pro/team, VPIN-stress, and dataset-scope products | paid or reviewed production access through x402, paid API, grant, or entitlement |

If a product depends on alert delivery, automation, private context, validation
APIs, exports, replay datasets, or machine-scale reads, route it to paid
TradeOS/x402 or enterprise access instead of stretching public quota or DTI.

## Platform Fit

| Platform | Best Fit | Settlement Shape | TradeOS Pattern |
| --- | --- | --- | --- |
| [Virtuals ACP](virtuals-acp-field-guide.md) | Agent-to-agent jobs, funded tasks, deliverables | ACP escrow/job lifecycle | Provider bridge receives funded jobs and returns TradeOS JSON deliverables. |
| [AntSeed](antseed-field-guide.md) | AI Agent or OpenAI-compatible provider service | Provider pricing and USDC settlement | AntSeed calls a TradeOS read-only agent runtime. |
| [x402 / Agentic.Market](x402-agentic-market-field-guide.md) | HTTP pay-per-call APIs and discoverable paid resources | HTTP 402, exact payment, facilitator verification | x402 gateway protects fixed-price intelligence endpoints. |
| [Official MCP Registry](mcp-registry-field-guide.md) | Agent-host discovery for local MCP tools | Metadata registry; paid access remains x402/API entitlement | Public MCP package exposes bounded reads and feedback, then points premium workflows to paid TradeOS boundaries. |

## Shared Architecture

The reusable service layout is:

```text
Builder app, buyer agent, or marketplace
        |
        v
Distribution adapter
        |
        v
TradeOS public or paid intelligence runtime
        |
        v
Read-only intelligence deliverable
```

For a private self-hosted product, the same intelligence can sit behind Symbol
Cockpit. For a marketplace product, the distribution adapter owns payment,
listing, and platform-specific job lifecycle.

## Safe Public Boundary

Public docs may include:

- sanitized env var names;
- example service IDs;
- redacted wallet and agent ID examples;
- local port topology;
- dry-run commands;
- manifest/export commands;
- known failure symptoms and support-request templates.

Public docs must not include:

- private keys or seed phrases;
- live wallet private keys or signer private keys;
- API keys, builder codes, or webhook secrets;
- internal account tokens;
- exact live customer payloads;
- Discord screenshots or private support transcripts;
- deploy hostnames that are not intended to be public.

## Recommended Reading Order

1. [Service Packaging Checklist](service-packaging-checklist.md)
2. [x402 / Agentic.Market Field Guide](x402-agentic-market-field-guide.md)
3. [Virtuals ACP Field Guide](virtuals-acp-field-guide.md)
4. [AntSeed Field Guide](antseed-field-guide.md)
5. [Official MCP Registry Field Guide](mcp-registry-field-guide.md)

Start with x402 when the product is a simple paid HTTP endpoint. Use Virtuals
ACP when a buyer agent needs to hire the service as a job with escrow and a
deliverable. Use AntSeed when the product should appear as an AI Agent or
OpenAI-compatible provider. Use the Official MCP Registry when the goal is
agent-host discovery of a local MCP adapter, not marketplace payment.
