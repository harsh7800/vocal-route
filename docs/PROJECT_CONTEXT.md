🔊 VocalRoute — Project Summary (Context for AI / Agent)

## What has been built so far

### 1. Core Goal (Current Phase)
VocalRoute enables voice-based navigation inside a web application. Users can navigate by voice:
- “Take me to invoices”
- “Go to dashboard”
- “Open analytics”

The system handles the full pipeline from hearing the user to performing the page redirection, with rich visual feedback.

### 2. Architecture Overview (Stateless HTTP Model)

#### Frontend (Next.js App)
- Uses the **VocalRoute SDK**.
- Provides a rich, organic UI overlay (`OrganicVoiceOverlay`) for real-time feedback.
- **Intentionally lean:** Only defines routes and reacts to SDK/Backend responses.

#### SDK (Client-side hub)
- **Transcription (STT):** Handles speech-to-text entirely in the browser using the Web Speech API (`SpeechTranscriber`). No raw audio is sent to the server.
- **Visual Feedback:** Analyzes microphone levels locally (`VolumeVisualizer`) to drive a "liquid wobble" blob animation.
- **Navigation:** Orchestrates the intent flow and handles the physical redirection using `next/navigation`.
- **Stateless Communication:** Sends the final transcript to the backend via a simple HTTP POST request.
- **UX Polish:** Integrated `nextjs-toploader` for automatic navigation progress indicators.

#### Backend (Node.js Stateless API)
- **Stateless:** No persistent connections, sessions, or heartbeats.
- **Intent Extraction:** Receives the transcript and available routes, then uses OpenAI to map the text to a specific route ID.
- **Predictable:** strictly returns structured JSON with the intent, target, and confidence score.

### 3. Navigation Pipeline (Optimized)
1. **Microphone Capture** (Browser)
2. **Local Transcription** (Web Speech API)
3. **Volume Analysis** (Web Audio API -> Visual Wobble)
4. **Final Transcript** -> HTTP POST (Backend)
5. **Intent Resolution** (OpenAI -> Target Route)
6. **Execution** (Next.js Router + TopLoader)

This pipeline is optimized for speed and scalability, removing the complexity of WebSocket session management.

### 4. AI Pipeline
- **AI Layer 1 — Speech to Text:** Optimized through browser-native Web Speech API (zero latency, zero server cost).
- **AI Layer 2 — Intent Extraction:** Backend-side OpenAI call. Takes the transcript + explicit route registry to ensure no hallucinations.

### 5. UI & Feedback Features
- **Organic Visualizer:** A "liquid wobble" blob that grows and agitates based on voice volume.
- **Explicit States:** The UI clearly distinguishes between *Listening*, *Speaking* (detected voice), *Thinking* (API processing), and *Understood* (Success).
- **Retry Logic:** Integrated "Try Again" button for when commands aren't recognized or errors occur.
- **Toploader:** Automatic progress bar at the top of the screen during redirections.

### 6. Key Design Principle
The AI never guesses the project structure. The application explicitly provides a route registry, and the backend constrains the AI's output strictly to that registry. This ensure 100% accuracy and prevents the AI from suggesting non-existent pages.