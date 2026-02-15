"use client";

import { createContext, useContext, useRef, useState, useCallback, type ReactNode, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import { SpeechTranscriber } from './audio/transcriber';
import { VolumeVisualizer } from './audio/visualizer';
import { BrowserTTS } from './audio/tts';
import { staticRegistry } from './generated/registry';
import { VocalRouteButton } from './components/VocalRouteButton';
import { resolveLocalIntent, resolveIntent } from './ai/resolver';
import type { VocalIntent, RouteRegistry, VocalAIConfig } from './types';
import { Agent, AgentUIState } from './agent/core/Agent';
// import { AgentView } from './agent/ui/AgentView';
import { SimpleChatView } from './agent/ui/SimpleChatView';
import { AgentState } from './agent/types/AgentState';
import { ExecutionEngine } from './agent/runtime/ExecutionEngine';
import { vocalRegistry } from './agent/runtime/Registry';
import { AgentConversation } from './agent/core/conversation/Conversation';
import { ExecutionGate } from './agent/core/execution/Gate';

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
      agentState: AgentUIState;
      isAgentMinimized: boolean;
      setIsAgentMinimized: (minimized: boolean) => void;
      isAgentOpen: boolean;
      setIsAgentOpen: (open: boolean) => void;
      startListening: () => Promise<void>;
      stopListening: () => Promise<void>;
      executeAgentAction: (actionId: string) => void;
      triggerCommand: (text: string) => Promise<void>;
      resetAgent: () => void;
};

const VocalRouteContext = createContext<ContextType | null>(null);

interface ProviderProps {
      children: ReactNode;
      routes?: RouteRegistry;
      showButton?: boolean;
      buttonConfig?: {
            position?: { top?: string; bottom?: string; left?: string; right?: string };
            className?: string;
            children?: React.ReactNode;
      };
      aiConfig?: VocalAIConfig;
}

