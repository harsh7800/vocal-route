
export class BrowserTTS {
  private static instance: BrowserTTS;
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  private constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = this.loadVoices.bind(this);
    }
  }

  public static getInstance(): BrowserTTS {
    if (!BrowserTTS.instance) {
      BrowserTTS.instance = new BrowserTTS();
    }
    return BrowserTTS.instance;
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
  }

  public speak(text: string, onStart?: () => void, onEnd?: () => void) {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select a decent default voice (Google US English or Microsoft David/Zira)
    const preferredVoice = this.voices.find(
      (voice) => 
        (voice.name.includes("Google") && voice.lang === "en-US") || 
        (voice.name.includes("Zira") && voice.lang === "en-US") ||
        (voice.lang === "en-US")
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
        if (onStart) onStart();
    };
    
    utterance.onend = () => {
        if (onEnd) onEnd();
    };
    
    utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        if (onEnd) onEnd();
    };

    this.synthesis.speak(utterance);
  }

  public stop() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }
}
