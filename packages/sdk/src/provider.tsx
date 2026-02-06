"use client";

import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { SpeechTranscriber } from './audio/transcriber';
import { VolumeVisualizer } from './audio/visualizer';
import { routeRegistry, getRoutePath } from './registry/routeMap';
import type { VocalIntent, RouteDefinition } from './types';

export type ContextType = {
      isListening: boolean;
      transcript: string;
      confidence: number;
      volume: number;
      error: string | null;
      startListening: () => Promise<void>;
      stopListening: () => Promise<void>;
};

const VocalRouteContext = createContext<ContextType | null>(null);

interface ProviderProps {
      children: ReactNode;
      routes?: RouteDefinition[];
}

export function VocalRouteProvider({
      children,
      routes = routeRegistry
}: ProviderProps) {
      const [isListening, setIsListening] = useState(false);
      const [transcript, setTranscript] = useState('');
      const [confidence, setConfidence] = useState(1);
      const [volume, setVolume] = useState(0);
      const [error, setError] = useState<string | null>(null);

      const transcriberRef = useRef<SpeechTranscriber | null>(null);
      const visualizerRef = useRef<VolumeVisualizer | null>(null);
      const router = useRouter();

      const processIntent = useCallback(async (text: string) => {
            try {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/intent";

                  const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                              text,
                              routes: routes.map(r => ({ id: r.id, aliases: r.aliases }))
                        })
                  });

                  if (!response.ok) throw new Error("Failed to process intent");

                  const intent: VocalIntent = await response.json();
                  console.log('🧠 Intent from server:', intent);

                  setTranscript(intent.transcript);
                  setConfidence(intent.confidence);

                  if (intent.intent === 'navigate' && intent.target && intent.confidence > 0.6) {
                        const path = getRoutePath(intent.target);
                        if (path) {
                              router.push(path);
                              setError(null);
                              // Auto-close after successful navigation
                              setTimeout(() => {
                                    setIsListening(false);
                              }, 500);
                        } else {
                              setError(`Route not found for target: ${intent.target}`);
                        }
                  } else if (intent.confidence <= 0.6) {
                        setError("I'm not sure what you meant. Could you try again?");
                  } else {
                        setError("Sorry, I didn't recognize that command.");
                  }
            } catch (err) {
                  console.error("❌ API Error:", err);
                  setError("Something went wrong. Please try again.");
            }
      }, [routes, router]);

      const startListening = async () => {
            console.log('🎤 startListening');
            setIsListening(true);
            setTranscript('');
            setConfidence(1);
            setVolume(0);
            setError(null);

            if (!transcriberRef.current) {
                  transcriberRef.current = new SpeechTranscriber();
            }

            if (!visualizerRef.current) {
                  visualizerRef.current = new VolumeVisualizer();
            }

            // Start sound visualization
            visualizerRef.current.start((v) => setVolume(v));

            // Start transcription
            transcriberRef.current.start((text: string, isFinal: boolean) => {
                  setTranscript(text);
                  if (isFinal) {
                        transcriberRef.current?.stop();
                        visualizerRef.current?.stop();

                        // Send text to API for intent extraction
                        processIntent(text);
                  }
            });
      };

      const stopListening = async () => {
            console.log('🛑 stopListening');
            setIsListening(false);
            transcriberRef.current?.stop();
            visualizerRef.current?.stop();
      };

      return (
            <VocalRouteContext.Provider value={{ isListening, transcript, confidence, volume, error, startListening, stopListening }}>
                  {children}
            </VocalRouteContext.Provider>
      );
}

export const useVocalRoute = () => {
      const ctx = useContext(VocalRouteContext);
      if (!ctx) throw new Error('useVocalRoute must be used inside provider');
      return ctx;
};
