export type RouteDefinition = {
  id: string;
  path: string;
  aliases?: string[];
  description?: string;
};

export type VocalIntent = {
  intent: "navigate" | "unknown";
  target: string | null;
  confidence: number;
  transcript: string;
};

export type VocalRouteConfig = {
  apiUrl?: string;
  routes: RouteDefinition[];
};
