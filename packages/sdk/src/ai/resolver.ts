import OpenAI from "openai";
import type { RouteRegistry, VocalIntent } from "../types";

export interface ResolveIntentOptions {
  openaiApiKey?: string;
  transcriptModel?: string;
  intentSummaryModel?: string;
}

export async function resolveIntent(
  transcript: string,
  registry: RouteRegistry,
  options: ResolveIntentOptions = {},
): Promise<VocalIntent> {
  const apiKey = options.openaiApiKey || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Please provide it in options or set it in .env.local",
    );
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `
You are a high-precision voice-controlled navigation engine.
Your goal is to map a user's spoken transcript to the correct route from the provided registry.

Rules:
1. Respond with ONLY valid JSON.
2. intent must be "navigate" if a strong match is found, otherwise "unknown".
3. confidence must be between 0 and 1.
4. target must be the EXACT "path" of the matched route from the registry.
5. If the route matched is dynamic (contains [param]), extract the relevant value from the transcript and return it in the "params" object.
6. Semantic matching is encouraged (e.g., "show me customers" matches ID: "/clients").
7. Minimum confidence for navigation is 0.75. If you are unsure, return "unknown".
`;

  const routeContext = registry
    .map((r) => {
      const details = [
        `Path: ${r.path}`,
        `Title: ${r.title || "Untitled"}`,
        r.intents?.length ? `Keywords: ${r.intents.join(", ")}` : null,
        r.params ? `Dynamic Params: ${Object.keys(r.params).join(", ")}` : null,
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

  if (options.transcriptModel) {
    try {
      const correction = await openai.chat.completions.create({
        model: options.transcriptModel,
        messages: [
          {
            role: "system",
            content:
              "You are a specialized speech correction engine. Your task is to correct any phonetic errors, distinct slurring, or context-missed words in the provided transcript to make it suitable for a navigation intent processor. Return ONLY the corrected text.",
          },
          { role: "user", content: transcript },
        ],
      });
      const correctedText = correction.choices[0].message.content;
      if (correctedText) {
        transcript = correctedText.trim();
      }
    } catch (e) {
      console.warn(
        "⚠️ Transcript correction failed, proceeding with original:",
        e,
      );
    }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: options.intentSummaryModel || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content;

    if (!raw) {
      return { transcript, intent: "unknown", target: null, confidence: 0 };
    }

    const result = JSON.parse(raw);

    // Ensure transcript is included in the response
    return {
      ...result,
      transcript,
    } as VocalIntent;
  } catch (error) {
    console.error("❌ VocalRoute AI Error:", error);
    return { transcript, intent: "unknown", target: null, confidence: 0 };
  }
}

/**
 * A purely local intent resolver that uses keyword matching and basic heuristics.
 * This is "backend-free" and runs entirely in the browser.
 */
export function resolveLocalIntent(
  transcript: string,
  registry: RouteRegistry,
): VocalIntent {
  const normalizedTranscript = transcript.toLowerCase().trim();

  let bestMatch: { route: any; confidence: number } | null = null;

  for (const route of registry) {
    let maxRouteConfidence = 0;

    // 1. Check direct intent matches
    if (route.intents) {
      for (const intent of route.intents) {
        const normalizedIntent = intent.toLowerCase();
        if (normalizedTranscript === normalizedIntent) {
          maxRouteConfidence = Math.max(maxRouteConfidence, 0.95);
        } else if (normalizedTranscript.includes(normalizedIntent)) {
          maxRouteConfidence = Math.max(maxRouteConfidence, 0.85);
        }
      }
    }

    // 2. Check title matches
    if (route.title) {
      const normalizedTitle = route.title.toLowerCase();
      if (normalizedTranscript.includes(normalizedTitle)) {
        maxRouteConfidence = Math.max(maxRouteConfidence, 0.75);
      }
    }

    // 3. Check path matches (semantic-ish)
    // 3. Check path matches (semantic-ish)
    // Handle "clients" matching "client page" or "client"
    const pathSlug = route.path.split("/").pop()?.toLowerCase();

    if (pathSlug && pathSlug.length > 2) {
      // Direct match
      if (normalizedTranscript.includes(pathSlug)) {
        maxRouteConfidence = Math.max(maxRouteConfidence, 0.75);
      }

      // Singular/Plural handling (e.g. route: "invoices", transcript: "invoice")
      const singularSlug = pathSlug.endsWith("s")
        ? pathSlug.slice(0, -1)
        : pathSlug;
      if (normalizedTranscript.includes(singularSlug)) {
        maxRouteConfidence = Math.max(maxRouteConfidence, 0.7);
      }

      // Split slug handling (e.g. route: "user-profile", transcript: "user profile")
      const spacedSlug = pathSlug.replace(/-/g, " ");
      if (normalizedTranscript.includes(spacedSlug)) {
        maxRouteConfidence = Math.max(maxRouteConfidence, 0.7);
      }

      // Reverse split handling (e.g. route: "settings", transcript: "setting")
      const singularSpaced = spacedSlug.endsWith("s")
        ? spacedSlug.slice(0, -1)
        : spacedSlug;
      if (normalizedTranscript.includes(singularSpaced)) {
        maxRouteConfidence = Math.max(maxRouteConfidence, 0.7);
      }
    }

    if (maxRouteConfidence > (bestMatch?.confidence || 0)) {
      bestMatch = { route, confidence: maxRouteConfidence };
    }
  }

  if (bestMatch && bestMatch.confidence >= 0.7) {
    // Basic param extraction if needed (placeholder for now)
    // In a local resolver, we might just look for numbers or specific keywords
    return {
      intent: "navigate",
      target: bestMatch.route.path,
      confidence: bestMatch.confidence,
      transcript,
      reply: `Navigating to ${bestMatch.route.title || bestMatch.route.path}...`,
    };
  }

  return {
    intent: "unknown",
    target: null,
    confidence: 0,
    transcript,
    reply: "I'm not sure which page you're looking for.",
  };
}
