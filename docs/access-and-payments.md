# Access And Payments

This kit follows the same TradeOS access pattern used by the public dashboard:
free public intelligence for discovery, feedback credits for temporary dashboard
depth, and paid TradeOS products for automation, exports, premium data, and
machine-paid access.

## Free Public Usage

The public kit is free to try for bounded public-intelligence reads and
structured feedback writes:

```text
GET /digest-inputs
GET /candidates
GET /thesis-watchlist
GET /proofs/{public_claim_id}
POST /conversions
POST /claim-outcomes
POST /thesis-outcomes
```

Free public reads are meant for discovery, prototypes, lightweight apps,
examples, and user-facing products that package public evidence. They are not a
replacement for paid bulk feeds, exports, private forecasts, webhooks, or
automation-safe APIs.

Server-side rate limits and abuse controls may still apply. When a consumer
needs more volume or premium surfaces, move them to the paid TradeOS path
instead of trying to stretch the public kit.

Free public API reads do not create a durable paid-style entitlement that
expires after a set number of days. The time-boxed parts of the model are the
starter ask quota and feedback-credit depth unlocks.

## Expiry Summary

| Feature | Free / Credit Behavior | Expiry |
| --- | --- | --- |
| Public-intel reads | Bounded public evidence for discovery and prototypes | No credit-style expiry; server limits may apply |
| Feedback writes | Free structured feedback into TradeOS quality loop | No credit-style expiry for the write itself |
| Anonymous ask | 3 public-intelligence questions | No durable entitlement; bound to anonymous/session quota |
| Signed-in starter ask | 20 public-intelligence questions | 7 days from first activation |
| Feedback dashboard depth | Temporary deeper dashboard access earned through useful feedback | 30 days by default |
| Paid/x402 resources | Premium machine access after explicit payment/entitlement | Bound to paid listing or contract terms |

## Account And API Key Model

The public kit should have a no-account first run. A builder can install the
SDK, CLI, or MCP server and read bounded public intelligence without asking
TradeOS for a key.

Account and credential needs appear only when the builder or user wants
identity, credit reconciliation, higher-trust production usage, or paid
resources.

| Mode | Account Requirement | Credential | Notes |
| --- | --- | --- | --- |
| No-account public trial | none | none | lowest-friction public reads and feedback writes |
| Optional builder registration | builder TradeOS account | `TRADEOS_PUBLIC_INTEL_KEY` | app attribution, abuse controls, support, potential higher public limits |
| User credit linking | user TradeOS account or linked identity | sign-in/link token when available | required for durable user credits; anonymous feedback still helps quality |
| x402 paid machine access | payer needs wallet/payment flow | x402 payment | good for bots, agents, and backends buying a paid resource |
| Paid API/enterprise | builder or customer account/contract | paid API key or entitlement | scale, premium data, exports, alerts, validation, support |

The public kit does not perform TradeOS login locally. Builder app keys are
created from the TradeOS Developer Keys dashboard after sign-in and email
verification. TradeOS also exposes app-key management at
`/v1/public-intel/api-keys` for trusted automation. SDKs and CLI can
create/list/rotate/revoke app keys with `TRADEOS_ACCOUNT_TOKEN`; SDKs, MCP, and
CLI can use `TRADEOS_PUBLIC_INTEL_KEY` after one is issued.

Existing public-intel app-key secrets are not retrievable. Create or rotate a
key, copy the one-time secret, and store it server-side.

App-key issuance and write paths are guarded by email verification, active-key
limits, creation velocity limits, per-key write limits, anonymous write limits,
and suspended/revoked key rejection. See
[Distribution Setup Guide](distribution-setup-guide.md).

Do not put TradeOS paid keys or model-provider keys in browser code. Keep
builder credentials on the server side. If a user brings their own entitlement,
make that an explicit power-user flow.

Identity rules:

```text
No user identity: feedback can improve quality, but cannot earn durable user credit.
Anonymous session ID: feedback can be grouped for local UX and possible later reconciliation.
Linked TradeOS user: feedback can be reconciled to starter quota and dashboard credits.
Builder API key: identifies the app, not the end user's paid entitlement.
Paid/x402 credential: unlocks paid machine resources under explicit payment or entitlement.
```

## How More Features Unlock

