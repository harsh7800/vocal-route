import { Agent, AgentUIState } from "../core/Agent";
import { AgentState } from "../types/AgentState";

export class AgentUIAdapter {
  private agent: Agent;

  constructor(agent: Agent) {
    this.agent = agent;
  }

  public getUIState(): AgentUIState {
    return this.agent.getUIState();
  }

  public getUIVisibility() {
    const { state } = this.agent.getUIState();

    return {
      showIdlePanel: state === AgentState.IDLE,
      showObjective: state !== AgentState.IDLE,
      showSteps: ![AgentState.IDLE, AgentState.LISTENING].includes(state),
      showConfirmation: state === AgentState.AWAITING_CONFIRMATION,
      showClarification: state === AgentState.CLARIFYING,
      showInput: [AgentState.IDLE, AgentState.EXECUTING].includes(state),
    };
  }
}