export function VocalRouteProvider({ 
      children,
      routes = staticRegistry as unknown as RouteRegistry,
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

      const [agentInstance] = useState(() => new Agent());
      const [engine] = useState(() => new ExecutionEngine(agentInstance));
      const [agentState, setAgentState] = useState<AgentUIState>(agentInstance.getUIState());
      const [isAgentMinimized, setIsAgentMinimized] = useState(false);
      const [isAgentOpen, setIsAgentOpen] = useState(false);

      useEffect(() => {
            return agentInstance.onStateChange((state) => {
                  setAgentState(state);
            });
      }, [agentInstance]);

      const say = useCallback((msg: string) => {
            setAgentReply(msg);
            const tts = BrowserTTS.getInstance();
            setIsSpeaking(true);
            tts.speak(msg, () => setIsSpeaking(true), () => setIsSpeaking(false));
      }, []);

      const processIntent = useCallback(async (text: string) => {
            setIsProcessing(true);
            console.log("[VocalRoute] 🟢 Processing Input:", text);
            agentInstance.receiveInput(text);

            try {
                  let intent: VocalIntent;


                  if (aiConfig?.enabled && aiConfig?.openaiApiKey) {
                        agentInstance.addMessage("user", text); // Add user message immediately
                        try {
                              const conversation = new AgentConversation({
                                    openaiApiKey: aiConfig.openaiApiKey,
                                    baseURL: aiConfig.baseURL,
                                    model: aiConfig.intentModel
                              });

                              const output = await conversation.interpret(text, {
                                    registry,
                                    history: agentInstance.getMessages()
                              });

                              const gate = new ExecutionGate(agentInstance, engine);
                              await gate.handle(output);
                        } catch (convErr: any) {
                              console.error("Conversation Error", convErr);
                              agentInstance.transition(AgentState.ERROR);
                              const errorMessage = process.env.NODE_ENV === "development"
                                    ? `I encountered an error: ${convErr.message || "Unknown error"}`
                                    : "I encountered an error while processing your request.";
                              agentInstance.addMessage("assistant", errorMessage);
                              setError(convErr instanceof Error ? convErr.message : "Conversation failed");
                        }
                        setIsProcessing(false);
                        return;
                  } else {
                        intent = resolveLocalIntent(text, registry);
                  }

                  setTranscript(intent.transcript);
                  setConfidence(intent.confidence);

                  if (intent.intent === 'action' || (intent.intent === 'navigate' && vocalRegistry.getCapability(intent.target || ''))) {
                        // Use the new deterministic engine
                        await engine.processIntent({
                              capability: intent.target || 'navigation',
                              params: intent.params
                        });
                        setIsProcessing(false);
                        return;
                  }

                  // Handle Chat / Conversation
                  if (intent.intent === 'chat' && intent.reply) {
                        say(intent.reply);
                        agentInstance.transition('COMPLETE');
                        agentInstance.addStep(intent.reply, "completed");

                        // Keep the agent open for a moment so they can read the reply
                        setTimeout(() => {
                              // potentially auto-close or just stay in complete state
                              // for now, let's keep it complete until user closes or says something else
                        }, 3000);

                        setIsProcessing(false);
                        return;
                  }

                  // Handle Navigation
                  if (intent.intent === 'navigate' && intent.target) {
                        const targetRoute = registry.find(r => r.path === intent.target);
                        if (targetRoute) {
                              let finalPath = targetRoute.path;
                              if (currentParams) {
                                    for (const [key, value] of Object.entries(currentParams)) {
                                          const val = Array.isArray(value) ? value.join('/') : String(value);
                                          finalPath = finalPath.replace(`[${key}]`, val);
                                    }
                              }
                              if (intent.params) {
                                    for (const [key, value] of Object.entries(intent.params)) {
                                          finalPath = finalPath.replace(`[${key}]`, value);
                                    }
                              }

                              if (intent.reply) say(intent.reply);
                              router.push(finalPath);
                              agentInstance.transition('COMPLETE');
                              agentInstance.addStep(`Navigated to ${targetRoute.label}`, "completed");
                        }
                  }

                  setIsProcessing(false);

                  // Fallback: If we reached here, it means no action or navigation was triggered
                  // We must reset the agent state from PROCESSING to avoid getting stuck
                  if (intent.intent === 'unknown') {
                        console.warn("[VocalRoute] Unknown intent. Ignoring non-task input.");
                        if (intent.reply) say(intent.reply);

                        // For a "Task Engine", we don't error out on chitchat, we just go back to standing by.
                        // We reset to IDLE but keep the transcript visible for a moment if needed, 
                        // or just reset completely to show "Standing By".
                        agentInstance.transition('IDLE');
                  } else {
                        // Handled but no state transition happened?
                        agentInstance.transition('IDLE');
                  }

            } catch (err: any) {
                  console.error("[VocalRoute] Processing error:", err);
                  setError(err.message || "Failed to process command");
                  setIsProcessing(false);
                  agentInstance.transition('FAIL', { message: err.message });
            }
      }, [registry, router, currentParams, aiConfig, agentInstance, engine, say]);

      const stopListening = useCallback(async () => {
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
            setIsListening(false);
            transcriberRef.current?.stop();
            visualizerRef.current?.stop();
      }, []);

      const startListening = async () => {
            setIsListening(true);
            setIsAgentOpen(true);
            setIsAgentMinimized(false);
            setTranscript('');
            setError(null);

            if (!transcriberRef.current) transcriberRef.current = new SpeechTranscriber();
            if (!visualizerRef.current) visualizerRef.current = new VolumeVisualizer();

            visualizerRef.current.start((v) => setVolume(prev => prev * 0.8 + v * 0.2), (f) => setFrequencies(f));

            transcriberRef.current.start((text: string) => {
                  setTranscript(text);
                  agentInstance.setTranscript(text);
                  if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
                  silenceTimeoutRef.current = setTimeout(() => {
                        stopListening();
                        processIntent(text);
                  }, 1500);
            });
      };

      const executeAgentAction = (actionId: string) => {
            if (actionId === 'confirm') {
                  // Engine will handle resuming from confirmation states
                  // For now, simple completion for demo compatibility
                  agentInstance.transition('COMPLETE');
                  agentInstance.addStep('Confirmed', 'completed');
            }
      };

      const resetAgent = () => {
            agentInstance.reset();
            setIsAgentOpen(false);
            if (agentState.state == AgentState.IDLE) {
                  // Force a UI update if needed
            }
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
                  agentState,
                  startListening,
                  stopListening,
                  executeAgentAction,
                  triggerCommand: processIntent,
                  resetAgent,
                  isAgentMinimized,
                  setIsAgentMinimized,
                  isAgentOpen,
                  setIsAgentOpen
            }}>
                  <NextTopLoader showSpinner={false} color="#22d3ee" />
                  {children}

                  {(agentState.state !== AgentState.IDLE || isAgentOpen || agentState.messages.length > 0) && (
                        <div style={{
                              position: 'fixed',
                              bottom: '2rem',
                              right: isAgentMinimized ? '1.5rem' : '6rem',
                              top: isAgentMinimized ? 'auto' : 'auto',
                              width: isAgentMinimized ? 'auto' : '350px',
                              zIndex: 9000,
                              backgroundColor: isAgentMinimized ? 'transparent' : '#ffffff',
                              borderRadius: isAgentMinimized ? '9999px' : '0.75rem',
                              overflow: 'visible',
                        }}>
                              {isAgentMinimized ? (
                                    <div
                                          onClick={() => setIsAgentMinimized(false)}
                                          className="flex items-center gap-3 px-4 py-3 bg-blue-600 cursor-pointer hover:bg-blue-700 transition-all rounded-full border border-blue-500 shadow-lg text-white group"
                                    >
                                          <div className="relative">
                                                <span className="material-symbols-outlined text-white text-[24px]">chat_bubble</span>
                                          </div>
                                          <span className="text-[10px] uppercase font-bold tracking-widest leading-none opacity-80">Chat</span>
                                    </div>
                              ) : (
                                    <SimpleChatView
                                          messages={agentState.messages}
                                          isProcessing={isProcessing}
                                          onSendMessage={(msg) => processIntent(msg)}
                                          onClose={resetAgent}
                                          onMinimize={() => setIsAgentMinimized(true)}
                                          proposedAction={agentState.proposedAction}
                                          onAction={executeAgentAction}
                                                onCancel={() => {
                                                      agentInstance.setProposedAction(undefined);
                                                      agentInstance.transition("IDLE");
                                                }}
                                          />
                              )}
                        </div>
                  )}
                  {showButton && <VocalRouteButton {...buttonConfig} />}
            </VocalRouteContext.Provider>
      );
}

export const useVocalRoute = () => {
      const ctx = useContext(VocalRouteContext);
      if (!ctx) throw new Error('useVocalRoute must be used inside provider');
      return ctx;
};
