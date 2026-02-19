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
  voiceModel?: string; // e.g. "alloy", "echo", "fable", "onyx", "nova", "shimmer"
  speechModel?: string; // e.g. "tts-1", "tts-1-hd"
  whisperEnabled?: boolean;
  fallbackToLocal?: boolean;
  strictMode?: boolean;
};

export type VocalRouteConfig = {
  apiUrl?: string;
  routes?: RouteRegistry;
  ai?: VocalAIConfig;
};
