import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type IntentResult = {
  intent: "navigate" | "unknown";
  target: string | null;
  confidence: number;
};

export async function extractIntent(
  transcript: string,
  availableRoutes: string[],
): Promise<IntentResult> {
  const systemPrompt = `
You are an intent extraction engine.

You must respond with ONLY valid JSON.
Do not include markdown.
Do not include explanations.

Rules:
- intent must be "navigate" or "unknown"
- target must be one of the allowed routes or null
- confidence must be a number between 0 and 1
`;

  const userPrompt = `
Allowed routes:
${availableRoutes.join(", ")}

User command:
"${transcript}"

Respond in this exact JSON format:
{
  "intent": "navigate | unknown",
  "target": "string | null",
  "confidence": number
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0,
  });

  const raw = completion.choices[0].message.content;

  if (!raw) {
    return { intent: "unknown", target: null, confidence: 0 };
  }

  try {
    return JSON.parse(raw) as IntentResult;
  } catch {
    return { intent: "unknown", target: null, confidence: 0 };
  }
}
