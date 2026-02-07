# Vocal Route

Vocal Route is a monorepo containing a core SDK, a stateless backend for intent resolution, and a demo web application.

## Architecture
Vocal Route uses a modern, stateless architecture:
- **Client-Side Transcription:** Speech-to-text is handled in the browser using the Web Speech API.
- **Local Visualization:** Real-time audio analysis for a dynamic "liquid wobble" UI.
- **Stateless API:** A lightweight Node.js backend for AI-powered intent extraction.

## Structure

- `apps/demo-web`: A Next.js application demonstrating SDK integration.
- `packages/sdk`: The core library handling transcription, local visualization (`VolumeVisualizer`), and communication.
- `packages/backend`: A stateless Node.js HTTP server for mapping transcripts to route intents via OpenAI.

## Getting Started

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Configure Environment:**
   Create a `.env` file in `packages/backend`:
   ```env
   OPENAI_API_KEY=your_key
   TEXT_MODEL=gpt-4o-mini
   ```

3. **Run the demo application:**
   ```bash
   yarn demo:dev
   ```

4. **Run the backend server:**
   ```bash
   yarn backend:dev
   ```

## Key Features
- **Zero-Audio Backend:** No raw audio ever leaves the browser; only text transcripts are sent to the API.
- **Organic UI:** Real-time, volume-reactive blob animations.
- **Framework Agnostic:** Core logic is decoupled from the UI layer.
- **Safety First:** AI is constrained to a predefined route registry to prevent hallucinations.
