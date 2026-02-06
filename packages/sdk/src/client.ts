export class VocalRouteClient {
  private ws?: WebSocket;
  private isOpen = false;

  onMessage?: (data: any) => void;

  connect() {
    console.log("🔵 Attempting WS connection...");

    this.ws = new WebSocket("ws://localhost:3001");

    this.ws.onopen = () => {
      this.isOpen = true;
      console.log("🟢 WS connected (client)");
    };

    this.ws.onerror = (err) => {
      console.error("🔴 WS error", err);
    };

    this.ws.onclose = () => {
      this.isOpen = false;
      console.log("🟡 WS closed");
    };

    this.ws.onmessage = (event) => {
      console.log("📩 WS message received:", event.data);
      const data = JSON.parse(event.data);
      this.onMessage?.(data);
    };
  }

  send(type: string, payload?: any) {
    if (!this.ws || !this.isOpen) {
      console.warn("⚠️ WS not open yet, message skipped:", type);
      return;
    }

    console.log("➡️ WS send:", type);
    this.ws.send(JSON.stringify({ type, payload }));
  }

  disconnect() {
    this.ws?.close();
  }
}
