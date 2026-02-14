import OpenAI from "openai";
import type { RouteRegistry, VocalIntent } from "../types";

export interface ResolveIntentOptions {
  openaiApiKey?: string;
  baseURL?: string;
  transcriptModel?: string;
  intentSummaryModel?: string;
  strictMode?: boolean;
}

const FALLBACK_MODELS = ["gpt-4o-mini", "gpt-3.5-turbo"];

export async function resolveIntent(
  transcript: string,
  registry: RouteRegistry,
  options: ResolveIntentOptions = {},
): Promise<VocalIntent> {
  const apiKey = options.openaiApiKey || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "VocalRoute: OpenAI API Key is missing. Please provide it in VocalRouteProvider or set OPENAI_API_KEY environment variable.",
    );
  }

  const openai = new OpenAI({
    apiKey,
    baseURL: options.baseURL,
  });

  const systemPrompt = `
You are a high-precision voice-controlled navigation engine.
Your goal is to map a user's spoken transcript to the correct route from the provided registry.

Rules:
1. Respond with ONLY valid JSON.
7. Minimum confidence for navigation is 0.75. If you are unsure about navigation, check if it's a general question or conversation.
8. If the input is conversational (e.g., "hello", "how are you", "what can you do?"), respond with:
   - "intent": "chat"
   - "reply": A concise, friendly, and helpful AI response.
   - "target": null
   - "confidence": 0.9
9. If the input is completely unintelligible or unrelated, return "unknown".
`;

  const routeContext = registry
    .map((r) => {
      const details = [
        `Path: ${r.path}`,
        `Title: ${r.title || "Untitled"}`,
        r.intents?.length ? `Keywords: ${r.intents.join(", ")}` : null,
        r.params
          ? `Dynamic Params: ${Array.isArray(r.params) ? r.params.join(", ") : Object.keys(r.params).join(", ")}`
          : null,
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

  // 1. Optional Transcript Correction
  if (options.transcriptModel) {
    const triedModels = options.strictMode
      ? [options.transcriptModel]
      : [
          options.transcriptModel,
          ...FALLBACK_MODELS.filter((m) => m !== options.transcriptModel),
        ];

    let lastError: any = null;

    for (const model of triedModels) {
      try {
        const correction = await openai.chat.completions.create({
          model,
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
          lastError = null;
          break;
        }
      } catch (e: any) {
        lastError = e;
        if (!options.strictMode && (e.status === 404 || e.status === 403)) {
          console.warn(
            `⚠️ Transcription model ${model} unavailable, trying fallback...`,
          );
          continue;
        }
        break;
      }
    }

    if (lastError) {
      throw new Error(
        `VocalRoute Transcription Error (${lastError.status}): ${lastError.message}`,
      );
    }
  }

  // 2. Intent Resolution
  const targetModel = options.intentSummaryModel || "gpt-4o-mini";
  const modelQueue =
    options.strictMode && options.intentSummaryModel
      ? [options.intentSummaryModel]
      : [targetModel, ...FALLBACK_MODELS.filter((m) => m !== targetModel)];

  let resolutionError: any = null;

  for (const model of modelQueue) {
    try {
      const completion = await openai.chat.completions.create({
        model,
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

      return {
        ...result,
        transcript,
      } as VocalIntent;
    } catch (error: any) {
      resolutionError = error;
      if (
        !options.strictMode &&
        (error.status === 404 || error.status === 403)
      ) {
        console.warn(
          `⚠️ Intent model ${model} unavailable, trying fallback...`,
        );
        continue;
      }
      break;
    }
  }

  if (resolutionError) {
    throw new Error(
      `VocalRoute Intent Resolution Error (${resolutionError.status}): ${resolutionError.message}`,
    );
  }

  return { transcript, intent: "unknown", target: null, confidence: 0 };
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

  let bestMatch: {
    route: any;
    confidence: number;
    specificity: number;
  } | null = null;

  // Helper for word boundary matching
  const matchesWord = (text: string, phrase: string) => {
    const transcriptWords = text
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    const phraseWords = phrase
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0);

    // Check if ALL words in the phrase exist in the transcript
    return phraseWords.every((pw) =>
      transcriptWords.some((tw) => tw.includes(pw) || pw.includes(tw)),
    );
  };

  for (const route of registry) {
    let score = 0;
    const segments = route.path.split("/").filter(Boolean);
    const pathDepth = segments.length;

    // 1. Check direct intent matches
    if (route.intents) {
      for (const intent of route.intents) {
        const normalizedIntent = intent.toLowerCase();

        if (normalizedTranscript === normalizedIntent) {
          score = Math.max(score, 0.98);
        } else if (matchesWord(normalizedTranscript, normalizedIntent)) {
          const transcriptWords = normalizedTranscript.split(/\s+/).length;
          const intentWords = normalizedIntent.split(/\s+/).length;
          const ratio = intentWords / transcriptWords;
          score = Math.max(score, 0.7 + ratio * 0.25);
        }
      }
    }

    // 2. Check title matches
    if (route.title) {
      const normalizedTitle = route.title.toLowerCase();
      if (normalizedTranscript === normalizedTitle) {
        score = Math.max(score, 0.95);
      } else if (matchesWord(normalizedTranscript, normalizedTitle)) {
        const titleWords = normalizedTitle.split(/\s+/).length;
        const transcriptWords = normalizedTranscript.split(/\s+/).length;
        const ratio = titleWords / transcriptWords;
        score = Math.max(score, 0.75 + ratio * 0.15);
      }
    }

    // 3. Path-based heuristics
    const lastSegment = segments[segments.length - 1]?.toLowerCase();
    if (lastSegment && lastSegment.length > 2) {
      const normalizedSlug = lastSegment.replace(/[-_]/g, " ");
      if (normalizedTranscript === normalizedSlug) {
        score = Math.max(score, 0.9);
      } else if (matchesWord(normalizedTranscript, normalizedSlug)) {
        const slugWords = normalizedSlug.split(/\s+/).length;
        const transcriptWords = normalizedTranscript.split(/\s+/).length;
        const ratio = slugWords / transcriptWords;
        score = Math.max(score, 0.65 + ratio * 0.2);
      }
    }

    // 4. "My" route prioritization
    const isUserQuery =
      normalizedTranscript.startsWith("my ") ||
      normalizedTranscript.includes(" me ");
    const isPersonalRoute =
      route.path.includes("/my") ||
      route.path.includes("/me") ||
      route.path.includes("/user");

    if (isUserQuery && isPersonalRoute) {
      score += 0.05;
    } else if (isUserQuery && !isPersonalRoute) {
      score -= 0.25; // Heavier penalty to avoid false leads
    }

    const finalScore = Math.min(score, 0.99);
    const paramsCount = Array.isArray(route.params) ? route.params.length : 0;
    const currentSpecificity = (pathDepth as number) + paramsCount;

    // Selection logic
    if (!bestMatch || finalScore > bestMatch.confidence) {
      bestMatch = {
        route,
        confidence: finalScore,
        specificity: currentSpecificity,
      };
    } else if (
      Math.abs(finalScore - bestMatch.confidence) < 0.02 &&
      finalScore > 0.4
    ) {
      // Tie-breaker: choose the more specific route (usually deeper in the tree)
      if (currentSpecificity > bestMatch.specificity) {
        bestMatch = {
          route,
          confidence: finalScore,
          specificity: currentSpecificity,
        };
      }
    }
  }

  if (bestMatch && bestMatch.confidence >= 0.6) {
    return {
      intent: "navigate",
      target: bestMatch.route.path,
      confidence: bestMatch.confidence,
      transcript,
      reply: `Navigating to ${bestMatch.route.title || bestMatch.route.path}...`,
    };
  }

  return {
    transcript,
    intent: "unknown",
    target: null,
    confidence: 0,
    reply: "I didn't hear a valid command. I can execute tasks or navigate.",
  };
}
