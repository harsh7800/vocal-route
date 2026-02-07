import * as fs from 'fs';
import * as path from 'path';

export type DiscoveredRoute = {
  path: string;
  routerType: 'app' | 'pages';
  params: string[];
  title?: string;
  confidence: number;
};

export class RouteScanner {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  public scan(): DiscoveredRoute[] {
    const routes: DiscoveredRoute[] = [];
    
    // Scan App Router
    const appDir = path.join(this.rootDir, 'app');
    if (fs.existsSync(appDir)) {
      this.scanAppRouter(appDir, '', routes);
    }

    // Scan Pages Router
    const pagesDir = path.join(this.rootDir, 'pages');
    if (fs.existsSync(pagesDir)) {
      this.scanPagesRouter(pagesDir, '', routes);
    }

    return routes;
  }

  private scanAppRouter(dir: string, baseRoute: string, routes: DiscoveredRoute[]) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
         // Skip Route Groups (folders inside parentheses) - they don't affect the URL path
         if (item.startsWith('(') && item.endsWith(')')) {
            this.scanAppRouter(fullPath, baseRoute, routes);
         } else if (item !== 'api' && !item.startsWith('_')) {
            // Normal segment or dynamic segment [param] / [...catchall]
            this.scanAppRouter(fullPath, `${baseRoute}/${item}`, routes);
         }
      } else if (item === 'page.tsx' || item === 'page.js' || item === 'page.jsx') {
        const routePath = baseRoute === '' ? '/' : baseRoute;
        routes.push({
          path: routePath,
          routerType: 'app',
          params: this.extractParams(routePath),
          title: this.inferTitle(fullPath, routePath),
          confidence: 0.6
        });
      }
    }
  }

  private scanPagesRouter(dir: string, baseRoute: string, routes: DiscoveredRoute[]) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (item !== 'api' && !item.startsWith('_')) {
          this.scanPagesRouter(fullPath, `${baseRoute}/${item}`, routes);
        }
      } else if (item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
        if (item.startsWith('_') || item.startsWith('api')) continue;

        const name = item.replace(/\.(tsx|js|jsx)$/, '');
        const routePath = name === 'index' ? (baseRoute === '' ? '/' : baseRoute) : `${baseRoute}/${name}`;
        
        routes.push({
          path: routePath,
          routerType: 'pages',
          params: this.extractParams(routePath),
          title: this.inferTitle(fullPath, routePath),
          confidence: 0.6
        });
      }
    }
  }

  private extractParams(routePath: string): string[] {
    const params: string[] = [];
    // Match [param], [...catchall], [[...optional]]
    const matches = routePath.match(/\[+([^\]]+)\]+/g);
    if (!matches) return [];
    
    return matches.map(m => {
        // Remove all brackets
        let clean = m.replace(/[\[\]]/g, '');
        // Remove catch-all dots if present
        if (clean.startsWith('...')) {
            clean = clean.slice(3);
        }
        return clean;
    });
  }

  private inferTitle(filePath: string, routePath: string): string {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 1. Try to find Next.js metadata object: export const metadata = { title: "..." }
      // This is more specific than just looking for "title:"
      const metadataTitleMatch = content.match(/metadata\s*=\s*{[\s\S]*?title:\s*["']([^"']+)["']/);
      if (metadataTitleMatch) return metadataTitleMatch[1];

      // 2. Try <h1> tags
      const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
      if (h1Match) {
          const text = h1Match[1].replace(/<[^>]*>/g, '').trim();
          if (text) return text;
      }

      // 3. Infer from route path
      // Remove dynamic segments and route groups for title generation
      const staticSegments = routePath
        .split('/')
        .filter(s => s && !s.startsWith('[') && !s.startsWith('('));

      if (staticSegments.length === 0) return 'Home';

      const lastSegment = staticSegments[staticSegments.length - 1];
      
      // Normalize: forgot-password -> Forgot Password, userProfile -> User Profile
      return lastSegment
        .replace(/[-_]/g, ' ') // Convert dashes/underscores to spaces
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim();
        
    } catch {
      return 'Page';
    }
  }
}
