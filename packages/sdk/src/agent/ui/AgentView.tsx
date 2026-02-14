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
      isProcessing = false
}) => {
      const [inputCmd, setInputCmd] = React.useState("");
      const isIdle = state === AgentState.IDLE;
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
                        {/* Live Transcript / Input Status */}
                        {(isListening || isProcessing || transcript) && (
                              <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 rounded-lg bg-slate-50/80 border border-slate-100"
                              >
                                    <div className="flex items-center gap-2 mb-1.5">
                                          <div className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-rose-500 animate-pulse' : isProcessing ? 'bg-blue-500 animate-spin' : 'bg-slate-400'}`}></div>
                                          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                                                {isListening ? 'Listening' : isProcessing ? 'Processing' : 'Last Command'}
                                          </span>
                                    </div>
                                    <p className={`text-xs leading-5 ${isListening || isProcessing ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                                          {transcript || (isListening ? "Listening..." : isProcessing ? "Thinking..." : "")}
                                    </p>
                              </motion.div>
                        )}
                        <AnimatePresence mode="wait">
                              {isIdle ? (
                                    <motion.div
                                          key="idle"
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="flex flex-col items-center justify-center h-full py-12"
                                    >
                                          <div className="relative mb-6">
                                                <div className="absolute inset-0 bg-blue-50 blur-2xl rounded-full"></div>
                                                <div className="relative border border-blue-100 p-4 rounded-xl bg-blue-50/30">
                                                      <span className="material-symbols-outlined text-blue-500/40 text-4xl">terminal</span>
                                                </div>
                                          </div>
                                          <p className="text-center text-slate-500 text-sm leading-relaxed max-w-[220px]">
                                                Standing by for instructions. <br />
                                                <span className="text-slate-400 text-xs">Speak or type a command to start.</span>
                                          </p>
                                    </motion.div>
                              ) : isCompleted ? (
                                    <motion.div
                                          key="completed"
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          className="flex flex-col items-center justify-center h-full text-center space-y-6"
                                    >
                                          <div className="space-y-1">
                                                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Objective</span>
                                                <p className="text-sm font-medium text-slate-600">{objective?.title}</p>
                                          </div>
                                          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-emerald-500 text-[32px]">check_circle</span>
                                          </div>
                                          <div className="font-mono text-[13px] text-slate-600">
                                                <span className="font-bold text-slate-900">Done.</span> Task completed.
                                          </div>
                                    </motion.div>
                              ) : isError ? (
                                    <motion.div
                                          key="error"
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          className="flex flex-col items-center justify-center h-full text-center space-y-6"
                                    >
                                          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-rose-500 text-[32px]">error</span>
                                          </div>
                                          <div className="space-y-2">
                                                <p className="text-sm font-bold text-slate-900">Something went wrong</p>
                                                <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                                                      {waitingReason || "The agent encountered an error processing your request."}
                                                </p>
                                          </div>
                                          <button
                                                onClick={onCancel}
                                                className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all"
                                          >
                                                Dismiss
                                          </button>
                                    </motion.div>
                              ) : (
                                    <motion.div
                                          key="active"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          className="space-y-4"
                                    >
                                          {/* Objective Summary */}
                                          <div className="flex gap-3 text-[12px] font-mono">
                                                <span className="text-slate-400 shrink-0 select-none">{new Date().toLocaleTimeString([], { hour12: false })}</span>
                                                <span className="text-slate-500">
                                                      Objective: <span className="text-slate-900 font-semibold">{objective?.title}</span>
                                                </span>
                                          </div>

                                          {/* Steps */}
                                          {steps.map((step, idx) => (
                                                <motion.div
                                                      key={step.id}
                                                      initial={{ opacity: 0, x: -10 }}
                                                      animate={{ opacity: 1, x: 0 }}
                                                      transition={{ delay: idx * 0.1 }}
                                                      className="flex gap-3 items-start group"
                                                >
                                                      <div className={`mt-1 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded border ${step.status === 'completed'
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                            : 'bg-blue-50 text-blue-600 border-blue-100'
                                                            }`}>
                                                            <span className="material-symbols-outlined text-[14px]">
                                                                  {step.status === 'completed' ? 'check' : 'pending'}
                                                            </span>
                                                      </div>
                                                      <div className="flex-1 min-w-0">
                                                            <p className={`text-sm leading-tight ${step.status === 'completed' ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                                                                  {step.label}
                                                            </p>
                                                            <span className="text-[10px] text-slate-400 font-mono">
                                                                  {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                            </span>
                                                      </div>
                                                </motion.div>
                                          ))}

                                          {/* Clarification / Selection UI */}
                                          {isClarifying && (
                                                <motion.div
                                                      initial={{ opacity: 0, y: 10 }}
                                                      animate={{ opacity: 1, y: 0 }}
                                                      className="mt-6 p-4 rounded-lg bg-orange-50/50 border border-orange-100 space-y-4 shadow-sm"
                                                >
                                                      <div className="flex items-start gap-3">
                                                            <span className="material-symbols-outlined text-orange-600 text-[20px] mt-0.5">help_center</span>
                                                            <div>
                                                                  <p className="text-slate-800 font-bold">Select an option</p>
                                                                  <p className="text-slate-500 text-xs mt-1 leading-normal">
                                                                        {waitingReason || "Please choose one of the options below to proceed."}
                                                                  </p>
                                                            </div>
                                                      </div>
                                                      <div className="grid grid-cols-1 gap-2">
                                                            {availableActions?.map(action => (
                                                                  <button
                                                                        key={action.id}
                                                                        onClick={() => onAction(action.id)}
                                                                        className="w-full py-2 px-3 text-left text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all"
                                                                  >
                                                                        {action.label}
                                                                  </button>
                                                            ))}
                                                      </div>
                                                </motion.div>
                                          )}

                                          {/* Confirmation UI (Navigation or Cross-Page) */}
                                          {isConfirming && (
                                                <motion.div
                                                      initial={{ opacity: 0, y: 10 }}
                                                      animate={{ opacity: 1, y: 0 }}
                                                      className="mt-6 p-4 rounded-lg bg-blue-50/50 border border-blue-100 space-y-4 shadow-sm"
                                                >
                                                      <div className="flex items-start gap-3">
                                                            <span className="material-symbols-outlined text-blue-600 text-[20px] mt-0.5">info</span>
                                                            <div>
                                                                  <p className="text-slate-800 font-bold">Proceed?</p>
                                                                  <p className="text-slate-500 text-xs mt-1 leading-normal">
                                                                        {waitingReason || "Proceed with the requested action?"}
                                                                  </p>
                                                            </div>
                                                      </div>
                                                      <div className="flex items-center justify-end gap-2 pt-1">
                                                            <button
                                                                  onClick={onCancel}
                                                                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all bg-white"
                                                            >
                                                                  Cancel
                                                            </button>
                                                            <button
                                                                  onClick={() => onAction('confirm')}
                                                                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                                                            >
                                                                  Confirm
                                                            </button>
                                                      </div>
                                                </motion.div>
                                          )}
                                    </motion.div>
                              )}
                        </AnimatePresence>
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
                                    v2.5.0-A1
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
