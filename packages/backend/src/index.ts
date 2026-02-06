import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

console.log("🔊 VocalRoute WS server running on ws://localhost:3001");

wss.on("connection", (socket) => {
  console.log("🟢 Client connected");

  socket.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    if (msg.type === "audio-stop") {
      console.log("🛑 Audio stopped, sending intent");

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
