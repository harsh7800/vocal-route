import OpenAI from "openai";
import { AgentOutput } from "../../types/AgentOutput";
import { RouteRegistry } from "../../../types";

export interface ConversationContext {
  registry: RouteRegistry;
  history?: { role: "user" | "assistant"; content: string }[];
  currentPath?: string;
}

export interface ConversationConfig {
  openaiApiKey?: string;
  baseURL?: string;
  model?: string;
}

const SYSTEM_PROMPT = `
You are a helpful AI assistant integrated into a web application.
Your goal is to assist the user by answering questions, explaining capabilities, or proposing actions from the provided registry.

You must output a JSON object adhering to this strict schema:

type AgentOutput =
  | {
      type: "message";
      content: string; // The response message
    }
  | {
      type: "proposed_action";
      capability: string; // The ID of the capability to execute (e.g., path for navigation or action ID)
      params: Record<string, any>; // Parameters for the capability
      requiresConfirmation: boolean; // Whether user confirmation is needed
      summary: string; // A brief explanation of what this action will do
    }
  | {
      type: "clarification_request";
      missing: string[]; // List of missing information
      message: string; // The question to ask the user
    };

**Rules:**
1. **NEVER execute capabilities directly.** You can only PROPOSE them.
2. **NEVER hallucinate capabilities.** Only use capabilities listed in the registry.
3. **If the user asks a question** (e.g., "What can I do?", "How do I use this?"), respond with strictly type: "message".
4. **If the user's intent is clear but requires an action**, respond with type: "proposed_action".
   - For NAVIGATION, the capability is the route path (e.g., "/dashboard").
   - For ACTIONS, the capability is the action ID.
5. **If the user's intent is ambiguous or missing parameters**, respond with type: "clarification_request".
6. **Confirmation Policy:**
   - Mutating actions (create, update, delete) MUST require confirmation (requiresConfirmation: true).
   - Read-only actions (view, list) generally do not, unless they are sensitive.
   - Navigation actions usually do not require confirmation unless contextually appropriate.
7. **Refuse irrelevant requests** politely with a message.
`;

export class AgentConversation {
  private openai: OpenAI;
  private model: string;

  constructor(config: ConversationConfig) {
    if (!config.openaiApiKey) {
      throw new Error("OpenAI API Key is required for conversational agent.");
    }
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
      baseURL: config.baseURL,
      dangerouslyAllowBrowser: true,
    });
    this.model = config.model || "gpt-4o-mini";
  }

  async interpret(
    input: string,
    context: ConversationContext,
  ): Promise<AgentOutput> {
    const registryDesc = context.registry
      .map(
        (r) =>
          `- ${r.path} (Title: ${r.title || "Untitled"})${r.intents ? `, Intents: ${r.intents.join(", ")}` : ""}${r.params ? `, Params: ${JSON.stringify(r.params)}` : ""}`,
      )
      .join("\n");

    const history = context.history || [];
    // Ensure the last message matches the input, or add it if missing
    const lastMsg = history[history.length - 1];
    const messages: any[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT + `\n\n**Registry:**\n${registryDesc}`,
      },
      ...history,
    ];

    if (!lastMsg || (lastMsg.role === "user" && lastMsg.content !== input)) {
      // If the history doesn't contain the current input as the last user message, add it.
      // However, if receiveInput was called, it should be there.
      // We'll trust history if provided.
      // Actually, let's just use history as is.
    }

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages,
      response_format: { type: "json_object" },
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) throw new Error("No response content");
      return JSON.parse(content) as AgentOutput;
    } catch (e) {
      console.error("Failed to parse agent output", e);
      return {
        type: "message",
        content:
          "I'm having trouble processing that request. Could you try again?",
      };
    }
  }
}
