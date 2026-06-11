#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJsonPath = join(packageRoot, "package.json");
const serverJsonPath = join(packageRoot, "server.json");

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const serverJson = JSON.parse(readFileSync(serverJsonPath, "utf8"));
const [npmPackage] = Array.isArray(serverJson.packages) ? serverJson.packages : [];

const errors = [];

function expect(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

expect(packageJson.mcpName === serverJson.name, "package.json mcpName must match server.json name");
expect(npmPackage?.registryType === "npm", "server.json must declare an npm package");
expect(npmPackage?.identifier === packageJson.name, "server.json package identifier must match package name");
expect(npmPackage?.version === packageJson.version, "server.json package version must match package version");
expect(serverJson.version === packageJson.version, "server.json version must match package version");
expect(npmPackage?.transport?.type === "stdio", "official registry entry must publish the local stdio package first");
expect(
  String(serverJson.repository?.url ?? "").includes("agenticsrclab/tradeos-public-intel-kit"),
  "server.json repository must point at the public kit repo",
);
expect(
  serverJson.name === "io.github.agenticsrclab/tradeos-public-intel-mcp",
  "server.json name must stay in the authorized agenticsrclab GitHub namespace",
);

if (errors.length > 0) {
  console.error("MCP registry metadata check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`MCP registry metadata OK: ${serverJson.name}@${serverJson.version}`);
