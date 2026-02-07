#!/usr/bin/env node
import { RouteScanner } from "./build/scanner";
import { IntentGenerator } from "./build/intent-generator";
import * as path from "path";
import * as fs from "fs";

async function scan() {
  const projectRoot = process.cwd();

  // Parse arguments
  const args = process.argv.slice(3);
  const skipIndex = args.indexOf("--skip");
  const aiFlag = args.includes("--ai");
  let skipSegments: string[] = [];
  if (skipIndex !== -1 && args[skipIndex + 1]) {
    skipSegments = args[skipIndex + 1].split(",").map((s) => s.trim());
  }

  console.log("🚀 [VocalRoute] Scanning project for routes...");
  if (skipSegments.length > 0) {
    console.log(`ℹ️  Skipping segments: ${skipSegments.join(", ")}`);
  }
  if (aiFlag) {
    console.log("🤖 AI Intent Generation enabled.");
  }

  // 1. Discover routes
  const scanner = new RouteScanner(projectRoot, skipSegments);
  const discovered = scanner.scan();

  if (discovered.length === 0) {
    console.warn(
      "⚠️  No routes discovered. Make sure you are running this in the root of your Next.js project.",
    );
    return;
  }

  console.log(`📡 Discovered ${discovered.length} routes.`);

  // 2. Generate intents (and cache)
  const generator = new IntentGenerator(projectRoot);
  const registry = await generator.generate(discovered, {
    openaiApiKey: aiFlag ? process.env.OPENAI_API_KEY : undefined,
  });
  console.log("🤖 Intents generated.");

  // 3. Save registry
  const outDir = path.resolve(projectRoot, "vocalroute");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, "registry.json");
  const tsPath = path.join(outDir, "registry.ts");

  fs.writeFileSync(jsonPath, JSON.stringify(registry, null, 2));
  fs.writeFileSync(
    tsPath,
    `export const staticRegistry = ${JSON.stringify(registry, null, 2)};`,
  );

  console.log(`✅ Registry saved to:`);
  console.log(`   - ${jsonPath}`);
  console.log(`   - ${tsPath}`);
  console.log(
    `\n💡 You can now import this registry in your VocalRouteProvider.`,
  );
}

function printHelp() {
  console.log(`
VocalRoute AI SDK CLI

Usage:
  npx vocalroute scan                Scan routes and generate intent registry
  npx vocalroute scan --ai           Scan and use AI to generate smart intents (requires OPENAI_API_KEY)
  npx vocalroute scan --skip locale  Scan and skip specific segments from registry paths
  npx vocalroute --help              Show this help message

Options:
  --skip <segments>   Comma-separated list of segments to skip in logical paths (e.g. "locale,shopId")
  --ai                Use LLM to generate more natural and diverse intents for each route
`);
}

const command = process.argv[2];

switch (command) {
  case "scan":
    scan().catch((err) => {
      console.error("❌ Error during scan:", err);
      process.exit(1);
    });
    break;
  case "--help":
  case "-h":
  case undefined:
    printHelp();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}
