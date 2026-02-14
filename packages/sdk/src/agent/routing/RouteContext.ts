export interface RouteContext {
  route: string;
  params: Record<string, string>;
  visibleEntities: string[];
  filters?: Record<string, any>;
}
