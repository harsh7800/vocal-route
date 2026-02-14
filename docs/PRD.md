
---

# 📄 2️⃣ `VocalRoute_Coding_Agent_Prompt.md`

```markdown
# SYSTEM PROMPT — Build VocalRoute Runtime (New Architecture)

You are implementing the core runtime for VocalRoute.

Follow the steps below strictly and sequentially.
Do not skip architectural layers.
Maintain determinism at all times.

---

# STEP 1 — Global Provider

Implement:

- VocalRouteProvider
- AgentOverlay (persistent)
- Global state store
- AgentMode state machine

Mount provider at root layout level.

The agent must persist across route changes.

---

# STEP 2 — Capability Registry

Implement:

- registerCapability(config)
- getCapabilityById(id)
- listCapabilitiesByScope(route)

Capability config must support:

- id (required)
- scope (optional)
- entity (optional)
- schema (optional)
- execute() (required)

Reject duplicate IDs.
Reject execution of unknown capability IDs.

---

# STEP 3 — Entity Registry

Implement:

- registerEntityType(type, config)
- resolveEntity(type, input)

Entity config must support:

- getAll()
- search(query, all)
- label(entity)
- value(entity)

Entity resolution must handle:

- No matches → error state
- One match → auto-resolve
- Multiple matches → enter clarifying state
- Resume execution after user selection

All entity resolution is client-side.

---

# STEP 4 — Runtime Execution Engine

Implement execution pipeline:

1. Start capability
2. Resolve entity if defined
3. Validate schema if defined
4. Detect missing required fields
5. Ask clarifying questions
6. Confirm cross-page navigation if scope mismatch
7. Execute capability
8. Mark completed
9. Handle errors

Execution must support pause and resume.

No synchronous assumptions.

---

# STEP 5 — Cross-Page Navigation Guard

If capability.scope !== currentRoute:

- Enter "awaiting-confirmation"
- Ask user inside sidebar
- On confirm → router.push(scope)
- Wait for route ready
- Resume execution automatically

No silent navigation.

---

# STEP 6 — Sidebar UI States

Render UI strictly based on AgentMode:

- listening
- processing
- clarifying
- awaiting-confirmation
- navigating
- executing
- completed
- error

All interaction remains inside sidebar.
No external modals.

---

# STEP 7 — Introspection Capability

Register internal system capability:

__system.listCapabilities

When invoked:

- Return page-scoped capabilities
- Include globally registered capabilities
- Provide descriptions
- Never hallucinate unregistered actions

---

# STEP 8 — AI Contract Enforcement

AI must return strictly:

```json
{
  "capability": "capability.id",
  "params": {}
}


If capability does not exist:

Enter error state

Do not execute anything

Never allow dynamic tool invocation.

STEP 9 — Schema Handling (Optional)

If capability defines schema:

Validate payload before execution

If missing fields → ask user

Resume once fields are provided

Only execute when schema passes validation

Schema must not be mandatory for all capabilities.

STEP 10 — Determinism Lock

Add safeguards:

No DOM querying

No API selection by AI

No auto workflow generation

No unregistered execution

No silent navigation

The runtime must be deterministic.

END GOAL

Produce a stable, deterministic command runtime that:

Uses AI only for semantic routing

Keeps execution developer-defined

Supports entity resolution

Supports schema validation

Supports cross-page confirmation

Persists globally

Operates entirely inside sidebar