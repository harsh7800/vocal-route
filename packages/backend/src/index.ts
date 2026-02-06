import { WebSocketServer } from "ws";

type SessionState = {
  id: string;
  startedAt: number;
  chunkCount: number;
  isRecording: boolean;
};

const wss = new WebSocketServer({ port: 3001 });

console.log("🔊 VocalRoute WS server running on ws://localhost:3001");

wss.on("connection", (socket) => {
  const session: SessionState = {
    id: crypto.randomUUID(),
    startedAt: Date.now(),
    chunkCount: 0,
    isRecording: false,
  };

  console.log(`🧩 Session created: ${session.id}`);

  const MAX_SESSION_MS = 30_000;
  const MAX_CHUNKS = 200;

  const interval = setInterval(() => {
    if (Date.now() - session.startedAt > MAX_SESSION_MS) {
      console.warn("⏱️ Session timed out");
      socket.close();
    }
  }, 1000);

  socket.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    // ❌ Reject invalid order
    if (msg.type === "audio-chunk" && !session.isRecording) {
      console.warn("⚠️ Chunk received before audio-start");
      return;
    }

    if (msg.type === "audio-start") {
      session.isRecording = true;
      session.chunkCount = 0;
      console.log("🎙️ Audio started");
      return;
    }

    if (msg.type === "audio-chunk") {
      session.chunkCount++;

      if (session.chunkCount > MAX_CHUNKS) {
        console.warn("⛔ Too many chunks, stopping session");
        session.isRecording = false;
        return;
      }

      console.log(`📦 Chunk #${session.chunkCount}`);
      return;
    }

    if (msg.type === "audio-stop") {
      session.isRecording = false;

      console.log(`🛑 Audio stopped. Total chunks: ${session.chunkCount}`);

      socket.send(
        JSON.stringify({
          intent: "navigate",
          target: "invoices",
          confidence: 0.95,
        }),
      );
    }
  });

  socket.on("close", () => {
    clearInterval(interval);
    console.log(`🔴 Session closed: ${session.id}`);
  });
});
