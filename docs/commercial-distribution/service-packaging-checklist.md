# Service Packaging Checklist

Use this checklist before publishing a TradeOS-backed intelligence service to
Virtuals ACP, AntSeed, x402 directories, Agentic.Market-style discovery, or any
agent marketplace.

## 1. Pick A Narrow First Product

Start with one paid job or endpoint that a buyer understands immediately:

```text
symbol -> evidence -> verdict -> caveats -> next checks
```

Good first products:

- token risk gate;
- token discovery feed;
- market pulse packet;
- VPIN stress check;
- signal evidence packet;
- forecast path context;
- dataset concierge packet.

Avoid broad "AI trading agent" positioning. It invites unclear expectations and
creates higher compliance and safety risk.

## 2. Define The Service Contract

Every listing should have:

| Field | Example |
| --- | --- |
| Service ID | `tradeos-vpin-stress` |
| Display name | `Order-Flow Stress Check` |
| Buyer promise | `Check whether a symbol has active flow stress and what evidence supports the read.` |
| Input schema | `symbol`, `timeframe`, `output`, optional metadata |
| Output schema | `verdict`, `confidence`, `drivers`, `evidence`, `freshness`, `next_checks`, `notices` |
| Price | fixed per response where possible |
| Safety line | read-only research; no execution, custody, copy trading, or personalized financial advice |
| Recheck cadence | when a buyer should call again |

## 3. Keep The Payment Boundary Explicit

Do not double charge a buyer.

```text
ACP-funded job -> internal intelligence runtime -> ACP deliverable
x402 paid call -> x402 gateway -> internal intelligence runtime
AntSeed provider call -> provider runtime -> internal intelligence runtime
```

An ACP-funded job should not call the public x402 paid route again. An x402 paid
call should not require a separate ACP escrow. Keep each channel's settlement
metadata separate even if the same public seller wallet receives funds.

## 4. Keep Secrets Server-Side

Use environment variables or a secret manager for:

- marketplace API keys;
- TradeOS public or paid keys;
- webhook secrets;
- wallet signer private keys;
- facilitator API credentials;
- SMTP and model provider keys.

Never put those values in a browser bundle, public README, marketplace listing,
or support ticket.

## 5. Publish Builder-Friendly Artifacts

Each commercial channel needs slightly different packaging:

| Artifact | Used By |
| --- | --- |
| Agent card | agent marketplaces, crawlers, buyer agents |
| x402 manifest | x402 crawlers and pay-per-call clients |
| OpenAPI document | GPT Actions, API directories, platform review |
| Sample output | marketplaces and buyers evaluating response shape |
| Listing page | human buyers and SEO/crawler context |
| Directory submission bundle | manual marketplace submission |
| Service manifest | ACP-style offering and resource sync |

All artifacts should preserve the safety boundary and link to docs rather than
embedding private configuration.

## 6. Validate Before Publishing

Run a public-safe checklist:

```text
health endpoint returns 200
readiness endpoint shows required secrets configured without printing them
unpaid paid endpoint returns a clear payment challenge
paid endpoint works with a bounded buyer test
sample output is synthetic or public-safe
listing text does not promise returns
logs redact API keys, wallet private keys, payment IDs, and private prompts
support template exists for known platform issues
```

## 7. Listing Copy Template

Use this shape for marketplace copy:

```text
Title: TradeOS <Product Name>
Subtitle: Read-only crypto market intelligence for agents and dashboards.

What it does:
Returns a source-grounded packet with verdict, confidence, drivers, evidence,
freshness, caveats, and next checks for <specific use case>.

Best for:
<three buyer workflows>

Not for:
Execution, custody, copy trading, personalized financial advice, or guaranteed
returns.

Inputs:
<short schema>

Outputs:
<short schema>

Payment:
Fixed price per response. Re-run when market conditions or token evidence
change.
```

## 8. Support Template

When asking a marketplace for support, include only public-safe details:

```text
Platform:
Provider display name:
Provider public wallet or agent ID:
Buyer test agent ID or wallet:
Chain:
Offering or service ID:
Approximate UTC timestamp:
Error text:
Expected behavior:
Public endpoint or manifest URL:
What we already tried:
```

Do not include private keys, API keys, webhook secrets, seed phrases, or private
customer payloads.
