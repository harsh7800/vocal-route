"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentState } from '../types/AgentState';
import { Objective } from '../core/Objective';
import { Step } from '../core/Step';
import { Action } from '../core/Action';

interface AgentViewProps {
      state: AgentState;
      objective?: Objective;
      steps: Step[];
      availableActions?: Action[];
      waitingReason?: string;
      onAction: (actionId: string) => void;
      onCancel: () => void;
      onClose: () => void;
      onMinimize: () => void;
      onCommandSubmit?: (cmd: string) => void;
      isMinimized?: boolean;
      transcript?: string;
      isListening?: boolean;
      isProcessing?: boolean;
      proposedAction?: any;
      messages?: { role: "user" | "assistant"; content: string }[];
}

export const AgentView: React.FC<AgentViewProps> = ({
      state,
      objective,
      steps,
      availableActions,
      waitingReason,
      onAction,
      onCancel,
      onClose,
      onMinimize,
      onCommandSubmit,
      isMinimized = false,
      transcript = "",
      isListening = false,
      isProcessing = false,
      proposedAction,
      messages = []
}) => {
      const [inputCmd, setInputCmd] = React.useState("");
      const isIdle = state === AgentState.IDLE && messages.length === 0;
      const isRunning = [
            AgentState.PROCESSING,
            AgentState.NAVIGATING,
            AgentState.EXECUTING
      ].includes(state);

      const isClarifying = state === AgentState.CLARIFYING;
      const isConfirming = state === AgentState.AWAITING_CONFIRMATION;
      const isCompleted = state === AgentState.COMPLETED;
      const isError = state === AgentState.ERROR;

      if (isMinimized) {
            return (
                  <div
                        onClick={onMinimize}
                        className="flex items-center gap-3 px-4 py-3 bg-blue-600 cursor-pointer hover:bg-blue-700 transition-all rounded-full border border-blue-500 shadow-lg text-white group"
                  >
                        <div className="relative">
                              <span className="material-symbols-outlined text-white text-[24px]">smart_toy</span>
                              {isRunning && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sky-300 rounded-full animate-ping"></span>
                              )}
                        </div>
                        <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold tracking-widest leading-none opacity-80">Agent Status</span>
                              <span className="text-xs font-semibold leading-tight">
                                    {isCompleted ? "Task Ready" : isRunning ? "Working..." : "Standing By"}
                                    {objective && !isCompleted && <span className="opacity-70 font-normal"> · {objective.title}</span>}
                              </span>
                        </div>
                        <span className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors ml-1">expand_less</span>
                  </div>
            );
      }

      return (
            <div className="flex flex-col h-full bg-white relative overflow-hidden font-sans">
                  {/* Header */}
                  <header className={`flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white sticky top-0 z-10`}>
                        <div className="flex items-center gap-2">
                              {isCompleted ? (
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                              ) : isError ? (
                                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                              ) : (
                                    <div className={`w-2 h-2 rounded-full ${isRunning || isListening ? 'bg-blue-600 animate-pulse' : 'bg-blue-600'}`}></div>
                              )}
                              <span className="text-xs font-bold tracking-tight text-slate-900 truncate max-w-[150px]">
                                    {objective?.title || 'VocalRoute Agent'}
                              </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${isCompleted ? 'bg-emerald-50 border-emerald-100' :
                                    isError ? 'bg-rose-50 border-rose-100' :
                                          'bg-blue-50 border-blue-100'
                                    }`}>
                                    <span className={`text-[9px] uppercase tracking-tight font-bold ${isCompleted ? 'text-emerald-600' :
                                          isError ? 'text-rose-600' :
                                                'text-blue-600'
                                          }`}>
                                          {state.toLowerCase().replace('_', ' ')}
                                    </span>
                              </div>
                              <div className="flex items-center ml-1">
                                    <button onClick={onMinimize} className="text-slate-400 hover:text-slate-600 p-1">
                                          <span className="material-symbols-outlined text-[18px]">remove</span>
                                    </button>
                                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 p-1">
                                          <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                              </div>
                        </div>
                  </header>

                  {/* Progress Bar (Visible when running) */}
                  <AnimatePresence>
                        {(isRunning || isListening) && (
                              <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-[1px] w-full bg-slate-50 relative overflow-hidden"
                              >
                                    <motion.div
                                          animate={{ x: ['-100%', '300%'] }}
                                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                          className={`absolute inset-y-0 left-0 w-1/4 ${isListening ? 'bg-rose-500' : 'bg-blue-500'}`}
                                    />
                              </motion.div>
                        )}
                  </AnimatePresence>

                  {/* Main Content */}
                  <main className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
                        <AnimatePresence mode="popLayout">
                              {/* Messages (Chat History) */}
                              {messages.map((msg, idx) => (
                                    <motion.div
                                          key={`msg-${idx}`}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                          <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                                : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                                                }`}>
                                                {msg.content}
                                          </div>
                                    </motion.div>
                              ))}

                              {/* Live Transcript (if listening and no final message yet) */}
                              {(isListening || isProcessing) && !transcript && (
                                    <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          className="flex justify-start"
                                    >
                                          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl rounded-tl-sm text-xs text-slate-500 flex items-center gap-2">
                                                <div className="flex gap-1">
                                                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                </div>
                                          </div>
                                    </motion.div>
                              )}
                        </AnimatePresence>

                        {/* Proposed Action Card */}
                        {(isConfirming || state === AgentState.PROPOSING) && proposedAction && (
                              <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="border border-blue-100 bg-blue-50/50 rounded-xl p-4 space-y-3"
                              >
                                    <div className="flex items-center gap-2 text-blue-800">
                                          <span className="material-symbols-outlined text-[20px]">verified</span>
                                          <span className="text-xs font-bold uppercase tracking-wider">Proposed Action</span>
                                    </div>
                                    <div className="bg-white rounded-lg border border-blue-100 p-3 shadow-sm">
                                          <div className="text-xs font-mono text-slate-500 mb-1">Capability: {proposedAction.capability}</div>
                                          {proposedAction.summary && (
                                                <div className="text-sm font-medium text-slate-900">{proposedAction.summary}</div>
                                          )}
                                          {proposedAction.params && Object.keys(proposedAction.params).length > 0 && (
                                                <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                                                      <pre className="whitespace-pre-wrap font-mono">{JSON.stringify(proposedAction.params, null, 2)}</pre>
                                                </div>
                                          )}
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                          <button 
                                                onClick={onCancel}
                                                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                          >
                                                Cancel
                                          </button>
                                          <button
                                                onClick={() => onAction('confirm')}
                                                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 transition-colors"
                                          >
                                                Confirm Execution
                                          </button>
                                    </div>
                              </motion.div>
                        )}

                        {/* Existing Execution Steps UI */}
                        {state === AgentState.EXECUTING && (
                              <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Execution Log</div>
                                    {steps.map((step, idx) => (
                                          <motion.div
                                                key={step.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex gap-2 items-center"
                                          >
                                                <span className={`material-symbols-outlined text-[14px] ${step.status === 'completed' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                      {step.status === 'completed' ? 'check_circle' : 'pending'}
                                                </span>
                                                <span className={`text-xs ${step.status === 'completed' ? 'text-slate-700' : 'text-slate-500'}`}>{step.label}</span>
                                          </motion.div>
                                    ))}
                              </div>
                        )}
                  </main>

                  {/* Footer / Input Area */}
                  <footer className="p-4 bg-slate-50/50 border-t border-slate-100">
                        {(!isCompleted && !isError) ? (
                              <form
                                    onSubmit={(e) => {
                                          e.preventDefault();
                                          if (inputCmd.trim() && onCommandSubmit) {
                                                onCommandSubmit(inputCmd.trim());
                                                setInputCmd("");
                                          }
                                    }}
                                    className="relative flex items-center"
                              >
                                    <input
                                          value={inputCmd}
                                          onChange={(e) => setInputCmd(e.target.value)}
                                          disabled={isProcessing || isListening}
                                          className={`w-full bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm ${(isProcessing || isListening) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                          placeholder={isListening ? "Listening..." : isProcessing ? "Thinking..." : "Type a command..."}
                                          type="text"
                                    />
                                    <button
                                          type="submit"
                                          disabled={isProcessing || isListening || !inputCmd.trim()}
                                          className={`absolute right-2 px-1.5 py-1 rounded transition-colors ${!inputCmd.trim() || isProcessing || isListening ? 'text-slate-300' : 'text-blue-500 hover:bg-blue-50'}`}
                                    >
                                          <span className="material-symbols-outlined text-[16px]">send</span>
                                    </button>
                              </form>
                        ) : (
                              <button
                                    onClick={onCancel} // Reset to IDLE
                                    className="w-full py-2 px-4 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:shadow-sm transition-all flex items-center justify-center gap-2"
                              >
                                    <span className="material-symbols-outlined text-[16px]">history</span>
                                    New Instruction
                              </button>
                        )}
                        <div className="mt-3 flex items-center justify-between text-[9px] text-slate-400 font-bold px-1 uppercase tracking-tighter">
                              <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px] opacity-70">terminal</span>
                                    v2.5.0
                              </span>
                              <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px] opacity-70">verified</span>
                                    Neural Handoff
                              </span>
                        </div>
                  </footer>

                  <style>{`
        .status-pulse {
          box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
            </div>
      );
};
