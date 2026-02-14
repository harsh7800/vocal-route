import { Action } from '../core/Action';

export interface RouteSchema {
  route: string;
  pageName: string;
  entity?: string;            // invoices, users, payments
  capabilities: {
    read: boolean;
    write: boolean;
  };
  actions: Action[];
}
