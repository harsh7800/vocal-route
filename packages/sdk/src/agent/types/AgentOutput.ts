export type AgentOutput =
  | {
      type: "message";
      content: string;
    }
  | {
      type: "proposed_action";
      capability: string;
      params: Record<string, any>;
      requiresConfirmation: boolean;
      summary?: string;
    }
  | {
      type: "clarification_request";
      missing: string[];
      message: string;
    };
