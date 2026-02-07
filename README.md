# VocalRoute AI

Powerful voice navigation and AI assistance for modern web applications.

VocalRoute allows users to navigate your Next.js application using voice commands. It handles transcription, intent resolution, and navigation entirely in the browser, providing a fast and private user experience.

## Monorepo Structure

-   `packages/sdk`: The core SDK (`@vocalroute-ai/sdk`) for React/Next.js applications.
-   `apps/demo-web`: A reference implementation using the SDK.
-   `packages/backend`: (Optional) Backend for more complex intent resolution.

## Getting Started

To add VocalRoute to your project:

### 1. Install the SDK
```bash
npm install @vocalroute-ai/sdk
```

### 2. Generate Route Registry
Run the CLI to discover your application routes:
```bash
npx vocalroute scan
```

### 3. Initialize Provider
Wrap your application in `app/layout.tsx`:
```tsx
import "@vocalroute-ai/sdk/vocalroute.css";
import { VocalRouteProvider } from "@vocalroute-ai/sdk";
import { staticRegistry } from "../vocalroute/registry";

export default function RootLayout({ children }) {
  return (
    <VocalRouteProvider routes={staticRegistry} showButton={true}>
      {children}
    </VocalRouteProvider>
  );
}
```

## Features

-   **Zero-Config Route Discovery:** Automatically maps your Next.js `app` or `pages` directory.
-   **Local processing:** Intent resolution happens in the browser—fast and secure.
-   **Premium UI:** Real-time volume-reactive animations and a modern voice overlay.
-   **Cross-Platform:** Works on all modern browsers supporting the Web Speech API.

## Development

If you are contributing to VocalRoute:

1.  **Install dependencies:**
    ```bash
    yarn install
    ```
2.  **Build packages:**
    ```bash
    yarn build
    ```
3.  **Run demo:**
    ```bash
    yarn demo:dev
    ```

## License

MIT
