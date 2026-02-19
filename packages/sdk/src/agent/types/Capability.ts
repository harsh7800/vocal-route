export interface CapabilityParam {
  name: string;
  label?: string; // Human readable name
  type: "string" | "number" | "boolean" | "select";
  required?: boolean;
  description?: string;
  dependency?: string; // Key in the dependencies map
  options?: any[]; // Static options if not dynamic
}

export interface CapabilityConfig {
  id: string;
  scope?: string; // Optional route scope
  entity?: {
    type: string;
    param: string;
  };
  params?: CapabilityParam[]; // Explicit param definitions — if empty/missing, capability takes no params
  dependencies?: Record<
    string,
    () => Promise<any[] | { label: string; value: any }[]>
  >;
  schema?: any; // Optional payload validation schema (Zod or simple object)
  validate?: (params: any) => Promise<string | null> | string | null; // Returns error message or null
  description?: string;
  execute: (params: any) => Promise<any> | any;
}

export type CapabilityId = string;
