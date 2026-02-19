"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceListenerProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  interimText: string;
  disabled?: boolean;
}

export const VoiceListener: React.FC<VoiceListenerProps> = ({
  isListening,
  onStart,
  onStop,
  interimText,
  disabled = false,
}) => {
  return (
    <AnimatePresence>
      {isListening && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-lg">
            {/* Waveform animation */}
            <button
              onClick={onStop}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 transition-colors shadow-sm shadow-rose-200"
            >
              <span className="material-symbols-outlined text-white text-[16px]">
                stop
              </span>
            </button>

            <div className="flex-1 min-w-0">
              {interimText ? (
                <p className="text-xs text-slate-700 truncate font-medium">
                  {interimText}
                </p>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-end gap-0.5 h-4">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-[3px] bg-rose-400 rounded-full"
                        animate={{
                          height: ["4px", "16px", "8px", "14px", "6px"],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-rose-500 font-medium">
                    Listening...
                  </span>
                </div>
              )}
            </div>

            <div className="shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Hook that manages voice input using the Web Speech API.
 * Returns controls and state for voice-to-text in the chat.
 */
export function useVoiceInput(onFinalTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<any>(null);

  // State to track text across engine restarts
  const pendingTextRef = useRef<string>("");
  const accumulatedTextRef = useRef<string>("");
  const isIntentionalStopRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<any>(null);

  // Use a ref for the callback to avoid stale closures
  const callbackRef = useRef(onFinalTranscript);
  callbackRef.current = onFinalTranscript;

  const stop = useCallback(() => {
    console.log("[VoiceInput] Stopping...");
    isIntentionalStopRef.current = true;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      // We don't nullify recognitionRef here immediately, onend will handle cleanup
    }
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("[VoiceInput] Speech recognition not supported.");
      return;
    }

    // Stop existing
    if (recognitionRef.current) {
      isIntentionalStopRef.current = true;
      recognitionRef.current.stop();
    }

    // Reset state for new session
    isIntentionalStopRef.current = false;
    pendingTextRef.current = "";
    accumulatedTextRef.current = "";
    setInterimText("");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    const resetSilenceTimer = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        console.log("[VoiceInput] Auto-stopping due to silence...");
        stop();
      }, 3000); // 3 seconds silence timeout
    };

    recognition.onstart = () => {
      console.log("[VoiceInput] Started");
      setIsListening(true);
      resetSilenceTimer();
    };

    recognition.onresult = (event: any) => {
      resetSilenceTimer();

      // Reconstruct full transcript from current session results
      let sessionTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        sessionTranscript += event.results[i][0].transcript;
      }

      pendingTextRef.current = sessionTranscript;

      // Update UI with total text (previous sessions + current session)
      const totalText = (accumulatedTextRef.current + " " + sessionTranscript).trim();
      setInterimText(totalText);
    };

    recognition.onerror = (event: any) => {
      console.error("[VoiceInput] Error:", event.error);
      if (event.error === 'no-speech') {
        // Ignore no-speech errors, just letting it run or restart if needed
        return;
      }
      // For other errors, we might want to stop or let the keep-alive handle it
      // stopping explicitly prevents infinite error loops
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        isIntentionalStopRef.current = true;
        stop();
      }
    };

    recognition.onend = () => {
      console.log("[VoiceInput] Ended. Intentional:", isIntentionalStopRef.current);

      if (isIntentionalStopRef.current) {
        // Finalize
        const finalText = (accumulatedTextRef.current + " " + pendingTextRef.current).trim();
        if (finalText) {
          callbackRef.current(finalText);
        }

        setIsListening(false);
        setInterimText("");
        pendingTextRef.current = "";
        accumulatedTextRef.current = "";
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        recognitionRef.current = null;
      } else {
        // Premature stop (browser limit, network, etc.) -> RESTART
        // Commit current session text to accumulated
        accumulatedTextRef.current = (accumulatedTextRef.current + " " + pendingTextRef.current).trim();
        pendingTextRef.current = "";

        console.log("[VoiceInput] Restarting session...");
        try {
          recognition.start();
        } catch (e) {
          console.error("Failed to restart recognition", e);
          // Fallback if immediate restart fails
          setIsListening(false);
        }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition", e);
    }
  }, [stop]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        isIntentionalStopRef.current = true; // Ensure we don't restart on unmount
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  return { isListening, interimText, start, stop };
}
