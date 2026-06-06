# tradeos-public-intel

Python SDK for TradeOS public intelligence.

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

ack = client.submit_digest_feedback(
    target_type="digest",
    target_id="digest_123",
    label="useful",
    optional_note="Clear evidence and caveats.",
    feedback_source="human",
)
```

Create an app key for attribution when you have a TradeOS account bearer token:

```python
created = client.create_app_key(
    app_name="my-public-intel-app",
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
Free public kit: bounded reads and feedback writes
Feedback credits: dashboard-only depth, 30-day unlock by default
Paid TradeOS/x402: automation, exports, alerts, premium data, validation APIs
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
