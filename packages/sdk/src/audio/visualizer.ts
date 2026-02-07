export class VolumeVisualizer {
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private dataArray?: Uint8Array;
  private source?: MediaStreamAudioSourceNode;
  private stream?: MediaStream;
  private animationFrame?: number;
  private isAnalyzing = false;

  async start(
    onVolume: (volume: number) => void,
    onFrequencies?: (frequencies: number[]) => void,
  ) {
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
      // Smooth the frequency data transition
      this.analyser.smoothingTimeConstant = 0.8;
      this.source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      this.isAnalyzing = true;

      const analyze = () => {
        const { analyser } = this;
        if (!this.isAnalyzing || !analyser || !this.dataArray) return;

        analyser.getByteFrequencyData(this.dataArray as any);

        // Calculate RMS (Root Mean Square) for better loudness perception
        let sumSquares = 0;
        const currentFrequencies: number[] = [];

        for (let i = 0; i < this.dataArray.length; i++) {
          const normalized = this.dataArray[i] / 255;
          sumSquares += normalized * normalized;

          if (onFrequencies && i < 32) {
            // Only capture lower frequencies for visuals
            currentFrequencies.push(normalized);
          }
        }

        if (onFrequencies) {
          onFrequencies(currentFrequencies);
        }

        const rms = Math.sqrt(sumSquares / this.dataArray.length);

        // Boost the signal non-linearly to make quiet speech visible
        // Power 0.6 makes low volumes larger, multiplier 2.0 scales it up
        const boostedVolume = Math.pow(rms, 0.6) * 2.0;

        onVolume(Math.min(1, boostedVolume));

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
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }
}
