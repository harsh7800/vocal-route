import { Agent } from "../Agent";
import { AgentOutput } from "../../types/AgentOutput";
import { ExecutionEngine } from "../../runtime/ExecutionEngine";
import { AgentState } from "../../types/AgentState";

export class ExecutionGate {
  private agent: Agent;
  private engine: ExecutionEngine;

  constructor(agent: Agent, engine: ExecutionEngine) {
    this.agent = agent;
    this.engine = engine;
  }

  async handle(output: AgentOutput) {
    switch (output.type) {
      case "message":
        this.agent.addMessage("assistant", output.content);
        // End of turn.
        this.agent.transition("RESET");
        break;

      case "clarification_request":
        this.agent.addMessage("assistant", output.message);
        this.agent.transition("START_CLARIFYING");
        break;

      case "proposed_action":
        const isNavigation = output.capability.startsWith("/");

        if (output.requiresConfirmation || isNavigation) {
          // Show the proposed action card and wait for user to confirm.
          // Navigation MUST go through confirmation because only the
          // provider layer has router access to handle navigation.
          this.agent.setProposedAction(output);
          this.agent.clearSteps();
          this.agent.transition("REQUIRE_CONFIRMATION");
        } else {
          // Auto-execute non-navigation capabilities directly
          this.agent.clearSteps();
          await this.execute(output.capability, output.params, output.summary);
        }
        break;
    }
  }

  async execute(capabilityId: string, params: any, summary?: string) {
    this.agent.transition("START_EXECUTING");
    if(summary) this.agent.addStep(summary, "pending");
    
    try {
      await this.engine.processIntent({
        capability: capabilityId,
        params: params,
      });
      if (summary) this.agent.addStep(summary, "completed");
      this.agent.transition("COMPLETE");
    } catch (e: any) {
      this.agent.addMessage(
        "assistant",
        `I encountered an error: ${e.message}`,
      );
      this.agent.transition("FAIL");
    }
  }
}
