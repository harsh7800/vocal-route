export interface CapabilityConfig {
  id: string;
  scope?: string; // Optional route scope
  entity?: {
    type: string;
    param: string;
  };
  schema?: any; // Optional payload validation schema
  description?: string;
  execute: (params: any) => Promise<any> | any;
}

export type CapabilityId = string;
