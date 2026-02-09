import { RouteScanner } from './scanner';
import * as path from 'path';

async function test() {
  const demoPath = path.resolve(process.cwd(), 'apps/demo-web');
  console.log(`🔍 Scanning: ${demoPath}`);
  
  const scanner = new RouteScanner(demoPath);
  const discovered = scanner.scan();
  
  console.log('✅ Discovered Routes:');
  console.log(JSON.stringify(discovered, null, 2));
}

test().catch(console.error);
