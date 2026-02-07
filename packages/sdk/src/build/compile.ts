import { RouteScanner } from './scanner';
import { IntentGenerator } from './intent-generator';
import * as path from 'path';
import * as fs from 'fs';

async function compile() {
    // 1. Identify project root
    const projectRoot = process.cwd();
    const demoPath = path.resolve(projectRoot, 'apps/demo-web'); // For demo purposes
    
    console.log('🚀 Starting VocalRoute compilation...');

    // 2. Discover routes
    const scanner = new RouteScanner(demoPath);
    const discovered = scanner.scan();
    console.log(`📡 Discovered ${discovered.length} routes.`);

    // 3. Generate intents (and cache)
    const generator = new IntentGenerator(projectRoot);
    const registry = await generator.generate(discovered);
    console.log('🤖 Intents generated.');

    // 4. Save registry
    const outDir = path.resolve(projectRoot, 'packages/sdk/src/generated');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    
    fs.writeFileSync(
        path.join(outDir, 'registry.json'),
        JSON.stringify(registry, null, 2)
    );
    
    // Also save as a JS file for easy import
    fs.writeFileSync(
        path.join(outDir, 'registry.ts'),
        `export const staticRegistry = ${JSON.stringify(registry, null, 2)};`
    );

    console.log(`✅ Registry saved to ${outDir}`);
}

compile().catch(console.error);
