import OpenAI from "openai";

export class SpeechTranscriber {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isListening = false;
  private openai: OpenAI | null = null;
  private recognition: any = null;

  constructor(apiKey?: string, baseURL?: string) {
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        baseURL,
        dangerouslyAllowBrowser: true,
      });
    }

    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
      }
    }
  }

  async start(onResult: (transcript: string, isFinal: boolean) => void) {
    if (this.isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 1. Start High-Quality Recording for Whisper
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };
      this.mediaRecorder.start();

      // 2. Start Browser Recognition for Real-time Feedback
      if (this.recognition) {
        this.recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          const currentTranscript = finalTranscript || interimTranscript;
          if (currentTranscript) {
            onResult(currentTranscript, false); // false = interim/browser result
          }
        };
        this.recognition.start();
      }

      this.isListening = true;
    } catch (err) {
      console.error("Microphone Access Error:", err);
    }
  }

  async stop(): Promise<string | null> {
    if (!this.isListening) return null;

    this.isListening = false;

    // Stop browser recognition
    if (this.recognition) {
      this.recognition.onresult = null;
      this.recognition.stop();
    }

    // Stop MediaRecorder and get Whisper result
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        this.mediaRecorder?.stream.getTracks().forEach((track) => track.stop());

        if (this.openai && audioBlob.size > 0) {
          try {
            const file = new File([audioBlob], "audio.webm", {
              type: "audio/webm",
            });
            const transcription = await this.openai.audio.transcriptions.create(
              {
                file: file,
                model: "whisper-1",
              },
            );
            resolve(transcription.text);
          } catch (error) {
            console.error("Whisper Transcription Error:", error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      this.mediaRecorder.stop();
    });
  }
}
