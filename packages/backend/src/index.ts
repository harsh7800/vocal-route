import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

console.log("🔊 VocalRoute WS server running on ws://localhost:3001");

wss.on("connection", (socket) => {
  console.log("🟢 Client connected");

  let chunkCount = 0;
  let acceptingAudio = false;

  socket.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    if (msg.type === "audio-start") {
      acceptingAudio = true;
      chunkCount = 0;
    }

    if (msg.type === "audio-chunk" && acceptingAudio) {
      chunkCount++;
    }

    if (msg.type === "audio-stop") {
      acceptingAudio = false;
      console.log(`🛑 Audio stopped. Total chunks: ${chunkCount}`);

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
    console.log("🔴 Client disconnected");
  });
});
