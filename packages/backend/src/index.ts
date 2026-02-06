import "dotenv/config";
import { WebSocketServer } from "ws";
import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";
import { extractIntent } from "./intent/resolver";
type SessionState = {
  id: string;
  startedAt: number;
  chunkCount: number;
  isRecording: boolean;
  audioChunks: Buffer[];
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const wss = new WebSocketServer({ port: 3001 });

console.log("🔊 VocalRoute WS server running on ws://localhost:3001");

wss.on("connection", (socket) => {
  const session: SessionState = {
    id: crypto.randomUUID(),
    startedAt: Date.now(),
    chunkCount: 0,
    isRecording: false,
    audioChunks: [],
  };

  console.log(`🧩 Session created: ${session.id}`);

  const MAX_SESSION_MS = 30_000;
  const MAX_CHUNKS = 200;

  const routes = ["dashboard", "invoices", "analytics", "settings", "profile"];

  const interval = setInterval(() => {
    if (Date.now() - session.startedAt > MAX_SESSION_MS) {
      console.warn("⏱️ Session timed out");
      socket.close();
    }
  }, 1000);

  socket.on("message", async (data) => {
    const msg = JSON.parse(data.toString());

    // ❌ Invalid order
    if (msg.type === "audio-chunk" && !session.isRecording) {
      console.warn("⚠️ Chunk received before audio-start");
      return;
    }

    if (msg.type === "audio-start") {
      session.isRecording = true;
      session.chunkCount = 0;
      session.audioChunks = [];
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

      session.audioChunks.push(Buffer.from(msg.payload, "base64"));

      console.log(`📦 Chunk #${session.chunkCount}`);
      return;
    }

    if (msg.type === "audio-stop") {
      session.isRecording = false;

      console.log(`🛑 Audio stopped. Total chunks: ${session.chunkCount}`);

      // 1️⃣ Write audio file
      const audioBuffer = Buffer.concat(session.audioChunks);
      const filePath = path.join(process.cwd(), "tmp", `${session.id}.webm`);

      fs.writeFileSync(filePath, audioBuffer);

      // 2️⃣ Speech → Text
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "gpt-4o-transcribe",
      });

      const transcript = transcription.text;
      console.log("📝 Transcript:", transcript);

      if (!transcript) {
        socket.send(
          JSON.stringify({
            intent: "unknown",
            target: null,
            confidence: 0,
            transcript: "",
          }),
        );
        fs.unlink(filePath, () => {});
        return;
      }

      // 3️⃣ Text → Intent (AI)
      const intent = await extractIntent(transcript, routes);
      console.log("🧠 Intent:", intent);

      // 4️⃣ Respond to client
      socket.send(
        JSON.stringify({
          ...intent,
          transcript,
        }),
      );

      fs.unlink(filePath, () => {});
      session.audioChunks = [];
    }
  });

  socket.on("close", () => {
    clearInterval(interval);
    console.log(`🔴 Session closed: ${session.id}`);
  });
});
