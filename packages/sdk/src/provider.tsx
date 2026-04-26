"use client";

import { createContext, useContext, useRef, useState, useCallback, type ReactNode, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import { SpeechTranscriber } from './audio/transcriber';
import { VolumeVisualizer } from './audio/visualizer';
import { BrowserTTS } from './audio/tts';
import { staticRegistry } from './generated/registry';
import { VocalRouteButton } from './components/VocalRouteButton';
import { resolveLocalIntent,  } from './ai/resolver';
import type { VocalIntent, RouteRegistry, VocalAIConfig } from './types';
import { Agent, AgentUIState } from './agent/core/Agent';
// import { AgentView } from './agent/ui/AgentView';
import { SimpleChatView } from './agent/ui/SimpleChatView';
import { VoiceOverlay } from './components/VoiceOverlay';
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
      startListening: (options?: { mode?: 'agent' | 'global' }) => Promise<void>;
      stopListening: () => Promise<string | null | undefined>;
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
      const [isGlobalVoice, setIsGlobalVoice] = useState(false);

      const [isPreparingSpeech, setIsPreparingSpeech] = useState(false);

      const say = useCallback((msg: string) => {
            setAgentReply(msg);
            const tts = BrowserTTS.getInstance();
            if (aiConfig?.enabled && aiConfig?.openaiApiKey) {
                  tts.configure(
                        aiConfig.openaiApiKey,
                        aiConfig.baseURL,
                        aiConfig.voiceModel,
                        aiConfig.speechModel
                  );
            }
            setIsPreparingSpeech(true);
            tts.speak(
                  msg,
                  () => {
                        setIsPreparingSpeech(false);
                        setIsSpeaking(true);
                  },
                  () => {
                        setIsSpeaking(false);
                        setIsPreparingSpeech(false);
                  }
            );
      }, [aiConfig]);

      const lastSpokenIndexRef = useRef<number>(-1);

      useEffect(() => {
            return agentInstance.onStateChange((state) => {
                  setAgentState(state);

                  // Auto-exit global voice if we need UI interaction (confirm/clarify)
                  if (state.state === AgentState.AWAITING_CONFIRMATION || state.state === AgentState.CLARIFYING) {
                        if (isGlobalVoice) {
                              setIsGlobalVoice(false);
                              setIsAgentOpen(true);
                        }
                  }

                  // Auto-speak new assistant messages
                  const lastIndex = state.messages.findLastIndex(m => m.role === 'assistant');
                  if (lastIndex > lastSpokenIndexRef.current) {
                        const msg = state.messages[lastIndex].content;
                        // Avoid speaking empty or repeated status messages if any
                        if (msg && msg.trim()) {
                              say(msg);
                        }
                        lastSpokenIndexRef.current = lastIndex;
                  }
            });
      }, [agentInstance, say]);

      const executeAgentAction = useCallback(async (actionId: string) => {
            if (actionId === 'confirm') {
                  const action = agentInstance.getUIState().proposedAction;
                  if (!action) return;

                  // Clear proposed action and old steps
                  agentInstance.setProposedAction(undefined);
                  agentInstance.clearSteps();
                  agentInstance.transition("START_EXECUTING");
                  agentInstance.addStep(action.summary || `Executing ${action.capability}`, "pending");

                  try {
                        const isPath = action.capability.startsWith('/');

                        if (isPath) {
                              // Validate route exists in registry
                              const matchedRoute = registry.find(r => {
                                    // Exact match or pattern match (e.g. /customers/[customerId])
                                    const routePattern = r.path.replace(/\[([^\]]+)\]/g, '[^/]+');
                                    const regex = new RegExp(`^${routePattern}$`);
                                    return regex.test(action.capability) || r.path === action.capability;
                              });

                              if (!matchedRoute) {
                                    agentInstance.addMessage(
                                          "assistant",
                                          `The page "${action.capability}" is not available in my context. I can only navigate to registered pages.`
                                    );
                                    agentInstance.transition("FAIL");
                                    return;
                              }

                              // Navigation — interpolate params into path
                              let finalPath = action.capability;
                              if (action.params) {
                                    for (const [key, value] of Object.entries(action.params)) {
                                          finalPath = finalPath.replace(`[${key}]`, String(value));
                                    }
                              }
                              if (currentParams) {
                                    for (const [key, value] of Object.entries(currentParams)) {
                                          const val = Array.isArray(value) ? value.join('/') : String(value);
                                          finalPath = finalPath.replace(`[${key}]`, val);
                                    }
                              }
                              router.push(finalPath);
                              agentInstance.addStep(`Navigated to ${finalPath}`, "completed");
                        } else {
                              // Validate capability is registered
                              const capability = vocalRegistry.getCapability(action.capability);
                              if (!capability || capability.id === 'navigation' || capability.id === '__system.listCapabilities') {
                                    agentInstance.addMessage(
                                          "assistant",
                                          `I don't have a registered task called "${action.capability}". This action is not available in my context.`
                                    );
                                    agentInstance.transition("FAIL");
                                    return;
                              }

                              // Execute the capability
                              agentInstance.addStep(`Running ${capability.id}...`, "pending");
                              await capability.execute(action.params || {});
                              agentInstance.addStep(`Completed ${capability.id}`, "completed");
                        }

                        agentInstance.transition("COMPLETE");
                  } catch (e: any) {
                        console.error("[VocalRoute] Execution failed:", e);
                        agentInstance.addMessage("assistant", `Execution failed: ${e.message}`);
                        agentInstance.transition("FAIL");
                  }
            }
      }, [agentInstance, registry, router, currentParams]);

      const processIntent = useCallback(async (text: string) => {
            const lowerText = text.toLowerCase().trim();

            // Voice/text shortcuts for confirming or cancelling a proposed action
            if (agentInstance.getUIState().proposedAction) {
                  const confirmPhrases = ["confirm", "yes", "yeah", "yep", "do it", "go ahead", "sure", "ok", "okay", "proceed"];
                  const cancelPhrases = ["cancel", "no", "nope", "stop", "never mind", "nevermind", "don't"];

                  if (confirmPhrases.some(p => lowerText === p || lowerText.startsWith(p))) {
                        executeAgentAction("confirm");
                        return;
                  }
                  if (cancelPhrases.some(p => lowerText === p || lowerText.startsWith(p))) {
                        agentInstance.addMessage("user", text);
                        agentInstance.setProposedAction(undefined);
                        agentInstance.addMessage("assistant", "Action cancelled.");
                        agentInstance.transition("RESET");
                        return;
                  }
            }

            if (text.startsWith("Update details:")) {
                  try {
                        const jsonStr = text.replace("Update details:", "").trim();
                        const vals = JSON.parse(jsonStr);
                        const activeForm = agentInstance.getUIState().activeForm;
                        if (activeForm) {
                              setIsProcessing(true);
                              agentInstance.receiveInput(text);
                              agentInstance.addMessage("user", "Updated the required details.");
                              await engine.processIntent({
                                    capability: activeForm.capabilityId,
                                    params: vals
                              });
                              setIsProcessing(false);
                              return;
                        }
                  } catch (e) {
                        console.error("[VocalRoute] Failed to parse form update", e);
                  }
            }

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
                                    capabilities: vocalRegistry.listCapabilities()
                                          .filter(c => c.id !== '__system.listCapabilities' && c.id !== 'navigation')
                                          .map(c => ({
                                                id: c.id,
                                                description: c.description || '',
                                                scope: c.scope,
                                                params: c.params || [],
                                          })),
                                    history: agentInstance.getCurrentTurnMessages()
                              });

                              const gate = new ExecutionGate(agentInstance, engine);
                              await gate.handle(output);
                        } catch (convErr: any) {
                              console.error("Conversation Error", convErr);
                              agentInstance.transition('FAIL', { message: convErr.message });
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
                        agentInstance.addMessage("assistant", intent.reply);
                        agentInstance.transition('COMPLETE');
                        agentInstance.addStep(intent.reply, "completed");

                        // Keep the agent open for a moment so they can read the reply
                        setTimeout(() => {
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

                              if (intent.reply) {
                                    agentInstance.addMessage("assistant", intent.reply);
                              }
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
                        if (intent.reply) {
                              agentInstance.addMessage("assistant", intent.reply);
                        }

                        agentInstance.transition('RESET');
                  } else {
                        agentInstance.transition('RESET');
                  }

            } catch (err: any) {
                  console.error("[VocalRoute] Processing error:", err);
                  setError(err.message || "Failed to process command");
                  setIsProcessing(false);
                  agentInstance.transition('FAIL', { message: err.message });
            }
      }, [registry, router, currentParams, aiConfig, agentInstance, engine, say, executeAgentAction]);

      const stopListening = useCallback(async () => {
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
            setIsListening(false);

            const finalTranscript = await transcriberRef.current?.stop();

            visualizerRef.current?.stop();
            setVolume(0);
            setFrequencies([]);

            return finalTranscript;
      }, []);

      const startListening = async (options?: { mode?: 'agent' | 'global' }) => {
            const mode = options?.mode || 'agent';
            setIsListening(true);

            if (mode === 'global') {
                  setIsGlobalVoice(true);
                  setIsAgentOpen(false);
            } else {
                  setIsGlobalVoice(false);
                  setIsAgentOpen(true);
                  setIsAgentMinimized(false);
            }

            setTranscript('');
            setError(null);

            if (!transcriberRef.current) {
                  transcriberRef.current = new SpeechTranscriber(
                        aiConfig?.openaiApiKey,
                        aiConfig?.baseURL
                  );
            }
            if (!visualizerRef.current) visualizerRef.current = new VolumeVisualizer();

            visualizerRef.current.start((v) => setVolume(prev => prev * 0.8 + v * 0.2), (f) => setFrequencies(f));

            // Initial safety timeout: if no speech is detected for 8s, auto-stop
            silenceTimeoutRef.current = setTimeout(async () => {
                  if (transcript === '') stopListening();
            }, 8000);

            transcriberRef.current.start(async (text: string) => {
                  setTranscript(text);
                  agentInstance.setTranscript(text);

                  if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

                  silenceTimeoutRef.current = setTimeout(async () => {
                        setIsProcessing(true);
                        const finalResult = await stopListening();

                        const transcriptionToUse = finalResult || text;
                        if (transcriptionToUse) {
                              setTranscript(transcriptionToUse);
                              processIntent(transcriptionToUse);
                        } else {
                              setIsProcessing(false);
                        }
                  }, 1800);
            });
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

                  <VoiceOverlay
                        isListening={isListening}
                        isProcessing={isProcessing}
                        transcript={transcript}
                        agentReply={agentReply}
                        volume={volume}
                        frequencies={frequencies}
                        error={error}
                        isSpeaking={isSpeaking}
                        isPreparingSpeech={isPreparingSpeech}
                        type="global"
                        onClose={() => {
                              BrowserTTS.getInstance().stop();
                              stopListening();
                              setIsGlobalVoice(false);
                        }}
                        onStopSpeaking={() => {
                              BrowserTTS.getInstance().stop();
                              setIsSpeaking(false);
                              setIsPreparingSpeech(false);
                        }}
                        onSpeakAgain={() => {
                              startListening({ mode: 'global' });
                        }}
                        show={isGlobalVoice}
                  />

                  {(agentState.state !== AgentState.IDLE || isAgentOpen || agentState.messages.length > 0) && !isGlobalVoice && (
                        <div style={{
                              position: 'fixed',
                              bottom: isAgentMinimized ? '2rem' : '6.5rem',
                              right: '2rem',
                              width: isAgentMinimized ? 'auto' : '380px',
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
                                                      agentInstance.transition("RESET");
                                                }}
                                                state={agentState.state}
                                                steps={agentState.steps}
                                                availableActions={agentState.availableActions}
                                                isSpeaking={isSpeaking}
                                                onStopSpeaking={() => {
                                                      BrowserTTS.getInstance().stop();
                                                      setIsSpeaking(false);
                                                      setIsPreparingSpeech(false);
                                                }}
                                                autoListenOnConfirm={true}
                                                activeForm={agentState.activeForm}
                                                onUpdateFormField={(name, value) => {
                                                      agentInstance.updateFormField(name, value);
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
