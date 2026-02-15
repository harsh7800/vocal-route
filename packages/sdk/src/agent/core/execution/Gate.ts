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
        this.agent.transition(AgentState.IDLE);
        break;

      case "clarification_request":
        this.agent.addMessage("assistant", output.message);
        this.agent.transition(AgentState.CLARIFYING);
        break;

      case "proposed_action":
        this.agent.setProposedAction(output);
        
        // Check confirmation policy
        if (output.requiresConfirmation) {
          this.agent.transition(AgentState.AWAITING_CONFIRMATION);
        } else {
          // Auto-execute
          await this.execute(output.capability, output.params, output.summary);
        }
        break;
    }
  }

  async execute(capabilityId: string, params: any, summary?: string) {
    this.agent.transition(AgentState.EXECUTING);
    if(summary) this.agent.addStep(summary, "pending");
    
    try {
        await this.engine.processIntent({
            capability: capabilityId,
            params: params
        });
        if(summary) this.agent.addStep(summary, "completed");
        this.agent.transition(AgentState.COMPLETED);
    } catch (e: any) {
        this.agent.addMessage("assistant", `I encountered an error: ${e.message}`);
        this.agent.transition(AgentState.ERROR);
    }
  }
}
