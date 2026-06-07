import { readFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createRuntime, type SymbolCockpitRuntime } from "../runtime.js";

export interface ApiServerOptions {
  runtime?: SymbolCockpitRuntime;
  host?: string;
  port?: number;
  serveWeb?: boolean;
}

const WEB_ROOT = process.env.COCKPIT_WEB_ROOT ?? join(process.cwd(), "src", "web");

export function createApiServer(options: ApiServerOptions = {}) {
  const runtime = options.runtime ?? createRuntime();
  return createServer(async (req, res) => {
    try {
      setCommonHeaders(res);
      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }
      const url = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET" && url.pathname === "/healthz") {
        sendJson(res, 200, runtime.health());
        return;
      }
      if (url.pathname.startsWith("/api/")) {
        await routeApi(runtime, req, res, url);
        return;
      }
      if (options.serveWeb ?? true) {
        await serveStatic(res, url.pathname);
        return;
      }
      sendJson(res, 404, { error: "not_found" });
    } catch (error: unknown) {
      sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  });
}

async function routeApi(runtime: SymbolCockpitRuntime, req: IncomingMessage, res: ServerResponse, url: URL) {
  if (req.method === "GET" && url.pathname === "/api/privacy-modes") {
    sendJson(res, 200, runtime.privacyModes());
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/recommendations") {
    sendJson(res, 200, { schema_version: "tradeos.symbol_cockpit.recommendations.v1", cards: runtime.store.cards() });
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/ops") {
    sendJson(res, 200, runtime.opsSnapshot());
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/cockpit") {
    sendJson(res, 200, await runtime.reviewSymbol((await readJson(req)) as { symbol: string }));
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/preflight") {
    sendJson(res, 200, await runtime.preflight((await readJson(req)) as { symbol: string; proposed_action: string }));
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/action-agent") {
    sendJson(res, 200, await runtime.askActionAgent((await readJson(req)) as { question: string; symbol?: string }));
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/feedback") {
    sendJson(res, 200, await runtime.submitFeedback((await readJson(req)) as { target_id: string; label: string; note?: string }));
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/paper-orders") {
    sendJson(
      res,
      200,
      runtime.requestPaperExecution((await readJson(req)) as { target_id: string; side?: string; notional_usd?: number; approved?: boolean }),
    );
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/kill-switch/activate") {
    const body = (await readJson(req)) as { reason?: string };
    sendJson(res, 200, runtime.activateKillSwitch(body.reason));
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/kill-switch/deactivate") {
    const body = (await readJson(req)) as { reason?: string };
    sendJson(res, 200, runtime.deactivateKillSwitch(body.reason));
    return;
  }
  sendJson(res, 404, { error: "not_found" });
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf-8");
  return raw ? JSON.parse(raw) : {};
}

async function serveStatic(res: ServerResponse, pathname: string): Promise<void> {
  const resolvedPath = pathname === "/feedback" ? "/feedback.html" : pathname;
  const safePath = normalize(resolvedPath === "/" ? "/index.html" : resolvedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(WEB_ROOT, safePath);
  try {
    const body = await readFile(filePath);
    res.writeHead(200, { "content-type": contentType(filePath) });
    res.end(body);
  } catch {
    const indexPath = join(WEB_ROOT, "index.html");
    const body = await readFile(indexPath);
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(body);
  }
}

function contentType(pathname: string): string {
  switch (extname(pathname)) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "text/html; charset=utf-8";
  }
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}

function setCommonHeaders(res: ServerResponse): void {
  res.setHeader("access-control-allow-origin", "http://127.0.0.1:18101");
  res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
}

export function defaultListenOptions() {
  return {
    host: process.env.COCKPIT_BIND_HOST ?? "127.0.0.1",
    port: Number(process.env.COCKPIT_API_PORT ?? 18100),
  };
}

export function moduleDirname(metaUrl: string): string {
  return fileURLToPath(new URL(".", metaUrl));
}
