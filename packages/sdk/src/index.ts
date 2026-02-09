/*
 * VocalRoute SDK
 * IMPORTANT: Import the CSS file in your root layout:
 * import 'vocalroute-sdk/vocalroute.css';
 */
export { VocalRouteProvider, useVocalRoute } from "./provider";

export { VoiceOverlay } from "./components/VoiceOverlay";
export { VocalRouteButton } from "./components/VocalRouteButton";
export {
  resolveIntent,
  resolveLocalIntent,
  type ResolveIntentOptions,
} from "./ai/resolver";
export type * from "./types";
