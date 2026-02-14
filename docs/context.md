# VocalRoute — System Context & Architecture (Agent-Consumable)

## Project Identity

VocalRoute is a deterministic AI-powered command runtime for React / Next.js applications.

It provides a global, persistent agent overlay that:

- Maps natural language → developer-defined capabilities
- Executes actions deterministically
- Resolves entities safely
- Validates structured payloads (optional schema)
- Confirms cross-page navigation
- Never manipulates DOM
- Never allows AI to choose APIs
- Never executes unregistered functionality

This is NOT:
- A chatbot
- A browser automation tool
- An IDE-style autonomous agent
- A free-form tool-calling system

This IS:
- A semantic command layer over an application

---

# Architectural Layers

## 1️⃣ AI Layer (Semantic Router)

AI is responsible ONLY for:

- Mapping natural language → `capabilityId`
- Extracting structured parameters (partial or full)

AI outputs strictly:

```json
{
  "capability": "capability.id",
  "params": {}
}


AI does NOT:

Choose APIs

Inspect DOM

Plan execution steps

Generate workflows

Perform infrastructure orchestration

2️⃣ Capability Registry

Capabilities are explicitly registered by developers.

Each capability may define:

id

scope (optional route scope)

entity (optional entity dependency)

schema (optional payload validation)

execute() (required)

Capability Types
Atomic Capability

Simple action, no entity, no schema.


registerCapability({
  id: "dashboard.refresh",
  execute: () => refreshDashboard()
})


Entity-Based Capability

Requires resolving an entity before execution.

registerCapability({
  id: "template.open",
  entity: { type: "template", param: "templateId" },
  execute: ({ templateId }) => openTemplate(templateId)
})

Structured Capability (Optional Schema)

Supports payload validation and dynamic clarification.

registerCapability({
  id: "derived.create",
  entity: { type: "template", param: "templateId" },
  schema: DerivedSchema,
  execute: (payload) => createDerived(payload)
})


Schema is optional.
Entity is optional.
Execution logic is always developer-defined.

3️⃣ Entity Registry (Client-Side)

Entity types are declared once.

registerEntityType("template", {
  getAll: () => templateStore.getState().templates,
  search: (query, all) => fuzzyMatch(query, all),
  label: (entity) => entity.name,
  value: (entity) => entity.id
})


The runtime handles:

Matching by name

Ambiguity detection

Selection UI

Resume execution

Entities are resolved client-side using application state.

4️⃣ Runtime Execution Engine

Execution pipeline:
User Input
  ↓
AI → capability + partial params
  ↓
Entity Resolution (if defined)
  ↓
Schema Validation (if defined)
  ↓
Clarification Loop (if required)
  ↓
Cross-Page Confirmation (if scope mismatch)
  ↓
Execute Developer Logic
  ↓
Completion



The runtime must support pause and resume.

5️⃣ Cross-Page Navigation Rules

If capability scope ≠ current route:

Sidebar asks for confirmation

Navigation only occurs after approval

Execution resumes automatically

All confirmation UI stays inside sidebar

No automatic navigation without permission.

6️⃣ Agent Persistence

Agent is mounted at root level

Global overlay

Persistent across route changes

Treated as a continuous session

Not page-bound

7️⃣ Introspection

Agent must support:

"What can I do here?"

"Can I update my profile?"

Rules:

"Here" → page-scoped capabilities

Broader question → check global registry

Never hallucinate capabilities

8️⃣ Agent State Machine

Minimum states:

type AgentMode =
  | "idle"
  | "listening"
  | "processing"
  | "clarifying"
  | "awaiting-confirmation"
  | "navigating"
  | "executing"
  | "completed"
  | "error"


UI renders strictly from state.

9️⃣ Safety Constraints

The system must:

Never manipulate DOM

Never allow AI to choose APIs

Never execute unregistered capabilities

Never auto-navigate across pages

Always require explicit registration

Execution is deterministic and developer-defined.