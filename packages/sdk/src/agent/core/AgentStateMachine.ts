import { AgentState } from "../types/AgentState";
import { AgentEvent } from "../types/AgentEvent";

export class AgentStateMachine {
  private currentState: AgentState = AgentState.IDLE;
  private history: {
    from: AgentState;
    to: AgentState;
    event: string;
    timestamp: number;
  }[] = [];

  constructor(initialState: AgentState = AgentState.IDLE) {
    this.currentState = initialState;
  }

  public getState(): AgentState {
    return this.currentState;
  }

  public transition(event: AgentEvent): AgentState {
    const previousState = this.currentState;
    let nextState = this.currentState;

    switch (event.type) {
      case "START_LISTENING":
        nextState = AgentState.LISTENING;
        break;
      case "START_PROCESSING":
        nextState = AgentState.PROCESSING;
        break;
      case "START_CLARIFYING":
        nextState = AgentState.CLARIFYING;
        break;
      case "REQUIRE_CONFIRMATION":
        nextState = AgentState.AWAITING_CONFIRMATION;
        break;
      case "START_NAVIGATING":
        nextState = AgentState.NAVIGATING;
        break;
      case "START_EXECUTING":
        nextState = AgentState.EXECUTING;
        break;
      case "COMPLETE":
        nextState = AgentState.COMPLETED;
        break;
      case "FAIL":
        nextState = AgentState.ERROR;
        break;
      case "CANCEL":
      case "RESET":
        nextState = AgentState.IDLE;
        break;
    }

    if (nextState !== previousState) {
      this.currentState = nextState;
      this.logTransition(previousState, nextState, event.type);
    }

    return this.currentState;
  }

  private logTransition(from: AgentState, to: AgentState, event: string) {
    this.history.push({
      from,
      to,
      event,
      timestamp: Date.now(),
    });
    console.debug(`[AgentStateMachine] ${from} -> ${to} via ${event}`);
  }

  public getHistory() {
    return [...this.history];
  }
}
