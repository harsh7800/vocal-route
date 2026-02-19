import OpenAI from "openai";

export class BrowserTTS {
  private static instance: BrowserTTS;
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private openai: OpenAI | null = null;
  private voiceModel: string = "alloy";
  private speechModel: string = "tts-1";
  private currentAudio: HTMLAudioElement | null = null;

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

  public configure(
    apiKey?: string,
    baseURL?: string,
    voice?: string,
    model?: string,
  ) {
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        baseURL,
        dangerouslyAllowBrowser: true,
      });
    }
    if (voice) this.voiceModel = voice;
    if (model) this.speechModel = model;
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
  }

  public async speak(text: string, onStart?: () => void, onEnd?: () => void) {
    if (this.openai) {
      try {
        const mp3 = await this.openai.audio.speech.create({
          model: this.speechModel,
          voice: this.voiceModel as any,
          input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        const blob = new Blob([buffer], { type: "audio/mpeg" });
        if (this.currentAudio) {
          this.currentAudio.pause();
          this.currentAudio = null;
        }

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        this.currentAudio = audio;

        audio.onplay = () => {
          if (onStart) onStart();
        };

        audio.onended = () => {
          if (onEnd) onEnd();
          URL.revokeObjectURL(url);
          if (this.currentAudio === audio) this.currentAudio = null;
        };

        audio.onerror = (e) => {
          console.error("OpenAI TTS Audio Error:", e);
          if (onEnd) onEnd();
          URL.revokeObjectURL(url);
          if (this.currentAudio === audio) this.currentAudio = null;
        };

        await audio.play();
        return;
      } catch (error) {
        console.error("OpenAI TTS Error, falling back to browser:", error);
      }
    }

    // Fallback to Browser SpeechSynthesis
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // ... rest of fallback logic remains same
    const preferredVoice = this.voices.find(
      (voice) =>
        (voice.name.includes("Google") && voice.lang === "en-US") ||
        (voice.name.includes("Zira") && voice.lang === "en-US") ||
        voice.lang === "en-US",
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
      console.error("Browser TTS Error:", e);
      if (onEnd) onEnd();
    };

    this.synthesis.speak(utterance);
  }

  public stop() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }
}
