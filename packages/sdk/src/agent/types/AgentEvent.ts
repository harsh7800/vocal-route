export type AgentEventType =
  | "START_LISTENING"
  | "START_PROCESSING"
  | "START_CLARIFYING"
  | "REQUIRE_CONFIRMATION"
  | "START_NAVIGATING"
  | "START_EXECUTING"
  | "COMPLETE"
  | "FAIL"
  | "CANCEL"
  | "RESET";

export interface AgentEvent {
  type: AgentEventType;
  payload?: any;
}
