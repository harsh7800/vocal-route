# Project Structure

```text
vocal-route/
├── packages/
│   └── sdk/                      # Core Vocal Route SDK (Tracked)
│       ├── src/
│       │   ├── ai/                 # AI / Intent resolution logic
│       │   ├── audio/              # Voice processing logic
│       │   ├── build/              # CLI logic and scanning
│       │   ├── components/         # UI Components
│       │   ├── generated/          # Auto-generated routing (internal)
│       │   ├── index.ts            # Entry point
│       │   ├── cli.ts              # CLI entry point
│       │   ├── provider.tsx        # React Context Provider
│       │   └── types.ts            # TypeScript types
│       └── package.json          # SDK dependencies
│
├── docs/                         # Documentation
├── package.json                  # Root monorepo configuration
├── README.md                     # Root project overview
├── tsconfig.base.json            # Shared TypeScript base configuration
└── yarn.lock                     # Yarn lockfile
```
