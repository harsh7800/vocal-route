import { resolveIntent } from "vocalroute-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, routes } = await req.json();

    if (!text || !routes) {
      return NextResponse.json(
        { error: "Missing text or routes" },
        { status: 400 },
      );
    }

    const intent = await resolveIntent(text, routes, {
      transcriptModel: process.env.TRANSCRIPTION_MODEL,
      intentSummaryModel: process.env.INTENT_MODEL,
      openaiApiKey: process.env.OPENAI_API_KEY,
    });

    return NextResponse.json(intent);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    console.error("VocalRoute API Error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
