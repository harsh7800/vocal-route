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
        if (output.capability) {
          // Proactively set up the engine state if a capability was identified
          this.engine.processIntent({
            capability: output.capability,
            params: {}
          });
        }
        this.agent.transition("START_CLARIFYING");
        break;

      case "proposed_action":
        const isNavigation = output.capability.startsWith("/");

        // Always check params first via engine - this will set up activeForm if needed
        await this.engine.processIntent({
          capability: output.capability,
          params: output.params,
        });

        if (output.requiresConfirmation || isNavigation) {
          // If the engine transitioned to CLARIFYING (missing params), 
          // we don't need to show the confirmation card yet.
          const state = this.agent.getUIState().state;
          if (state !== AgentState.CLARIFYING) {
            if (output.summary) {
              this.agent.addMessage("assistant", output.summary);
            }
            this.agent.setProposedAction(output);
            this.agent.clearSteps();
            this.agent.transition("REQUIRE_CONFIRMATION");
          }
        }
        break;
    }
  }

  async execute(capabilityId: string, params: any, summary?: string) {
    try {
      await this.engine.processIntent({
        capability: capabilityId,
        params: params,
      });
    } catch (e: any) {
      this.agent.addMessage(
        "assistant",
        `I encountered an error: ${e.message}`,
      );
      this.agent.transition("FAIL");
    }
  }
}
