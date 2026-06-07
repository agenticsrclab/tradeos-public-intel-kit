# Access And Payments

This kit follows the same TradeOS access pattern used by the public dashboard:
free public intelligence for discovery, Data Intel Credits for temporary
dashboard depth, and paid TradeOS products for private intelligence products,
automation, exports, premium data, and machine-paid access.

That access pattern is the commercial boundary of the crypto market Data
Intelligence OS: public intelligence makes builder products easy to try,
feedback improves intelligence quality, and paid TradeOS/x402/enterprise access
unlocks production depth, scale, automation, and data rights.

The simple version:

```text
Use TradeOS free.
Earn Data Intel Credits by improving intelligence quality.
Build products on public intelligence.
Pay when you need private intelligence products, scale, alerts, automation, or data rights.
```

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

Keyless public reads do not create a durable paid-style entitlement that expires
after a set number of days. Verified builder app keys do have a starter window:
after 7 days they fall back to baseline quota unless useful feedback refreshes
the app, TradeOS approves a quota request, or the builder pays for scale.

## Expiry Summary

| Feature | Free / Credit Behavior | Expiry |
| --- | --- | --- |
| Public-intel reads | Bounded public evidence for discovery and prototypes | No credit-style expiry; server limits may apply |
| Public-intel app starter | Starter public API quota for a verified builder key | 7 days from key creation |
| Earned public API quota | Starter-level public quota refreshed by useful attributed feedback | Recomputed from recent feedback and app reputation |
| Reviewed project quota | Higher public API quota after operator approval | Bound to app reputation and manual review |
| Feedback writes | Free structured feedback into TradeOS quality loop | No credit-style expiry for the write itself |
| Anonymous ask | 3 public-intelligence questions | No durable entitlement; bound to anonymous/session quota |
| Signed-in starter ask | 10 public-intelligence questions | 7 days from first activation |
| DTI question pack | 5 extra public-intelligence questions | Earned with Data Intel Credits |
| DTI dashboard depth | Temporary deeper dashboard access earned through useful feedback | 7 days by default |
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
| DTI credit linking | user TradeOS account or linked identity | sign-in/link token when available | required for durable user DTI credits; anonymous feedback still helps quality |
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

## Public API Quota Lifecycle

TradeOS public API quota is useful enough for demos and early products, but it is
not a free bulk feed.

| Profile | Reads/min | Reads/hour | Reads/day | Symbols/day | How to get it |
| --- | ---: | ---: | ---: | ---: | --- |
| Anonymous preview | 2 | 10 | 20 | 3 | no key, keyless trial |
| Builder baseline | 5 | 50 | 100 | 10 | app key after starter expiry |
| Builder starter | 10 | 100 | 250 | 20 | verified app key for 7 days |
| Builder earned | 10 | 100 | 250 | 20 | at least 5 useful feedback events in 7 days with low suppression |
| Reviewed project | 20 | 200 | 500 | 40 | approved quota request |
| Limited app | 5 | 50 | 100 | 10 | reputation or operator action |

Default feedback/write limits are also bounded: app-key writes are 10/minute and
100/day; anonymous writes are 5/minute per IP.

To ask for more public quota before buying, submit a project request from a
verified TradeOS account:

```text
POST https://api.tradeos.tech/v1/public-intel/quota-requests
```

Include the project name, app key, use case, expected daily reads, expected
symbols per day, monetization model, feedback plan, and paid intent. Approval is
manual. TradeOS may approve reviewed-project quota, keep the app at baseline,
limit abusive usage, or move the project to x402/paid entitlement.

Do not put TradeOS paid keys or model-provider keys in browser code. Keep
builder credentials on the server side. If a user brings their own entitlement,
make that an explicit power-user flow.

Identity rules:

```text
No user identity: feedback can improve quality, but cannot earn durable user credit.
Anonymous session ID: feedback can be grouped for local UX and possible later reconciliation.
Linked TradeOS user: feedback can be reconciled to starter quota and DTI credits.
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
TradeOS reconciles quality signal, DTI credits, and account/session state
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
| Earned app quota | starter-level public API depth | feedback writes include stable target IDs, app attribution, and honest provenance |
| Data Intel Credits | temporary dashboard-only depth | feedback writes include stable target IDs and optional user/session IDs |
| x402 payment | paid machine resource for bots/agents/backends | paid resource returns explicit payment/entitlement behavior |
| Paid API key / contract | premium data, scale, exports, alerts, support | builder configures credentials and paid endpoint access |

DTI credits do not unlock x402, exports, bot automation, execution, private
intelligence products, or raw premium data. They only unlock dashboard-style
depth where TradeOS has enabled that credit policy.

More detail on key issuance and feedback provenance:
[API Keys And Feedback Provenance](api-keys-and-feedback-provenance.md).

## Starter Question Quota

Ask-style products should mirror the current TradeOS starter quota:

| User State | Starter Access | Expiry |
| --- | --- | --- |
| Anonymous visitor | 3 public-intelligence questions | Session or anonymous quota boundary |
| Signed-in starter user | 10 public-intelligence questions | 7 days from first quota activation |
| DTI question pack | 5 extra public-intelligence questions | Earned with Data Intel Credits |

Starter questions are for public-intelligence Q&A only. They do not unlock
portfolio context, execution, custody, raw exports, alert delivery, x402/API
access, Reppo packaging, private forecasts, or personalized financial advice.

The CLI uses bring-your-own-key inference, so local `tradeos-intel ask` usage is
bounded by the user's LLM provider key and by the TradeOS public-intel API
limits. Product builders who add their own hosted ask surface should apply the
starter quota above.

## Data Intel Credits

Data Intel Credits reward users for improving intelligence quality. They are
account-based app credits, not transferable assets, and they are separate from
starter question quota.

Current TradeOS pattern:

```text
New signed-in account: 6 welcome DTI credits
Eligible unique feedback: 3 DTI credits after quality checks
Light dashboard unlocks: 3 DTI credits for 7 days
Deeper review/preview unlocks: 6 DTI credits for 7 days
Ask question pack: 6 DTI credits for 5 extra public-intelligence questions
Feedback-earned depth unlock: 7 days by default
Expired unlock: fall back to free public limits
```

Free public access, starter access, and feedback-earned depth are best-effort
promotional access. They have no SLA, no guaranteed availability, no cash value,
and may be rate-limited, changed, paused, degraded, or revoked to protect
TradeOS infrastructure. Paid/x402/contract access is reserved for reliable
production scale.

DTI credits may unlock dashboard-only depth:

```text
longer public history windows
deeper public evidence cards
more saved symbols
more public dashboard refreshes
limited paid-preview cards
```

DTI credits must not unlock:

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
