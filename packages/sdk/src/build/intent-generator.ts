import type { DiscoveredRoute } from './scanner';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export type RouteWithIntents = DiscoveredRoute & {
  intents: string[];
  hash: string;
};

export class IntentGenerator {
  private cacheFile: string;
  private cache: Record<string, string[]> = {};

  constructor(cacheDir: string) {
    this.cacheFile = path.join(cacheDir, 'vocalroute-cache.json');
    this.loadCache();
  }

  private loadCache() {
    if (fs.existsSync(this.cacheFile)) {
      try {
        this.cache = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
      } catch {
        this.cache = {};
      }
    }
  }

  private saveCache() {
    fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2));
  }

  private generateHash(route: DiscoveredRoute): string {
    return crypto
      .createHash('md5')
      .update(`${route.path}-${route.title}-${route.params.join(',')}`)
      .digest('hex');
  }

  public async generate(routes: DiscoveredRoute[]): Promise<RouteWithIntents[]> {
    const results: RouteWithIntents[] = [];

    for (const route of routes) {
      const hash = this.generateHash(route);
      let intents = this.cache[hash];

      if (!intents) {
        intents = this.generateStaticIntents(route);
        this.cache[hash] = intents;
      }

      results.push({
        ...route,
        intents,
        hash
      });
    }

    this.saveCache();
    return results;
  }

  private generateStaticIntents(route: DiscoveredRoute): string[] {
    const title = route.title || route.path.split('/').pop() || 'home';
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
    
    // Core verbs: open, go to, show, view
    const verbs = ['open', 'go to', 'show', 'view', 'navigate to'];
    const intents = verbs.map(v => `${v} ${cleanTitle}`);
    
    // Add plain title as intent
    intents.push(cleanTitle);
    
    return intents.slice(0, 5);
  }
}
