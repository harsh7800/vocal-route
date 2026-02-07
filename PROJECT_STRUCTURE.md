# Project Structure

```text
vocal-route/
├── apps/
│   └── demo-web/                 # Next.js 16 application (Consumer)
│       ├── app/                    # Next.js App Router directory
│       │   ├── api/                # API routes
│       │   │   └── vocalroute/
│       │   │       └── route.ts
│       │   ├── invoices/           # Invoices page
│       │   │   └── page.tsx
│       │   ├── settings/           # Settings page
│       │   │   └── page.tsx
│       │   ├── favicon.ico
│       │   ├── globals.css
│       │   ├── layout.tsx          # Root layout with VocalRouteProvider
│       │   └── page.tsx            # Home page with VocalRouteButton
│       ├── components/           # UI Components
│       │   ├── DebugPanel.tsx
│       │   └── VocalRouteButton.tsx # Test button for SDK
│       ├── hooks/                # Frontend hooks
│       │   └── useVocalRoute.ts
│       ├── biome.json            # Linting and formatting config
│       ├── next.config.ts        # Next.js configuration
│       ├── vocalroute/           # Generated route registry (via CLI)
│       │   ├── registry.json
│       │   └── registry.ts
│       ├── package.json          # App dependencies
│       └── tsconfig.json         # App TypeScript configuration
│
├── packages/
│   ├── sdk/                      # Core Vocal Route SDK
│   │   ├── src/
│   │   │   ├── ai/                 # AI / Intent resolution logic
│   │   │   │   └── resolver.ts
│   │   │   ├── audio/              # Voice processing logic
│   │   │   │   ├── transcriber.ts
│   │   │   │   └── visualizer.ts
│   │   │   ├── build/              # CLI logic and scanning
│   │   │   │   ├── scanner.ts
│   │   │   │   └── intent-generator.ts
│   │   │   ├── components/         # UI Components
│   │   │   │   ├── VoiceOverlay.tsx
│   │   │   │   └── VocalRouteButton.tsx
│   │   │   ├── generated/          # Auto-generated routing (internal)
│   │   │   ├── index.ts            # Entry point
│   │   │   ├── cli.ts              # CLI entry point
│   │   │   ├── provider.tsx        # React Context Provider
│   │   │   └── types.ts            # TypeScript types
│   │   └── package.json          # SDK dependencies
│   │
│   └── backend/                  # Vocal Route Backend
│       ├── src/
│       │   ├── intent/             # Intent resolution logic
│       │   │   └── resolver.ts
│       │   ├── sessions/           # Session management
│       │   │   └── store.ts
│       │   ├── ws/                 # WebSocket handlers
│       │   │   └── audio.ts
│       │   ├── index.ts            # Server entry point
│       │   └── types.ts
│       ├── package.json          # Backend dependencies
│       └── tsconfig.json         # Backend TypeScript configuration
│
├── docs/                         # Documentation
├── package.json                  # Root monorepo configuration (Yarn Workspaces)
├── README.md                     # Root project overview
├── tsconfig.base.json            # Shared TypeScript base configuration
└── yarn.lock                     # Yarn lockfile
```
