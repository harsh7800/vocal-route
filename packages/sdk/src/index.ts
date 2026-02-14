/*
 * VocalRoute SDK
 * IMPORTANT: Import the CSS file in your root layout:
 * import '@vocalroute-ai/sdk/vocalroute.css';
 */

export { VocalRouteProvider, useVocalRoute } from "./provider";
export { VocalRouteButton } from "./components/VocalRouteButton";

// New Architecture Exports
export { vocalRegistry } from "./agent/runtime/Registry";
export { AgentState } from "./agent/types/AgentState";
export type { CapabilityConfig } from "./agent/types/Capability";
export type { EntityConfig } from "./agent/types/Entity";

export {
  resolveIntent,
  resolveLocalIntent,
  type ResolveIntentOptions,
} from "./ai/resolver";

export type * from "./types";
