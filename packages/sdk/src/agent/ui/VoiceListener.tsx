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
  const pendingTextRef = useRef<string>("");
  const submittedRef = useRef<boolean>(false);
  // Use a ref for the callback to avoid stale closures
  const callbackRef = useRef(onFinalTranscript);
  callbackRef.current = onFinalTranscript;

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("[VoiceInput] Speech recognition not supported in this browser.");
      return;
    }

    // Stop any existing session
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    pendingTextRef.current = "";
    submittedRef.current = false;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimText("");
      submittedRef.current = false;
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Track the latest text for submission on end
      const currentText = finalTranscript || interimTranscript;
      if (currentText) {
        pendingTextRef.current = currentText;
        setInterimText(currentText);
      }

      if (finalTranscript && !submittedRef.current) {
        submittedRef.current = true;
        // Small delay to show the final text before submitting
        setTimeout(() => {
          callbackRef.current(finalTranscript.trim());
          setIsListening(false);
          setInterimText("");
          recognitionRef.current = null;
        }, 200);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("[VoiceInput] Recognition error:", event.error);
      // Don't stop on 'no-speech' — just let it end naturally
      if (event.error !== 'no-speech') {
        stop();
      }
    };

    recognition.onend = () => {
      // If recognition ended but we haven't submitted, submit the pending text
      if (!submittedRef.current && pendingTextRef.current.trim()) {
        submittedRef.current = true;
        const text = pendingTextRef.current.trim();
        callbackRef.current(text);
      }
      pendingTextRef.current = "";
      setIsListening(false);
      setInterimText("");
      recognitionRef.current = null;
    };

    recognition.start();
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return { isListening, interimText, start, stop };
}
