# Commercial Distribution Field Guides

These guides show how a builder can package TradeOS intelligence into paid
agent-economy distribution channels without copying TradeOS private keys,
wallets, live agent IDs, or internal host details.

They are based on the TradeOS field setup reviewed on June 7, 2026:

- a read-only crypto intelligence runtime;
- an AntSeed-facing OpenAI-compatible provider service;
- an x402 pay-per-call gateway;
- a Virtuals ACP adapter and seller bridge;
- generated marketplace submission bundles for x402 directories and agent-skill
  marketplaces.

Use them as field guides, not permanent protocol documentation. Agent platforms
move quickly. Re-check the official docs, dashboards, Discord support notes, and
API responses before a production launch.

## What Builders Can Sell

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

## Platform Fit

| Platform | Best Fit | Settlement Shape | TradeOS Pattern |
| --- | --- | --- | --- |
| [Virtuals ACP](virtuals-acp-field-guide.md) | Agent-to-agent jobs, funded tasks, deliverables | ACP escrow/job lifecycle | Provider bridge receives funded jobs and returns TradeOS JSON deliverables. |
| [AntSeed](antseed-field-guide.md) | AI Agent or OpenAI-compatible provider service | Provider pricing and USDC settlement | AntSeed calls a TradeOS read-only agent runtime. |
| [x402 / Agentic.Market](x402-agentic-market-field-guide.md) | HTTP pay-per-call APIs and discoverable paid resources | HTTP 402, exact payment, facilitator verification | x402 gateway protects fixed-price intelligence endpoints. |

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

Start with x402 when the product is a simple paid HTTP endpoint. Use Virtuals
ACP when a buyer agent needs to hire the service as a job with escrow and a
deliverable. Use AntSeed when the product should appear as an AI Agent or
OpenAI-compatible provider.
