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
  private skipSegments: string[];

  constructor(rootDir: string, skipSegments: string[] = []) {
    this.rootDir = rootDir;
    this.skipSegments = skipSegments;
  }

  public scan(): DiscoveredRoute[] {
    const routes: DiscoveredRoute[] = [];

    // Scan App Router
    const appDir = path.join(this.rootDir, "app");
    if (fs.existsSync(appDir)) {
      this.scanAppRouter(appDir, "", routes);
    }

    // Scan Pages Router
    const pagesDir = path.join(this.rootDir, "pages");
    if (fs.existsSync(pagesDir)) {
      this.scanPagesRouter(pagesDir, "", routes);
    }

    return routes;
  }

  private scanAppRouter(
    dir: string,
    baseRoute: string,
    routes: DiscoveredRoute[],
  ) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip Route Groups (folders inside parentheses) - they don't affect the URL path
        if (item.startsWith("(") && item.endsWith(")")) {
          this.scanAppRouter(fullPath, baseRoute, routes);
        }
        // Skip Parallel Routes (@folder)
        else if (item.startsWith("@")) {
          continue;
        } else if (item !== "api" && !item.startsWith("_")) {
          // Check if this segment should be skipped logically in the path
          const shouldSkipSegment = this.skipSegments.includes(
            item.replace(/[\[\]]/g, ""),
          );
          const nextBase = shouldSkipSegment
            ? baseRoute
            : `${baseRoute}/${item}`;

          this.scanAppRouter(fullPath, nextBase, routes);
        }
      } else if (
        item === "page.tsx" ||
        item === "page.js" ||
        item === "page.jsx"
      ) {
        const routePath = baseRoute === "" ? "/" : baseRoute;

        // Avoid duplicate routes if multiple extensions exist
        if (routes.some((r) => r.path === routePath && r.routerType === "app"))
          continue;

        routes.push({
          path: routePath,
          routerType: "app",
          params: this.extractParams(routePath),
          title: this.inferTitle(fullPath, routePath),
          confidence: 0.8, // Increased base confidence for valid routes
        });
      }
    }
  }

  private scanPagesRouter(
    dir: string,
    baseRoute: string,
    routes: DiscoveredRoute[],
  ) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (item !== "api" && !item.startsWith("_")) {
          this.scanPagesRouter(fullPath, `${baseRoute}/${item}`, routes);
        }
      } else if (
        item.endsWith(".tsx") ||
        item.endsWith(".js") ||
        item.endsWith(".jsx")
      ) {
        if (item.startsWith("_") || item.startsWith("api")) continue;

        const name = item.replace(/\.(tsx|js|jsx)$/, "");
        const routePath =
          name === "index"
            ? baseRoute === ""
              ? "/"
              : baseRoute
            : `${baseRoute}/${name}`;

        routes.push({
          path: routePath,
          routerType: "pages",
          params: this.extractParams(routePath),
          title: this.inferTitle(fullPath, routePath),
          confidence: 0.8,
        });
      }
    }
  }

  private extractParams(routePath: string): string[] {
    const params: string[] = [];
    // Match [param], [...catchall], [[...optional]]
    const matches = routePath.match(/\[+([^\]]+)\]+/g);
    if (!matches) return [];

    return matches.map((m) => {
      // Remove all brackets
      let clean = m.replace(/[\[\]]/g, "");
      // Remove catch-all dots if present
      if (clean.startsWith("...")) {
        clean = clean.slice(3);
      }
      return clean;
    });
  }

  private inferTitle(filePath: string, routePath: string): string {
    try {
      const content = fs.readFileSync(filePath, "utf8");

      // 1. Try to find Next.js metadata object: export const metadata = { title: "..." }
      const metadataTitleMatch = content.match(
        /metadata[\s\S]*?title:\s*["']([^"']+)["']/,
      );
      if (metadataTitleMatch) return metadataTitleMatch[1];

      // 2. Try <h1> tags
      const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
      if (h1Match) {
        const text = h1Match[1].replace(/<[^>]*>/g, "").trim();
        if (text) return text;
      }

      // 3. Infer from route path
      // Filter out dynamic segments and route groups
      const segments = routePath
        .split("/")
        .filter((s) => s && !s.startsWith("[") && !s.startsWith("("));

      if (segments.length === 0) return "Home";

      // Use the last segment, but if it's very generic (like "new", "edit", "details"),
      // include the parent segment for context.
      const last = segments[segments.length - 1];
      const genericWords = [
        "new",
        "edit",
        "details",
        "view",
        "id",
        "page",
        "index",
        "success",
        "error",
      ];

      let titleParts = [last];
      if (genericWords.includes(last.toLowerCase()) && segments.length > 1) {
        titleParts = [segments[segments.length - 2], last];
      }

      return titleParts
        .map((s) =>
          s
            .replace(/[-_]/g, " ")
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase()),
        )
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    } catch {
      return "Page";
    }
  }
}
