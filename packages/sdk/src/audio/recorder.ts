export class AudioRecorder {
  private mediaRecorder?: MediaRecorder;
  private chunks: Blob[] = [];

  async start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.mediaRecorder.start();
  }

  stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) return;

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: "audio/webm" });
        this.chunks = [];
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }
}
