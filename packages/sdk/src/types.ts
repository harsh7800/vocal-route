export type RouteEntry = {
  path: string;
  title?: string;
  intents: string[];
  params?: string[] | Record<string, string>;
  confidence: number;
  observed?: boolean;
  routerType?: "app" | "pages" | string;
  [key: string]: any;
};

export type RouteRegistry = RouteEntry[];

export type VocalIntent = {
  intent: "navigate" | "action" | "chat" | "unknown";
  target: string | null;
  confidence: number;
  transcript: string;
  params?: Record<string, string>;
  reply?: string;
};

export type VocalAIConfig = {
  enabled?: boolean;
  openaiApiKey?: string;
  baseURL?: string;
  intentModel?: string;
  transcriptModel?: string;
  fallbackToLocal?: boolean;
  strictMode?: boolean;
};

export type VocalRouteConfig = {
  apiUrl?: string;
  routes?: RouteRegistry;
  ai?: VocalAIConfig;
};
