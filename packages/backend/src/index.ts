import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (data) => {
    console.log("received: %s", data);
  });

  ws.send("welcome");
});

console.log("WebSocket server is running on ws://localhost:8080");
