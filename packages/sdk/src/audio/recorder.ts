export class AudioRecorder {
  private mediaRecorder?: MediaRecorder;

  async start(onChunk: (chunk: Blob) => void) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm",
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        onChunk(e.data);
      }
    };

    // emit chunks every 250ms
    this.mediaRecorder.start(250);
  }

  stop() {
    this.mediaRecorder?.stop();
  }
}
