#!/usr/bin/env node
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = resolve(appRoot, "..", "..");
const candidates = [
  process.env.SOURCE_UI_STANDARD_PATH,
  resolve(repoRoot, "..", "source-int-network-standard"),
  resolve(appRoot, "..", "..", "..", "source-int-network-standard"),
  resolve(process.cwd(), "..", "source-int-network-standard"),
].filter(Boolean);

const standardRoot = await findStandardRoot(candidates);

if (!standardRoot) {
  console.error("Source UI standard root not found.");
  console.error("Set SOURCE_UI_STANDARD_PATH to the source-int-network-standard checkout.");
  process.exit(1);
}

const conformanceCli = join(standardRoot, "conformance", "source-ui-conformance.mjs");
const sourceCss = join(standardRoot, "packages", "source-ui", "src", "source-ui.css");

const child = spawn(
  process.execPath,
  [
    conformanceCli,
    "check",
    "--manifest",
    "conformance/vertical-manifest.json",
    "--report",
    "conformance/ux-conformance.json",
    "--passport",
    "conformance/provider-passport-ux.json",
    "--css",
    sourceCss,
  ],
  { cwd: appRoot, stdio: "inherit" },
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});

async function findStandardRoot(paths) {
  for (const candidate of paths) {
    const root = resolve(candidate);
    try {
      await access(join(root, "conformance", "source-ui-conformance.mjs"));
      await access(join(root, "packages", "source-ui", "src", "source-ui.css"));
      return root;
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}
