# Vocal Route

Vocal Route is a monorepo containing a core SDK, a backend for audio handling, and a demo web application.

## Structure

- `apps/demo-web`: A Next.js 16 application demonstrating the SDK usage.
- `packages/sdk`: Core SDK for microphone capture and WebSocket communication.
- `packages/backend`: Node.js backend for WebSocket audio handling and intent resolution.

## Getting Started

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Run the demo application:

   ```bash
   yarn demo:dev
   ```

3. Run the backend development server:
   ```bash
   yarn backend:dev
   ```
