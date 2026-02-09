"use client";

import { createContext, useContext, useRef, useState, useCallback, type ReactNode, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import { SpeechTranscriber } from './audio/transcriber';
import { VolumeVisualizer } from './audio/visualizer';
import { BrowserTTS } from './audio/tts';
import { staticRegistry } from './generated/registry';
import { VoiceOverlay } from './components/VoiceOverlay';
import { VocalRouteButton } from './components/VocalRouteButton';
import { resolveLocalIntent, resolveIntent } from './ai/resolver';
import type { VocalIntent, RouteRegistry, VocalAIConfig } from './types';


export type ContextType = {
      isListening: boolean;
      isProcessing: boolean;
      transcript: string;
      confidence: number;
      volume: number;
      frequencies?: number[];
      agentReply: string | null;
      isSpeaking: boolean;
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
      /**
       * AI Configuration for model selection and fallbacks.
       */
      aiConfig?: VocalAIConfig;
}
export function VocalRouteProvider({ 
      children,
      routes = staticRegistry as unknown as RouteRegistry,
      showOverlay = true,
      overlayConfig,
      showButton = false,
      buttonConfig,
      aiConfig,
}: ProviderProps) {
      const [isListening, setIsListening] = useState(false);
      const [isProcessing, setIsProcessing] = useState(false);
      const [transcript, setTranscript] = useState('');
      const [confidence, setConfidence] = useState(1);
      const [volume, setVolume] = useState(0);
      const [frequencies, setFrequencies] = useState<number[]>([]);
      const [agentReply, setAgentReply] = useState<string | null>(null);
      const [isSpeaking, setIsSpeaking] = useState(false);
      const [error, setError] = useState<string | null>(null);

      const [registry, setRegistry] = useState<RouteRegistry>(routes);

      const transcriberRef = useRef<SpeechTranscriber | null>(null);
      const visualizerRef = useRef<VolumeVisualizer | null>(null);
      const ttsRef = useRef<BrowserTTS | null>(null);
      const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
      const router = useRouter();
      const pathname = usePathname();
      const currentParams = useParams();

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
                  let intent: VocalIntent;

                  // 1. Try AI Resolution if enabled and API Key is present
                  if (aiConfig?.enabled && aiConfig?.openaiApiKey) {
                        try {
                              intent = await resolveIntent(text, registry, {
                                    openaiApiKey: aiConfig.openaiApiKey,
                                    baseURL: aiConfig.baseURL,
                                    intentSummaryModel: aiConfig.intentModel,
                                    transcriptModel: aiConfig.transcriptModel,
                                    strictMode: aiConfig.strictMode,
                              });

                              // If AI confidence is low, we might still want to try local as a safety net
                              if (intent.intent === 'unknown' || intent.confidence < 0.5) {
                                    const localIntent = resolveLocalIntent(text, registry);
                                    if (localIntent.confidence > intent.confidence) {
                                          intent = localIntent;
                                    }
                              }
                        } catch (e: any) {
                              if (aiConfig.fallbackToLocal) {
                                    console.warn("⚠️ AI Intent resolution failed, falling back to local:", e.message);
                                    intent = resolveLocalIntent(text, registry);
                              } else {
                                    console.error("❌ VocalRoute AI Error:", e.message);
                                    setError(e.message);
                                    setIsProcessing(false);
                                    return;
                              }
                        }
                  } else {
                        // 2. Default to Local Resolution (Backend-free)
                        intent = resolveLocalIntent(text, registry);
                  }

                  console.log('🧠 Intent result:', intent);

                  setTranscript(intent.transcript);
                  setConfidence(intent.confidence);

                  // Handle TTS Reply
                  if (intent.reply) {
                        setAgentReply(intent.reply);
                        if (!ttsRef.current) {
                              ttsRef.current = BrowserTTS.getInstance();
                        }

                        setIsSpeaking(true);
                        ttsRef.current.speak(intent.reply,
                              () => setIsSpeaking(true),
                              () => {
                                    setIsSpeaking(false);
                                    // Navigate only after speech if it's a navigation intent
                                    if (intent.intent === 'navigate' && intent.target && intent.confidence >= 0.7) {
                                          finishNavigation(intent);
                                    }
                              }
                        );
                  } else {
                        // Fallback if no reply provided
                        finishNavigation(intent);
                  }

                  function finishNavigation(intent: VocalIntent) {
                        if (intent.intent === 'navigate' && intent.target && intent.confidence >= 0.7) {
                              const targetRoute = registry.find(r => r.path === intent.target);

                              if (targetRoute) {
                                    // Handle parameter injection
                                    let finalPath = targetRoute.path;

                                    // 1. Fill from current context (structural params like [locale])
                                    if (currentParams) {
                                          for (const [key, value] of Object.entries(currentParams)) {
                                                const val = Array.isArray(value) ? value.join('/') : String(value);
                                                finalPath = finalPath.replace(`[${key}]`, val);
                                          }
                                    }

                                    // 2. Fill from intent-extracted params (business params like [adId])
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
                                          setAgentReply(null);
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
                  }

            } catch (err) {
                  console.error("❌ VocalRoute Error:", err);
                  setError("Something went wrong. Please try again.");
                  setIsProcessing(false);
            }
      }, [registry, router, currentParams, aiConfig]);


      const startListening = async () => {
            if (!registry || registry.length === 0) {
                  console.warn("🔊 VocalRoute: No routes discovered. Voice navigation is disabled.");
                  setError("Voice navigation is currently unavailable.");
                  return;
            }

            setIsListening(true);
            setIsProcessing(false);
            setTranscript('');
            setAgentReply(null);
            setFrequencies([]);
            setIsSpeaking(false);
            setConfidence(1);
            setVolume(0);
            setError(null);

            if (!transcriberRef.current) {
                  transcriberRef.current = new SpeechTranscriber();
            }

            if (!visualizerRef.current) {
                  visualizerRef.current = new VolumeVisualizer();
            }

            visualizerRef.current.start((v) => {
                  setVolume((prev) => {
                        // Smooth the volume transition: 0.8 * old + 0.2 * new
                        // This prevents jagged movements in the UI
                        return prev * 0.8 + v * 0.2;
                  });
            }, (freqs) => {
                  setFrequencies(freqs);
            });

            transcriberRef.current.start((text: string, isFinal: boolean) => {
                  setTranscript(text);

                  // Clear any existing silence timer
                  if (silenceTimeoutRef.current) {
                        clearTimeout(silenceTimeoutRef.current);
                  }

                  // Set a new silence timer. 
                  // If no new speech is detected for 1.5s, we consider the command finished.
                  // We ignore 'isFinal' from the API because it can be too aggressive with pauses.
                  silenceTimeoutRef.current = setTimeout(() => {
                        transcriberRef.current?.stop();
                        visualizerRef.current?.stop();
                        processIntent(text);
                  }, 1500);
            });
      };

      const stopListening = async () => {
            if (silenceTimeoutRef.current) {
                  clearTimeout(silenceTimeoutRef.current);
            }
            setIsListening(false);
            setIsProcessing(false);
            transcriberRef.current?.stop();
            visualizerRef.current?.stop();
            ttsRef.current?.stop();
      };

      return (
            <VocalRouteContext.Provider value={{
                  isListening,
                  isProcessing,
                  transcript,
                  confidence,
                  volume,
                  frequencies,
                  agentReply,
                  isSpeaking,
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
                              frequencies={frequencies}
                              agentReply={agentReply}
                              isSpeaking={isSpeaking}
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
