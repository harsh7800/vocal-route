import { vocalRegistry } from "./Registry";
import { Agent } from "../core/Agent";
import { AgentState } from "../types/AgentState";

export class ExecutionEngine {
  private agent: Agent;

  constructor(agent: Agent) {
    this.agent = agent;
  }

  public async processIntent(resolution: { capability: string; params?: any }) {
    const capability = vocalRegistry.getCapability(resolution.capability);

    if (!capability) {
      console.error(`[VocalRoute] Capability "${resolution.capability}" not found.`);
      this.agent.transition("FAIL", { message: `Unknown capability: ${resolution.capability}` });
      return;
    }

    this.agent.transition("START_EXECUTING");
    this.agent.addStep(`Executing ${capability.id}...`, "pending");

    try {
      // 1. Entity Resolution (Placeholder for now)
      if (capability.entity) {
        this.agent.transition("START_CLARIFYING");
        this.agent.addStep(`Resolving ${capability.entity.type}...`, "pending");
        // Logic for entity resolution goes here
      }

      // 2. Navigation Guard
      const currentPath = window.location.pathname;
      if (capability.scope && capability.scope !== currentPath) {
        this.agent.transition("REQUIRE_CONFIRMATION");
        this.agent.setWaitingReason(`This action requires navigating to ${capability.scope}. Proceed?`);
        // We stop here and wait for confirm event
        return;
      }

      // 3. Execution
      const result = await capability.execute(resolution.params || {});
      this.agent.transition("COMPLETE");
      this.agent.addStep(`Completed ${capability.id}`, "completed");
      return result;

    } catch (error: any) {
      console.error(`[VocalRoute] Execution failed:`, error);
      this.agent.transition("FAIL", { message: error.message });
      this.agent.addStep(`Failed: ${error.message}`, "completed");
    }
  }

  public resumeWithConfirmation(resolution: { capability: string; params?: any }) {
    // This would be called after a user confirms navigation
    this.processIntent(resolution);
  }
}
