# tradeos-public-intel

Python SDK for the TradeOS public Data Intelligence layer.

Requires Python 3.11 or newer.

```bash
pip install tradeos-public-intel
```

```python
import os

from tradeos_public_intel import TradeOSPublicIntelClient

client = TradeOSPublicIntelClient()
digest = client.get_market_digest(limit=10)
attribution = client.get_app_attribution()
snapshot = client.get_token_watchlist_snapshot("VVV", mode="trader", chain="8453")

ack = client.submit_digest_feedback(
    target_type="digest",
    target_id="digest_123",
    label="useful",
    optional_note="Clear evidence and caveats.",
    feedback_source="human",
)
```

Create a saved watchlist when you have a TradeOS account bearer token:

```python
created = client.create_watchlist(
    name="Portfolio risk monitor",
    mode="investor",
    account_token=os.environ["TRADEOS_ACCOUNT_TOKEN"],
)
watchlist_id = created["watchlist"]["watchlist_id"]

client.add_watchlist_item(
    watchlist_id,
    symbol="VVV",
    chain="8453",
    account_token=os.environ["TRADEOS_ACCOUNT_TOKEN"],
)

state = client.get_watchlist_state(
    watchlist_id,
    account_token=os.environ["TRADEOS_ACCOUNT_TOKEN"],
)

client.create_watchlist_notification_channel(
    watchlist_id,
    channel_kind="in_app",
    target="tradeos-dashboard",
    min_severity="watch",
    digest_frequency="realtime",
    account_token=os.environ["TRADEOS_ACCOUNT_TOKEN"],
)

client.trigger_watchlist_deliveries(
    watchlist_id,
    channel_kinds=["in_app"],
    min_severity="watch",
    account_token=os.environ["TRADEOS_ACCOUNT_TOKEN"],
)

delivery_audit = client.list_watchlist_deliveries(
    watchlist_id,
    account_token=os.environ["TRADEOS_ACCOUNT_TOKEN"],
)
```

Create an app key for attribution when you have a TradeOS account bearer token:

```python
created = client.create_app_key(
    app_name="my-public-intel-app",
    account_token=os.environ["TRADEOS_ACCOUNT_TOKEN"],
)
```

Request reviewed public quota or a paid evaluation when a real project needs
more than starter/baseline public usage:

```python
client.submit_quota_request(
    project_name="community-market-bot",
    app_key_id="pubkey_...",
    use_case="Discord bot with source-backed token summaries and feedback buttons.",
    expected_daily_reads=1500,
    expected_symbols_per_day=80,
    monetization_model="paid community seats",
    feedback_plan="Members can label useful, stale, late, wrong, or missing-context answers.",
    paid_intent="Will use x402 for alerts and higher scale.",
    account_token=os.environ["TRADEOS_ACCOUNT_TOKEN"],
)
```

Agentic feedback can be tagged separately:

```python
client.submit_digest_feedback(
    target_type="digest",
    target_id="digest_123",
    label="evidence_too_thin",
    feedback_source="agent",
    automation_level="autonomous",
    agent_id="market-review-agent",
    agent_run_id="run_001",
)
```

Default API base:

```text
https://api.tradeos.tech/v1/public-intel
```

Access model:

```text
Free public kit: bounded reads, token snapshots, and feedback writes
Builder app quota: 7-day starter, useful feedback refresh, or reviewed quota request
Data Intel Credits: dashboard-only depth, 30-day unlock by default
Account token: saved watchlists, events, channels, and user-owned feedback
Paid TradeOS/x402: automation, exports, high-volume alerts, premium data, validation APIs
```

`TRADEOS_PUBLIC_INTEL_KEY` is optional and used only when TradeOS has issued a
public-intel app key for attribution. This SDK can validate attribution, but it
does not perform TradeOS login/device auth.

Learn more:

```text
Homepage: https://tradeos.tech
Public docs: https://tradeos.tech/llms.txt
x402 discovery: https://tradeos.tech/.well-known/x402.json
```
