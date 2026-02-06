import "dotenv/config";
import * as http from "http";
import { extractIntent } from "./intent/resolver";

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // Simple CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/intent") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        const { text, routes } = payload;

        console.log("📝 Received Transcript:", text);

        // routes is an array of { id, aliases }
        const routeContext = routes.map(
          (r: { id: string; aliases?: string[] }) =>
            `${r.id}${r.aliases?.length ? ` (${r.aliases.join(", ")})` : ""}`,
        );

        const intent = await extractIntent(text, routeContext);
        console.log("🧠 Intent extracted:", intent);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            ...intent,
            transcript: text,
          }),
        );
      } catch (error) {
        console.error("❌ Error processing request:", error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`🔊 VocalRoute API server running on http://localhost:${PORT}`);
});
