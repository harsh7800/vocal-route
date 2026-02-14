import { CapabilityConfig, CapabilityId } from "../types/Capability";
import { EntityConfig, EntityType } from "../types/Entity";

class Registry {
  private capabilities = new Map<CapabilityId, CapabilityConfig>();
  private entities = new Map<EntityType, EntityConfig>();

  constructor() {
    this.registerCapability({
      id: "__system.listCapabilities",
      description: "Lists all available commands and their descriptions",
      execute: () => {
        return Array.from(this.capabilities.values()).map((c) => ({
          id: c.id,
          description: c.description,
          scope: c.scope,
        }));
      },
    });

    this.registerCapability({
      id: "navigation",
      description: "Navigates to a specific page",
      execute: () => {
        // Core navigation is handled by the provider/router
        // This capability serves as a placeholder for the engine to manage state
        return { success: true };
      },
    });
  }

  // Capability Methods
  public registerCapability(config: CapabilityConfig) {
    if (this.capabilities.has(config.id)) {
      console.warn(
        `[VocalRoute] Capability ID "${config.id}" already registered. Overwriting.`,
      );
    }
    this.capabilities.set(config.id, config);
  }

  public getCapability(id: CapabilityId): CapabilityConfig | undefined {
    return this.capabilities.get(id);
  }

  public listCapabilities(scope?: string): CapabilityConfig[] {
    const list = Array.from(this.capabilities.values());
    if (scope) {
      return list.filter((c) => !c.scope || c.scope === scope);
    }
    return list;
  }

  // Entity Methods
  public registerEntity(type: EntityType, config: EntityConfig) {
    this.entities.set(type, config);
  }

  public getEntityConfig(type: EntityType): EntityConfig | undefined {
    return this.entities.get(type);
  }

  public clear() {
    this.capabilities.clear();
    this.entities.clear();
  }
}

export const vocalRegistry = new Registry();
