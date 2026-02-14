export interface EntityConfig<T = any> {
  getAll: () => T[] | Promise<T[]>;
  search: (query: string, all: T[]) => T[] | Promise<T[]>;
  label: (entity: T) => string;
  value: (entity: T) => string | number;
}

export type EntityType = string;
