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
    this.cacheFile = path.join(cacheDir, "vocalroute-cache.json");
    this.loadCache();
  }

  private loadCache() {
    if (fs.existsSync(this.cacheFile)) {
      try {
        this.cache = JSON.parse(fs.readFileSync(this.cacheFile, "utf8"));
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
      .createHash("md5")
      .update(`${route.path}-${route.title}-${route.params.join(",")}`)
      .digest("hex");
  }

  public async generate(
    routes: DiscoveredRoute[],
    options: { openaiApiKey?: string } = {},
  ): Promise<RouteWithIntents[]> {
    const results: RouteWithIntents[] = [];

    for (const route of routes) {
      const hash = this.generateHash(route);
      let intents = this.cache[hash];

      if (!intents) {
        if (options.openaiApiKey) {
          intents = await this.generateAIIntents(route, options.openaiApiKey);
        } else {
          intents = this.generateStaticIntents(route);
        }
        this.cache[hash] = intents;
      }

      results.push({
        ...route,
        intents,
        hash,
      });
    }

    this.saveCache();
    return results;
  }

  private async generateAIIntents(
    route: DiscoveredRoute,
    apiKey: string,
  ): Promise<string[]> {
    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey });

      console.log(`🧠 Generating AI intents for: ${route.path}...`);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a specialized agent that generates natural language voice commands (intents) for a specific web page route. Generate 10-15 diverse and natural ways a user might ask to navigate to this page. Focus on semantic variations, casual speech, and possessive terms if relevant (e.g. 'my', 'me', 'mine'). Return ONLY a comma-separated list.",
          },
          {
            role: "user",
            content: `Route Path: ${route.path}\nRoute Title: ${route.title}\nDynamic Params: ${route.params.join(", ")}`,
          },
        ],
      });

      const content = completion.choices[0].message.content;
      if (content) {
        return content.split(",").map((s) => s.trim().toLowerCase());
      }
    } catch (e) {
      console.warn(
        `⚠️ AI intent generation failed for ${route.path}, falling back to static.`,
      );
    }

    return this.generateStaticIntents(route);
  }

  private generateStaticIntents(route: DiscoveredRoute): string[] {
    const intents: string[] = [];

    // 1. Clean segments: filter out dynamic [param] and empty strings
    const segments = route.path
      .split("/")
      .filter((s) => s && !s.startsWith("["));

    if (segments.length === 0) {
      intents.push("home", "dashboard", "manual", "main page");
    } else {
      const last = segments[segments.length - 1];
      const fullSpaced = segments.join(" ").replace(/[-_]/g, " ");
      const lastSpaced = last.replace(/[-_]/g, " ");

      // Add variations
      intents.push(fullSpaced);
      intents.push(lastSpaced);

      // Handle "my" and "user" paths specifically
      if (
        route.path.includes("/my") ||
        route.path.includes("/me") ||
        route.path.includes("/user")
      ) {
        if (!lastSpaced.includes("my")) {
          intents.push(`my ${lastSpaced}`);
        }
      }
    }

    // 2. Add title-based intents
    if (route.title) {
      const cleanTitle = route.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, " ")
        .trim();
      intents.push(cleanTitle);
    }

    // 3. Apply core verbs to the strongest variations
    const verbs = ["open", "go to", "show", "view", "navigate to"];
    const baseVariations = intents.slice(0, 3);
    const verbalIntents: string[] = [];

    for (const v of verbs) {
      for (const base of baseVariations) {
        verbalIntents.push(`${v} ${base}`);
      }
    }

    // Combine and deduplicate
    const finalIntents = Array.from(new Set([...intents, ...verbalIntents]))
      .filter((i) => i.length > 2)
      .slice(0, 15); // Increase limit for better coverage

    return finalIntents;
  }
}