The kit is a connector layer. It does not contain hidden paid datasets or switch
on premium behavior locally. More features arrive through TradeOS service
responses, package updates, credit reconciliation, x402 payment, or paid
entitlements.

```text
Free package installed
        |
        v
Public reads and feedback writes
        |
        v
Users create feedback against stable target IDs
        |
        v
TradeOS reconciles quality signal, credits, and account/session state
        |
        +--> dashboard-only credit depth for eligible users
        |
        +--> paid/x402/enterprise upgrade when the app needs premium features
                |
                v
        same builder product exposes the additional TradeOS-backed feature
```

Feature unlock paths:

| Path | Unlocks | What The Kit Does |
| --- | --- | --- |
| Public API | bounded public intelligence | SDK/MCP/CLI call public endpoints |
| Package update | new public helper, MCP tool, or CLI command | builder upgrades the package version |
| Feedback credits | temporary dashboard-only depth | feedback writes include stable target IDs and optional user/session IDs |
| x402 payment | paid machine resource for bots/agents/backends | paid resource returns explicit payment/entitlement behavior |
| Paid API key / contract | premium data, scale, exports, alerts, support | builder configures credentials and paid endpoint access |

Credits do not unlock x402, exports, bot automation, execution, private
forecasts, or raw premium data. They only unlock dashboard-style depth where
TradeOS has enabled that credit policy.

More detail on key issuance and feedback provenance:
[API Keys And Feedback Provenance](api-keys-and-feedback-provenance.md).

## Starter Question Quota

Ask-style products should mirror the current TradeOS starter quota:

| User State | Starter Access | Expiry |
| --- | --- | --- |
| Anonymous visitor | 3 public-intelligence questions | Session or anonymous quota boundary |
| Signed-in starter user | 20 public-intelligence questions | 7 days from first quota activation |

Starter questions are for public-intelligence Q&A only. They do not unlock
portfolio context, execution, custody, raw exports, alert delivery, x402/API
access, Reppo packaging, private forecasts, or personalized financial advice.

The CLI uses bring-your-own-key inference, so local `tradeos-intel ask` usage is
bounded by the user's LLM provider key and by the TradeOS public-intel API
limits. Product builders who add their own hosted ask surface should apply the
starter quota above.

## Feedback Credits

Feedback credits reward users for improving intelligence quality. They are
separate from starter question quota.

Current TradeOS pattern:

```text
New signed-in account: 6 dashboard welcome credits
Feedback-earned depth unlock: 30 days by default
Expired unlock: fall back to free public limits
```

Credits may unlock dashboard-only depth:

```text
longer public history windows
deeper public evidence cards
more saved symbols
more public dashboard refreshes
limited paid-preview cards
```

Credits must not unlock:

```text
x402 paid API calls
bulk exports
raw premium data
webhooks
bot automation
execution behavior
exchange connectivity
custody
personalized financial advice
private forecasts
enterprise datasets
```

## Paid Access With x402

The public kit does not collect payment, custody funds, or sponsor inference.
It gives builders the free public integration surface and records feedback.

TradeOS paid machine access is exposed through x402 resources on the TradeOS
site. Bots, agents, and API consumers can discover paid resources and receive a
`402 Payment Required` response when a paid resource requires payment.

Public x402 discovery surfaces:

```text
https://tradeos.tech/.well-known/x402.json
https://tradeos.tech/x402
https://tradeos.tech/x402/v1/listings
https://tradeos.tech/x402/v1/samples
https://tradeos.tech/x402/v1/openapi.json
https://tradeos.tech/x402/v1/marketplace-listing-pack.json
```

Use x402 for paid machine-to-machine resources such as premium market pulse,
automation-safe reads, validation APIs, and paid API/team listings. Use the
normal TradeOS paid product path for retail users, prepaid credits, dashboards,
enterprise plans, and account-managed contracts.

The free public-intel base URL remains:

```text
https://api.tradeos.tech/v1/public-intel
```

Paid resources are intentionally separate so public examples stay easy to try
and paid resources keep explicit entitlement and payment boundaries.

## Learn More

```text
Homepage: https://tradeos.tech
Public machine-readable docs: https://tradeos.tech/llms.txt
x402 discovery: https://tradeos.tech/.well-known/x402.json
x402 listings: https://tradeos.tech/x402/v1/listings
```
