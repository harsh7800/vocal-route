import OpenAI from "openai";
import { AgentOutput } from "../../types/AgentOutput";
import { RouteRegistry } from "../../../types";

export interface ConversationContext {
  registry: RouteRegistry;
  capabilities?: {
    id: string;
    description: string;
    scope?: string;
    params?: {
      name: string;
      type: string;
      required?: boolean;
      description?: string;
    }[];
  }[];
  history?: { role: "user" | "assistant"; content: string }[];
  currentPath?: string;
}

export interface ConversationConfig {
  openaiApiKey?: string;
  baseURL?: string;
  model?: string;
}

const SYSTEM_PROMPT = `
You are a friendly AI assistant within a web application.
Your job is to help the user perform actions or navigate pages. Be quick, decisive, and concise.

You must output a JSON object matching one of these types:

type AgentOutput =
  | { type: "message"; content: string }
  | { type: "proposed_action"; capability: string; params: Record<string, any>; requiresConfirmation: boolean; summary: string }
  | { type: "clarification_request"; capability?: string; missing: string[]; message: string };

**CRITICAL — Parameter Collection & Forms:**
- If you recognize a capability (e.g., "create campaign") but parameters are missing, ALWAYS return type: "proposed_action" with the capability ID and whatever params you found. 
- The system will automatically render a form for the missing parameters. DO NOT just send a "message" asking for them.
- If you return type: "clarification_request", you MUST include the "capability" ID if one was identified.

**Capability vs Route Priority:**
- ALWAYS check the Capabilities list FIRST. If a capability matches the user's intent, use its ID.
- Use a route path ONLY for general navigation (e.g., "go to invoices").

**Params-Aware Execution:**
- Check the capability's declared params. 
- Mutating actions (delete, update, refund, deactivate) → requiresConfirmation: true
- Non-mutating actions (download, export, navigate, view) → requiresConfirmation: false
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

    const capabilitiesDesc = (context.capabilities || [])
      .map((c) => {
        const paramInfo =
          c.params && c.params.length > 0
            ? `, Params: [${c.params.map((p) => `${p.name}(${p.type}${p.required ? ", required" : ", optional"})`).join(", ")}]`
            : `, Params: NONE (takes no input)`;
        return `- ID: ${c.id}, Description: ${c.description}${c.scope ? `, Scope: ${c.scope}` : ""}${paramInfo}`;
      })
      .join("\n");

    const history = context.history || [];
    const systemContent =
      SYSTEM_PROMPT +
      `\n\n**Routes (for navigation):**\n${registryDesc}` +
      (capabilitiesDesc
        ? `\n\n**Capabilities (for actions):**\n${capabilitiesDesc}`
        : "");

    const messages: any[] = [
      {
        role: "system",
        content: systemContent,
      },
      ...history,
    ];

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
