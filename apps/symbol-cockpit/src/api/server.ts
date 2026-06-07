import { createApiServer, defaultListenOptions } from "./http.js";

const { host, port } = defaultListenOptions();
const server = createApiServer({ host, port, serveWeb: true });

server.listen(port, host, () => {
  console.log(`TradeOS Symbol Cockpit API listening on http://${host}:${port}`);
});

