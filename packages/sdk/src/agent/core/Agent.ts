import { AgentStateMachine } from "./AgentStateMachine";
import { AgentState } from "../types/AgentState";
import { Objective, createObjective } from "./Objective";
import { Step, createStep } from "./Step";
import { Action } from "./Action";

export interface AgentUIState {
  state: AgentState;
  objective?: Objective;
  steps: Step[];
  availableActions?: Action[];
  waitingReason?: string;
  transcript?: string;
  proposedAction?: any;
  messages: { role: "user" | "assistant"; content: string }[];
}

export class Agent {
  private stateMachine: AgentStateMachine;
  private currentObjective?: Objective;
  private steps: Step[] = [];
  private availableActions: Action[] = [];
  private waitingReason?: string;
  private transcript?: string;
  private proposedAction?: any;
  private messages: { role: "user" | "assistant"; content: string }[] = [];

  private stateChangeListeners: ((state: AgentUIState) => void)[] = [];

  constructor() {
    this.stateMachine = new AgentStateMachine();
  }

  public setProposedAction(action: any) {
    this.proposedAction = action;
    this.notify();
  }

  public addMessage(role: "user" | "assistant", content: string) {
    const lastMsg = this.messages[this.messages.length - 1];
    if (lastMsg && lastMsg.role === role && lastMsg.content === content) {
      return; // Deduplicate
    }
    this.messages.push({ role, content });
    this.notify();
  }

  public getMessages() {
    return this.messages;
  }

  public onStateChange(listener: (state: AgentUIState) => void) {
    this.stateChangeListeners.push(listener);
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter(
        (l) => l !== listener,
      );
    };
  }

  private notify() {
    const uiState = this.getUIState();
    this.stateChangeListeners.forEach((l) => l(uiState));
  }

  public async receiveInput(input: string, mode: "voice" | "text" = "text") {
    if (mode === "voice") {
      this.transition("START_LISTENING");
    } else {
      this.transition("START_PROCESSING");
    }

    this.currentObjective = createObjective(input);
    this.steps = [];
    this.availableActions = [];
    this.waitingReason = undefined;
    this.notify();
  }

  public setTranscript(text: string) {
    this.transcript = text;
    this.notify();
  }

  public addStep(label: string, status: Step["status"] = "pending") {
    // Complete previous pending step if any
    const lastStep = this.steps[this.steps.length - 1];
    if (lastStep && lastStep.status === "pending") {
      lastStep.status = "completed";
      lastStep.completedAt = new Date();
    }

    const step = createStep(label, status);
    this.steps.push(step);
    this.notify();
    return step;
  }

  public transition(type: any, payload?: any) {
    this.stateMachine.transition({ type, payload });
    this.notify();
  }

  public getUIState(): AgentUIState {
    return {
      state: this.stateMachine.getState(),
      objective: this.currentObjective,
      steps: [...this.steps],
      availableActions: [...this.availableActions],
      waitingReason: this.waitingReason,
      transcript: this.transcript,
      proposedAction: this.proposedAction,
      messages: [...this.messages],
    };
  }

  public setAvailableActions(actions: Action[]) {
    this.availableActions = actions;
    this.notify();
  }

  public setWaitingReason(reason: string) {
    this.waitingReason = reason;
    this.notify();
  }

  public reset() {
    this.currentObjective = undefined;
    this.steps = [];
    this.availableActions = [];
    this.waitingReason = undefined;
    this.transcript = undefined;
    this.proposedAction = undefined;
    this.messages = [];
    this.transition("RESET");
  }

  /**
   * Legacy helper for backward compatibility during transition
   */
  public async runTask(steps: any[]) {
    // Logic for old-style task running if needed
  }
}
