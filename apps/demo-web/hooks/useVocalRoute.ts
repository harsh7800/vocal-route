import { useVocalRoute as useVocalRouteSDK } from "vocalroute-sdk";

export function useVocalRoute() {
  const sdk = useVocalRouteSDK();

  // Custom frontend logic can be added here

  return sdk;
}
