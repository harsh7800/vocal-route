export class VolumeVisualizer {
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private dataArray?: Uint8Array;
  private source?: MediaStreamAudioSourceNode;
  private stream?: MediaStream;
  private animationFrame?: number;
  private isAnalyzing = false;

  async start(onVolume: (volume: number) => void) {
    if (this.isAnalyzing) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioContext = new AudioContextClass();
      this.analyser = this.audioContext?.createAnalyser();
      if (!this.analyser || !this.audioContext) return;

      this.source = this.audioContext.createMediaStreamSource(this.stream);

      this.analyser.fftSize = 256;
      this.source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      this.isAnalyzing = true;

      const analyze = () => {
        const { analyser } = this;
        if (!this.isAnalyzing || !analyser || !this.dataArray) return;

        analyser.getByteFrequencyData(this.dataArray as any);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
          sum += this.dataArray[i];
        }
        const average = sum / this.dataArray.length;

        // Normalize to 0-1
        onVolume(average / 128);

        this.animationFrame = requestAnimationFrame(analyze);
      };

      analyze();
    } catch (err) {
      console.error("❌ VolumeVisualizer error:", err);
    }
  }

  stop() {
    this.isAnalyzing = false;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.audioContext) {
      this.audioContext.close().catch(console.error);
    }
    if (this.stream) {
        this.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
  }
}
