🔊 VocalRoute — Project Summary (Context for AI / Agent)
What has been built so far
1. Core Goal (Current Phase)

VocalRoute enables voice-based navigation inside a web application, where users can say things like:

“Take me to invoices”

“Go to dashboard”

“Open analytics”

The system:

understands spoken audio

converts speech → text

understands user intent

navigates only to pages that actually exist in the user’s project

safely rejects non-existent pages

2. Architecture Overview
Frontend (Next.js App)

Uses a VocalRoute SDK

Provides UI to:

start listening

stop listening

Handles navigation based on backend responses

Frontend is intentionally dumb

No AI logic

No intent logic

Only reacts to backend responses

SDK (Client-side, Browser-safe)

Responsible for:

capturing microphone audio

streaming audio chunks via WebSocket

sending a final audio-stop event

Will receive explicit navigation context from the app (pages, routes)

SDK does not:

scan files

infer project structure

contain secrets

SDK acts as a transport + context carrier

Backend (Node.js + WebSocket)

Owns all intelligence

Handles:

WebSocket connections

per-connection session lifecycle

audio chunk buffering

safety guards (timeouts, max chunks, ordering)

On audio-stop:

Combines audio chunks into a single audio file

Sends audio to OpenAI Speech-to-Text

Receives transcript

Sends transcript to AI Intent Extraction

Returns structured intent response to frontend

3. Audio Pipeline (Confirmed Working)
Microphone
 → AudioRecorder (SDK)
 → WebSocket audio chunks
 → Backend session buffer
 → Final audio file
 → OpenAI STT
 → Transcript


This pipeline is fully functional and stable.

4. AI Pipeline (Confirmed Working)
AI Layer 1 — Speech to Text

Uses OpenAI transcription models (currently mini variants for cost)

Converts finalized audio → transcript

AI Layer 2 — Intent Extraction

Takes transcript + allowed routes

Returns:

intent type

target page (if exists)

confidence

Guardrails ensure:

no hallucinated pages

unknown pages return intent: unknown

Example output:

{
  "intent": "navigate",
  "target": "invoices",
  "confidence": 0.92
}


Or:

{
  "intent": "unknown",
  "target": null,
  "confidence": 0.2
}

5. Safety & Reliability Features

One session per WebSocket connection

Max audio chunk limit

Session timeout

Strict message ordering

Rejects audio chunks before audio-start

Gracefully handles empty or failed transcripts

No filesystem scanning

No AI hallucination risk

6. Key Design Principle (Very Important)

The AI never guesses the project structure.

Instead:

The user’s app explicitly provides navigation context (pages & routes)

The SDK passes this context to the backend

The backend constrains AI strictly to that context

This ensures:

accuracy

safety

predictability

framework agnosticism