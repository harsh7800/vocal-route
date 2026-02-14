🔊 VocalRoute — Project Summary (Context for AI / Agent)

## What has been built so far

### 1. Unified Agent Hub (V2.5.0-A1)
VocalRoute has evolved from simple voice navigation into a **Multimodal Agentic Interface**. It enables users to navigate and perform complex tasks using both **Voice** and **Text** commands, with all feedback consolidated into a unified side-panel.

### 2. Architecture Overview (Unified Hub Model)

#### Frontend (Next.js App)
- Uses the **VocalRoute SDK**.
- Integrates the `VocalRouteButton` (Trigger) and `AgentView` (Sidebar).
- **Zero-Feedback Trigger:** The button is a stateless entry point. All listening, processing, and results happen within the Sidebar.

#### SDK (Stateful Orchestrator)
- **Transcription (STT):** Browser-native Web Speech API (`SpeechTranscriber`).
- **State Management:** `VocalRouteProvider` manages a unified state for:
    - **Listening:** Real-time pulse and transcription.
    - **Processing:** AI intent resolution and "Thinking" state.
    - **Agent State:** Managing the active `Agent` instance, current objectives, and step-by-step progress.
- **Multimodal Input:** Supports both voice (via microphone) and manual typing (via the footer input in `AgentView`).
- **Unified Feedback:** The sidebar is the single source of truth for the user. It slides in automatically when voice is triggered or an agent task starts.

#### Agent Core (Logic Layer)
- **Objective Driven:** Actions are grouped into high-level objectives.
- **Step-by-Step Execution:** Tasks are broken down into discrete steps (Planning, Navigating, Observing, Acting).
- **Safe Execution:** "Confirmation" steps are baked in for critical actions, requiring explicit user approval before proceeding.

#### Backend (Node.js Stateless API)
- **Intent Extraction:** Maps user input (voice or text) to specific route IDs or Agent actions using OpenAI.
- **Structured Response:** Returns intent, target, and confidence scores to drive the SDK orchestrator.

### 3. Interaction Pipeline
1. **Input:** User clicks trigger (starts voice) or types command in the sidebar footer.
2. **Analysis:** SDK resolves intent via the AI Backend.
3. **Execution:** 
    - **Simple Navigation:** Redirects immediately using `next/navigation`.
    - **Agent Task:** Sidebar slides open (if closed), shows the objective, and begins the step-by-step progress animation.
4. **Verification:** For critical actions, the agent pauses and shows a "Confirm" dialog.
5. **Completion:** Agent finishes the task and remains in a "Completed" state for review.

### 4. Key Design Principles
- **Consolidated UI:** No global orbs or scattered feedback. Every interaction lives in the sidebar.
- **Explicit over Implicit:** The agent never guesses. It follows the route registry and structured task definitions.
- **Permission-Based:** Critical actions always require manual confirmation.
- **Snapped Response:** Direct navigation is optimized for speed; complex tasks are optimized for transparency/feedback.