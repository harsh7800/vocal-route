export type VocalIntent = {
    intent: "navigate";
    target: string;
    confidence: number;
};
export type VocalRouteConfig = {
    wsUrl?: string;
};
