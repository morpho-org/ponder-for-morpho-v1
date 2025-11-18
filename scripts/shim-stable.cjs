#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// Resolve the viem package directory
const viemPkgPath = require.resolve("viem/package.json");
const viemDir = path.dirname(viemPkgPath);

// Paths for source and ESM builds
const chainsDir = path.join(viemDir, "chains");
const definitionsDir = path.join(chainsDir, "definitions");
const esmChainsDir = path.join(viemDir, "_esm", "chains");
const esmDefinitionsDir = path.join(esmChainsDir, "definitions");

// Index entrypoints
const indexTs = path.join(chainsDir, "index.ts");
const esmIndexJs = path.join(esmChainsDir, "index.js");

// Custom chain definition to inject
const chainDefinition = `import { defineChain } from 'viem';

export const stable = defineChain({
  id: 988,
  name: 'Stable',
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:988',
  nativeCurrency: {
    name: 'Tether',
    symbol: 'USDT',
    decimals: 18
  },
  rpcUrls: {
    default: { http: ['https://rpc.stable.xyz'] },
    public: { http: ['https://rpc.stable.xyz'] }
  },
  blockExplorers: {
    default: {
      name: 'Stable Explorer',
      url: 'https://explorer.stable.xyz/'
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0,
    },
  },
});
`;

// Ensure a directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Write the chain definition file
function writeDefinition(dir, filename) {
  ensureDir(dir);
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, chainDefinition, "utf8");
  console.log(`Wrote ${filePath}`);
}

// Patch the index file to export our new chain
function patchIndex(filePath, exportLine) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Index file not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes(exportLine)) return;
  const lines = content.split(/\r?\n/);
  // Find the last export block to insert after
  let insertIndex = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith("export {")) {
      insertIndex = i + 1;
      break;
    }
  }
  lines.splice(insertIndex, 0, exportLine);
  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
  console.log(`Patched ${filePath}`);
}

// Inject our custom chain
writeDefinition(definitionsDir, "stable.js");
writeDefinition(esmDefinitionsDir, "stable.js");

// Add exports to entrypoints
patchIndex(indexTs, `export { stable } from './definitions/stable.js';`);
patchIndex(esmIndexJs, `export { stable } from './definitions/stable.js';`);
