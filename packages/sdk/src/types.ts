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
  intent: "navigate" | "unknown";
  target: string | null;
  confidence: number;
  transcript: string;
  params?: Record<string, string>;
  reply?: string;
};

export type VocalRouteConfig = {
  apiUrl?: string;
  routes?: RouteRegistry;
  ai?: {
    enabled?: boolean;
    openaiApiKey?: string;
    intentModel?: string;
    transcriptModel?: string;
    fallbackToLocal?: boolean;
  };
};
