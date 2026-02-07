📄 Product Requirements Document (PRD)
Product Name

VocalRoute

Problem Statement

Modern applications lack a reliable, safe, and developer-friendly way to support voice-based navigation. Existing voice systems often:

hallucinate routes

guess project structure

tightly couple to frameworks

behave unpredictably

VocalRoute solves this by making voice navigation project-aware, explicit, and constrained.

Target Users

Frontend developers (React / Next.js / SPA apps)

SaaS product teams

Dashboards & internal tools

Accessibility-focused applications

Current Scope (Phase 1 — Navigation)
Core Features

Voice-based navigation

Browser-native Speech-to-text transcription (STT)

AI-based intent extraction (Stateless Backend)

Project-aware routing

Explicit developer-provided navigation context

Safe handling of non-existent pages

Organic visual feedback & retry logic via SDK

Minimal frontend integration via SDK

Explicit Non-Goals (for now)

No file editing

No code generation

No repo scanning

No autonomous agent actions

Navigation Behavior (Phase 1)
User says Behavior
“Go to invoices” Navigate if page exists
“Open dashboard” Navigate if page exists
“Take me to client” Respond: page does not exist
“Go to banana” Respond: page does not exist
Developer Experience

Developers explicitly declare pages when initializing the SDK

SDK remains lightweight and framework-agnostic

Backend owns AI and security

No secrets in frontend

No magic inference

Future Scope (Phase 2 — Agentic Commands)

Once navigation is stable and trusted, VocalRoute will expand to agentic commands, such as:

“Create a new page”

“Add a route”

“Generate a component”

“Refactor a file”

⚠️ These will be:

opt-in

permission-based

confirmation-driven

diff-previewed

never autonomous by default

Agentic behavior is explicitly out of scope for Phase 1, but the architecture is designed to support it later without rewrites.

Key Product Philosophy

Explicit over implicit

Safe over magical

Constrained AI over free-form AI

Developer trust > AI autonomy

One-line positioning

VocalRoute is a project-aware voice navigation system that respects your app’s reality.
