# TradeOS Local Notification Router

Routes recommendation cards to local channels while preserving `card_id`,
`target_id`, and feedback targets.

Supported channel kinds in this kit:

- `stdout`
- `webhook`
- `email`

The email channel uses the same shared SMTP environment names as the broader
TradeOS stack:

- `COCKPIT_ALERT_EMAIL_ENABLED=true`
- `COCKPIT_ALERT_EMAIL_TO`, falling back to `ALERT_EMAIL_TO`
- `COCKPIT_FEEDBACK_BASE_URL` for prefilled feedback links
- `COCKPIT_SMTP_HOST`, `COCKPIT_SMTP_PORT`, `COCKPIT_SMTP_USER`,
  `COCKPIT_SMTP_PASSWORD`, `COCKPIT_SMTP_FROM`
- the same `SMTP_*` names as fallbacks

Email notifications render both HTML and plain text. They include the
recommendation, confidence, price snapshot when supplied by evidence, target
price when supplied by evidence, driver groups, evidence refs, next steps, and
feedback links.

Telegram, Discord, and push channels can be added without changing the
recommendation card contract.
