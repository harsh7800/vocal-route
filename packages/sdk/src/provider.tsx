"use client";

import { createContext, useContext, useRef, useState, useCallback, type ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import { SpeechTranscriber } from './audio/transcriber';
import { VolumeVisualizer } from './audio/visualizer';
import { staticRegistry } from './generated/registry';
import { VoiceOverlay } from './components/VoiceOverlay';
import { VocalRouteButton } from './components/VocalRouteButton';
import { resolveLocalIntent } from './ai/resolver';
import type { VocalIntent, RouteRegistry } from './types';


export type ContextType = {
      isListening: boolean;
      isProcessing: boolean;
      transcript: string;
      confidence: number;
      volume: number;
      error: string | null;
      registry: RouteRegistry;
      startListening: () => Promise<void>;
      stopListening: () => Promise<void>;
};

const VocalRouteContext = createContext<ContextType | null>(null);

interface ProviderProps {
      children: ReactNode;
      routes?: RouteRegistry;
      /**
       * Whether to show the built-in voice overlay.
       * @default true
       */
      showOverlay?: boolean;
      /**
       * Customization for the built-in overlay.
       */
      overlayConfig?: {
            themeColor?: 'cyan' | 'blue' | 'purple';
            title?: string;
            type?: 'compact' | 'global';
      };
      /**
       * Whether to show the built-in trigger button.
       * @default false
       */
      showButton?: boolean;
      buttonConfig?: {
            position?: { top?: string; bottom?: string; left?: string; right?: string };
            className?: string;
            children?: React.ReactNode;
      };
}
export function VocalRouteProvider({ 
      children,
      routes = staticRegistry as unknown as RouteRegistry,
      showOverlay = true,
      overlayConfig,
      showButton = false,
      buttonConfig,
}: ProviderProps) {
      const [isListening, setIsListening] = useState(false);
      const [isProcessing, setIsProcessing] = useState(false);
      const [transcript, setTranscript] = useState('');
      const [confidence, setConfidence] = useState(1);
      const [volume, setVolume] = useState(0);
      const [error, setError] = useState<string | null>(null);

      const [registry, setRegistry] = useState<RouteRegistry>(routes);

      const transcriberRef = useRef<SpeechTranscriber | null>(null);
      const visualizerRef = useRef<VolumeVisualizer | null>(null);
      const router = useRouter();
      const pathname = usePathname();

      useEffect(() => {
            if (typeof window === 'undefined') return;

            const observeRoute = (path: string) => {
                  setRegistry(prev => {
                        return prev.map(route => {
                              if (route.path === path || (route.params && path.startsWith(route.path.split('[')[0]))) {
                                    const newConfidence = Math.min(0.95, (route.observed ? route.confidence + 0.05 : route.confidence + 0.2));
                                    return {
                                          ...route,
                                          confidence: newConfidence,
                                          observed: true
                                    };
                              }
                              return route;
                        });
                  });
            };

            observeRoute(pathname);

            const originalPushState = window.history.pushState;
            window.history.pushState = function (...args) {
                  const url = args[2];
                  if (typeof url === 'string') observeRoute(url);
                  return originalPushState.apply(this, args);
            };

            return () => {
                  window.history.pushState = originalPushState;
            };
      }, [pathname]);

      const processIntent = useCallback(async (text: string) => {
            setIsProcessing(true);
            try {
                  // Use the local resolver for backend-free operation
                  const intent = resolveLocalIntent(text, registry);

                  console.log('🧠 Intent result (local):', intent);

                  setTranscript(intent.transcript);
                  setConfidence(intent.confidence);

                  if (intent.intent === 'navigate' && intent.target && intent.confidence >= 0.7) {
                        const targetRoute = registry.find(r => r.path === intent.target);

                        if (targetRoute) {
                              // Handle parameter injection
                              let finalPath = targetRoute.path;
                              if (intent.params) {
                                    for (const [key, value] of Object.entries(intent.params)) {
                                          finalPath = finalPath.replace(`[${key}]`, value);
                                    }
                              }

                              router.push(finalPath);
                              setError(null);
                              setTimeout(() => {
                                    setIsListening(false);
                                    setIsProcessing(false);
                              }, 1200);
                              return;
                        }
                  }

                  if (intent.confidence < 0.7) {
                        setError("I'm not exactly sure what you mean. Could you rephrase that?");
                  } else {
                        setError("Sorry, I couldn't find a matching page for that command.");
                  }
                  setIsProcessing(false);
            } catch (err) {
                  console.error("❌ VocalRoute Error:", err);
                  setError("Something went wrong. Please try again.");
                  setIsProcessing(false);
            }
      }, [registry, router]);


      const startListening = async () => {
            if (!registry || registry.length === 0) {
                  console.warn("🔊 VocalRoute: No routes discovered. Voice navigation is disabled.");
                  setError("Voice navigation is currently unavailable.");
                  return;
            }

            setIsListening(true);
            setIsProcessing(false);
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

            visualizerRef.current.start((v) => setVolume(v));

            transcriberRef.current.start((text: string, isFinal: boolean) => {
                  setTranscript(text);
                  if (isFinal) {
                        transcriberRef.current?.stop();
                        visualizerRef.current?.stop();
                        processIntent(text);
                  }
            });
      };

      const stopListening = async () => {
            setIsListening(false);
            setIsProcessing(false);
            transcriberRef.current?.stop();
            visualizerRef.current?.stop();
      };

      return (
            <VocalRouteContext.Provider value={{
                  isListening,
                  isProcessing,
                  transcript,
                  confidence,
                  volume,
                  error,
                  registry,
                  startListening,
                  stopListening
            }}>
                  <NextTopLoader showSpinner={false} color={overlayConfig?.themeColor || "#22d3ee"} />
                  {children}
                  {showOverlay && (
                        <VoiceOverlay
                              isListening={isListening}
                              isProcessing={isProcessing}
                              transcript={transcript}
                              error={error}
                              volume={volume}
                              onClose={stopListening}
                              onRetry={startListening}
                              themeColor={overlayConfig?.themeColor}
                              title={overlayConfig?.title}
                              type={overlayConfig?.type}
                        />
                  )}
                  {showButton && (
                        <VocalRouteButton
                              {...buttonConfig}
                        />
                  )}
            </VocalRouteContext.Provider>
      );
}

export const useVocalRoute = () => {
      const ctx = useContext(VocalRouteContext);
      if (!ctx) throw new Error('useVocalRoute must be used inside provider');
      return ctx;
};
