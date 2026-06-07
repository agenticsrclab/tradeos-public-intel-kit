# TradeOS Action Intent

`@tradeos/action-intent` defines the non-executable bridge between a TradeOS
Symbol Cockpit recommendation and any local operator workflow.

An action intent is not an order, transaction, route, broker ticket, or wallet
request. It carries evidence-backed action context and requires the self-hosted
operator to choose venue, account, size, order type, timing, approval, custody,
and executor before anything can become executable.

Live executors are outside the public kit. Independent executors that consume
this schema own their own customer relationship, approvals, compliance,
licensing, custody, routing, execution, and liability.
