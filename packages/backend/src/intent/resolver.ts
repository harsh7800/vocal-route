import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type IntentResult = {
  intent: "navigate" | "unknown";
  target: string | null;
  params?: Record<string, string>;
  confidence: number;
};

export type RouteDefinition = {
  id: string;
  aliases?: string[];
  description?: string;
  params?: string[];
};

export async function extractIntent(
  transcript: string,
  availableRoutes: RouteDefinition[],
): Promise<IntentResult> {
  const systemPrompt = `
You are a high-precision voice-controlled navigation engine.
Your goal is to map a user's spoken transcript to the correct route from the provided registry.

Rules:
1. Respond with ONLY valid JSON.
2. intent must be "navigate" if a strong match is found, otherwise "unknown".
3. confidence must be between 0 and 1.
4. target must be the EXACT "id" of the matched route from the registry.
5. If the route matched is dynamic (contains [param]), extract the relevant value from the transcript and return it in the "params" object.
6. Semantic matching is encouraged (e.g., "show me customers" matches ID: "/clients").
7. Minimum confidence for navigation is 0.75. If you are unsure, return "unknown".
`;

  const routeContext = availableRoutes
    .map((r) => {
      const details = [
        `ID: ${r.id}`,
        r.aliases?.length ? `Aliases: ${r.aliases.join(", ")}` : null,
        r.description ? `Description: ${r.description}` : null,
        r.params?.length ? `Dynamic Params: ${r.params.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join(" | ");
      return `- ${details}`;
    })
    .join("\n");

  const userPrompt = `
Route Registry:
${routeContext}

User Spoken Transcript:
"${transcript}"

Respond in this exact JSON format:
{
  "intent": "navigate",
  "target": "/matched/route/id",
  "params": { "param_name": "value" },
  "confidence": 0.95
}
`;

  const completion = await openai.chat.completions.create({
    model: process.env.TEXT_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content;

  if (!raw) {
    return { intent: "unknown", target: null, confidence: 0 };
  }

  try {
    const result = JSON.parse(raw);

    // Task 5: Enforce confidence threshold
    if (result.confidence < 0.75) {
      return { ...result, intent: "unknown" };
    }

    return result as IntentResult;
  } catch {
    return { intent: "unknown", target: null, confidence: 0 };
  }
}
