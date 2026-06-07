import { createApiServer } from "./http.js";

const host = process.env.COCKPIT_BIND_HOST ?? "127.0.0.1";
const port = Number(process.env.COCKPIT_WEB_PORT ?? 18101);
const server = createApiServer({ host, port, serveWeb: true });

server.listen(port, host, () => {
  console.log(`TradeOS Symbol Cockpit web listening on http://${host}:${port}`);
});

