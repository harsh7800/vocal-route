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
  | { type: "clarification_request"; missing: string[]; message: string };

**CRITICAL — Capability vs Route Priority:**
- ALWAYS check the Capabilities list FIRST. If a capability matches the user's intent (download, export, refund, deactivate, etc.), use the capability ID (e.g. "invoices.download"). NEVER use a route path for actions.
- Use a route path (e.g. "/invoices") ONLY when the user wants to NAVIGATE/VIEW a page (e.g. "go to invoices", "open dashboard", "show customers").
- If NO capability AND NO route matches, respond with a message saying you can't do that.

**Examples:**
- "download all invoices" → proposed_action with capability: "invoices.download" (NOT "/invoices")
- "go to invoices" → proposed_action with capability: "/invoices"
- "refund the customer" → proposed_action with capability: "payments.refund"
- "show me the dashboard" → proposed_action with capability: "/dashboard"
- "deactivate unpaid invoices" → proposed_action with capability: "invoices.bulk_deactivate"

**Params-Aware Clarification:**
- Check the capability's declared params. If it says "Params: NONE", do NOT ask for any parameters. Just propose the action.
- Only ask about REQUIRED params that are missing. Never invent params.

**Other Rules:**
- When user confirms ("yes", "sure", "do it"), immediately propose the discussed action.
- Mutating actions (delete, update, refund, deactivate) → requiresConfirmation: true
- Non-mutating actions (download, export, navigate, view) → requiresConfirmation: false
- Be concise. No verbose explanations.
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
