export interface CapabilityParam {
  name: string;
  type: "string" | "number" | "boolean";
  required?: boolean;
  description?: string;
}

export interface CapabilityConfig {
  id: string;
  scope?: string; // Optional route scope
  entity?: {
    type: string;
    param: string;
  };
  params?: CapabilityParam[]; // Explicit param definitions — if empty/missing, capability takes no params
  schema?: any; // Optional payload validation schema
  description?: string;
  execute: (params: any) => Promise<any> | any;
}

export type CapabilityId = string;
