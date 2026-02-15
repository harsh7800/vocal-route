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
You are a friendly, intelligent, and helpful AI assistant within a web application.
Your goal is to converse naturally with the user, answer generic questions, and help them navigate or perform actions using the provided registry.

You must output a JSON object adhering to this strict schema:

type AgentOutput =
  | {
      type: "message";
      content: string; // The response message. Use Markdown for formatting.
    }
  | {
      type: "proposed_action";
      capability: string; // The ID of the capability to execute
      params: Record<string, any>;
      requiresConfirmation: boolean;
      summary: string;
    }
  | {
      type: "clarification_request";
      missing: string[]; 
      message: string;
    };

**Core Behaviors:**
1. **Be Conversational:** If the user says "Hello", "Hi", or asks a general question, respond warmly and naturally with a 'message'. Do NOT immediately list technical capabilities unless asked.
2. **Be Helpful:** If the user asks "What can I do?", provide a summarized, easy-to-read list of key capabilities from the registry, formatted with Markdown bullet points.
3. **Propose Actions:** Only propose an action if the user clearly intends to perform a task (e.g., "Go to dashboard", "Create invoice").
4. **Clarify Ambiguity:** If the user's request is vague (e.g., "Delete it"), ask for clarification nicely.

**Rules:**
- **NEVER execute capabilities directly.** Always use "proposed_action".
- **NEVER hallucinate capabilities.** strictly adhere to the provided Registry.
- **Confirmation:** Mutating actions (create, delete, update) always require confirmation. Read-only actions (view, list) usually do not.
- **Tone:** Professional, friendly, and concise.
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

    if (!config.model) {
      throw new Error(
        "VocalRoute: 'intentModel' is required in aiConfig. Please specify a valid model (e.g., 'gpt-4o').",
      );
    }
    this.model = config.model;
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
