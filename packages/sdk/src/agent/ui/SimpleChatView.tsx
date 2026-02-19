"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "../../components/ui/scroll-area";
import { AgentState } from "../types/AgentState";
import { Step } from "../core/Step";
import { VoiceListener, useVoiceInput } from "./VoiceListener";

import { Action } from "../core/Action";

interface ChatViewProps {
      messages: { role: "user" | "assistant"; content: string }[];
      isProcessing: boolean;
      onSendMessage: (msg: string) => void;
      onClose: () => void;
      onMinimize: () => void;
      proposedAction?: any;
      onAction?: (actionId: string) => void;
      onCancel?: () => void;
      state?: AgentState;
      steps?: Step[];
      availableActions?: Action[];
      autoListenOnConfirm?: boolean;
      isSpeaking?: boolean;
      onStopSpeaking?: () => void;
      activeForm?: import("../core/Agent").ActiveForm;
      onUpdateFormField?: (name: string, value: any) => void;
}

export const SimpleChatView: React.FC<ChatViewProps> = ({
      messages,
      isProcessing,
      onSendMessage,
      onClose,
      onMinimize,
      proposedAction,
      onAction,
      onCancel,
      state = AgentState.IDLE,
      steps = [],
      availableActions = [],
      autoListenOnConfirm = false,
      isSpeaking = false,
      onStopSpeaking = () => { },
      activeForm,
      onUpdateFormField = () => { },
}) => {
      const [input, setInput] = React.useState("");
      const [listeningField, setListeningField] = React.useState<string | null>(null);
      const messagesEndRef = useRef<HTMLDivElement>(null);

      // Voice input hook — handles both global chat and individual field filling
      const voice = useVoiceInput((finalText) => {
            if (!finalText.trim()) return;

            if (listeningField) {
                  onUpdateFormField(listeningField, finalText.trim());
                  setListeningField(null);
            } else {
                  onSendMessage(finalText.trim());
            }
      });

      const wasSpeaking = useRef(false);

      // Auto-open mic when awaiting confirmation or clarification
      useEffect(() => {
            if (!autoListenOnConfirm) return;

            // Trigger when AI FINISHES speaking
            if (!isSpeaking && wasSpeaking.current) {
                  const shouldAutoListen =
                        state === AgentState.AWAITING_CONFIRMATION ||
                        state === AgentState.CLARIFYING;

                  if (shouldAutoListen && !voice.isListening) {
                        const timer = setTimeout(() => voice.start(), 500);
                        return () => clearTimeout(timer);
                  }
            }

            wasSpeaking.current = isSpeaking;

            // Initial fallback if not speaking at all
            const shouldAutoListen =
                  state === AgentState.AWAITING_CONFIRMATION ||
                  state === AgentState.CLARIFYING;

            if (shouldAutoListen && !voice.isListening && !isSpeaking && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
                  const timer = setTimeout(() => voice.start(), 800);
                  return () => clearTimeout(timer);
            }
      }, [state, autoListenOnConfirm, isSpeaking]);

      const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      useEffect(() => {
            scrollToBottom();
      }, [messages, isProcessing, proposedAction, steps, state, voice.isListening, activeForm]);

      const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (input.trim()) {
                  // Stop voice if it's running — user chose to type instead
                  if (voice.isListening) voice.stop();
                  onSendMessage(input.trim());
                  setInput("");
            }
      };

      const handleMicClick = () => {
            if (voice.isListening) {
                  voice.stop();
                  setListeningField(null);
            } else {
                  setListeningField(null);
                  voice.start();
            }
      };

      const handleFieldMicClick = (fieldName: string) => {
            if (voice.isListening && listeningField === fieldName) {
                  voice.stop();
                  setListeningField(null);
            } else {
                  if (voice.isListening) voice.stop();
                  setListeningField(fieldName);
                  setTimeout(() => voice.start(), 100);
            }
      };

      // If user starts typing while voice is active, stop voice
      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setInput(e.target.value);
            if (voice.isListening && e.target.value.length > 0) {
                  voice.stop();
            }
      };

      const getStatusText = () => {
            switch (state) {
                  case AgentState.PROCESSING: return "Thinking...";
                  case AgentState.NAVIGATING: return "Navigating...";
                  case AgentState.EXECUTING: return "Working...";
                  case AgentState.LISTENING: return "Listening...";
                  case AgentState.AWAITING_CONFIRMATION: return "Confirm Action";
                  case AgentState.COMPLETED: return "Task Complete";
                  case AgentState.ERROR: return "Error";
                  default: return "AI Assistant";
            }
      };

      const getStatusColor = () => {
            switch (state) {
                  case AgentState.PROCESSING:
                  case AgentState.NAVIGATING:
                  case AgentState.EXECUTING:
                        return "bg-blue-500 animate-pulse";
                  case AgentState.LISTENING:
                        return "bg-rose-500 animate-pulse";
                  case AgentState.COMPLETED:
                        return "bg-emerald-500";
                  case AgentState.ERROR:
                        return "bg-rose-500";
                  case AgentState.AWAITING_CONFIRMATION:
                        return "bg-amber-500 animate-pulse";
                  default:
                        return "bg-emerald-400";
            }
      };

      return (
            <div
                  className="flex flex-col w-[350px] relative bg-white rounded-xl shadow-2xl overflow-hidden font-sans border border-slate-100"
                  style={{ height: 'min(600px, 90vh)' }}
            >
                  {/* Header */}
                  <div className="bg-slate-900 px-4 py-3 flex justify-between items-center shrink-0 transition-colors duration-300">
                        <div className="flex items-center gap-2">
                              {isSpeaking ? (
                                    <button
                                          onClick={onStopSpeaking}
                                          className="flex items-center gap-2 px-3 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-600/30 transition-all active:scale-95 group"
                                    >
                                          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                                          <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">STOP AI</span>
                                    </button>
                              ) : (
                                    <>
                                                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}></div>
                                                <span className="text-white font-bold text-sm tracking-wide transition-opacity duration-300">
                                                      {getStatusText()}
                                                </span>
                                    </>
                              )}
                        </div>
                        <div className="flex items-center gap-1">
                              <button
                                    onClick={onMinimize}
                                    className="text-slate-400 hover:text-white p-1 transition-colors"
                              >
                                    <span className="material-symbols-outlined text-[18px]">
                                          remove
                                    </span>
                              </button>
                              <button
                                    onClick={onClose}
                                    className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                              >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                              </button>
                        </div>
                  </div>

                  {/* Messages Area */}
                  <ScrollArea className="flex-1 relative min-h-0 bg-white overflow-y-auto">
                              <div className="p-4 space-y-6">
                              {messages.length === 0 && !proposedAction && steps.length === 0 ? (
                                          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 min-h-[300px]">
                                                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">
                                                      chat_bubble
                                                </span>
                                                <p className="text-sm font-medium text-slate-400">Start a conversation</p>
                                          <p className="text-xs text-slate-300 mt-1">Type or tap the mic to speak</p>
                                          </div>
                                    ) : (
                                          messages.map((msg, idx) => (
                                                <motion.div
                                                      key={idx}
                                                      initial={{ opacity: 0, y: 10 }}
                                                      animate={{ opacity: 1, y: 0 }}
                                                      className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"
                                                            }`}
                                                >
                                                      <div
                                                            className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:p-0 ${msg.role === "user"
                                                                  ? "bg-slate-900 text-white rounded-br-sm prose-invert"
                                                                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
                                                                  }`}
                                                      >
                                                            {!msg.content || msg.content.trim() === "" ? (
                                                                  <div className="flex gap-1 py-1">
                                                                        <div className="w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                                        <div className="w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                                        <div className="w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                                  </div>
                                                            ) : (
                                                                        <ReactMarkdown
                                                                              components={{
                                                                                    p: ({ node, ...props }) => (
                                                                                          <p className="mb-2 last:mb-0" {...props} />
                                                                                    ),
                                                                                    ul: ({ node, ...props }) => (
                                                                                          <ul
                                                                                                className="list-disc ml-4 mb-2 space-y-1"
                                                                                                {...props}
                                                                                          />
                                                                                    ),
                                                                                    ol: ({ node, ...props }) => (
                                                                                          <ol
                                                                                                className="list-decimal ml-4 mb-2 space-y-1"
                                                                                                {...props}
                                                                                          />
                                                                                    ),
                                                                                    li: ({ node, ...props }) => (
                                                                                          <li className="pl-1" {...props} />
                                                                                    ),
                                                                                    strong: ({ node, ...props }) => (
                                                                                          <strong className="font-semibold" {...props} />
                                                                                    ),
                                                                              }}
                                                                        >
                                                                              {msg.content}
                                                                        </ReactMarkdown>
                                                            )}
                                                      </div>
                                                </motion.div>
                                          ))
                                    )}

                              {/* Parameter Collection Form */}
                              {activeForm && (state === AgentState.CLARIFYING || state === AgentState.EXECUTING) && (
                                    <motion.div
                                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xl shadow-slate-100/50 space-y-5 my-6 relative overflow-hidden ring-1 ring-slate-100"
                                    >
                                          <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                                                <div className="flex items-center gap-2.5">
                                                      <div className="p-1.5 bg-blue-50 rounded-md text-blue-600">
                                                            <span className="material-symbols-outlined text-[18px]">fact_check</span>
                                                      </div>
                                                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Required Details</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/50 border border-blue-100/50 rounded-full">
                                                      <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                      </span>
                                                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Live Fill</span>
                                                </div>
                                          </div>

                                          <div className="space-y-4">
                                                {activeForm.fields.map((field) => {
                                                      const isFieldListening = voice.isListening && listeningField === field.name;

                                                      return (
                                                            <div key={field.name} className="space-y-1.5 group/field">
                                                                  <div className="flex justify-between items-center ml-1">
                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                                                              {field.label}
                                                                              {field.required && <span className="text-rose-500 text-[14px] leading-none">*</span>}
                                                                        </label>
                                                                        {isFieldListening && (
                                                                              <span className="text-[10px] font-bold text-rose-500 animate-pulse uppercase flex items-center gap-1">
                                                                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                                                                    Listening
                                                                              </span>
                                                                        )}
                                                                  </div>

                                                                  <div className={`relative transition-all duration-300 ${isFieldListening ? 'scale-[1.02]' : ''}`}>
                                                                        {field.type === 'select' && field.options ? (
                                                                              <div className="flex flex-wrap gap-2 pr-10">
                                                                                    {field.options.map(opt => {
                                                                                          const label = typeof opt === 'string' ? opt : opt.label;
                                                                                          const val = typeof opt === 'string' ? opt : opt.value;
                                                                                          const isSelected = String(field.value) === String(val);
                                                                                          return (
                                                                                                <button
                                                                                                      key={val}
                                                                                                      onClick={() => onUpdateFormField(field.name, val)}
                                                                                                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${isSelected
                                                                                                            ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20 transform scale-105"
                                                                                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                                                                            }`}
                                                                                                >
                                                                                                      {label}
                                                                                                </button>
                                                                                          )
                                                                                    })}
                                                                              </div>
                                                                        ) : (
                                                                              <input
                                                                                    type={field.type === 'number' ? 'number' : 'text'}
                                                                                    value={isFieldListening ? voice.interimText || field.value : field.value}
                                                                                    onChange={(e) => onUpdateFormField(field.name, e.target.value)}
                                                                                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400 pr-10 ${isFieldListening
                                                                                          ? "border-rose-400 ring-4 ring-rose-100 bg-white"
                                                                                          : "border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 focus:bg-white"
                                                                                          }`}
                                                                                    placeholder={isFieldListening ? "Speak now..." : `Enter ${field.label.toLowerCase()}...`}
                                                                              />
                                                                        )}

                                                                        {/* Local Mic Button */}
                                                                        <button
                                                                              type="button"
                                                                              onClick={() => handleFieldMicClick(field.name)}
                                                                              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${isFieldListening
                                                                                    ? "bg-rose-500 text-white shadow-lg shadow-rose-200 scale-110"
                                                                                    : "text-slate-400 hover:bg-slate-200 hover:text-slate-600 opacity-60 group-hover/field:opacity-100"
                                                                                    }`}
                                                                        >
                                                                              <span className="material-symbols-outlined text-[18px]">
                                                                                    {isFieldListening ? "mic_off" : "mic"}
                                                                              </span>
                                                                        </button>
                                                                  </div>
                                                            </div>
                                                      );
                                                })}
                                          </div>

                                          <div className="pt-2">
                                                <button
                                                      onClick={() => {
                                                            const vals = activeForm.fields.reduce((acc, f) => ({ ...acc, [f.name]: f.value }), {});
                                                            onSendMessage(`Update details: ${JSON.stringify(vals)}`);
                                                      }}
                                                      disabled={isProcessing}
                                                      className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                      {isProcessing ? (
                                                            <>
                                                                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                  Updating...
                                                            </>
                                                      ) : (
                                                            <>
                                                                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                                                  Submit Details
                                                            </>
                                                      )}
                                                </button>
                                                <p className="text-[10px] text-slate-400 text-center mt-3 font-medium flex items-center justify-center gap-1.5 opacity-80">
                                                      <span className="material-symbols-outlined text-[14px]">info</span>
                                                      Type manually or use the mic buttons
                                                </p>
                                          </div>
                                    </motion.div>
                              )}

                              {/* Entity Suggestions / Clarification Actions */}
                              {availableActions && availableActions.length > 0 && state === AgentState.CLARIFYING && (
                                    <motion.div
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          className="mt-4 flex flex-col gap-2"
                                    >
                                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 px-1">Please Select:</span>
                                          <div className="flex flex-wrap gap-2">
                                                {availableActions.map(action => (
                                                      <button
                                                            key={action.id}
                                                            onClick={() => action.execute()}
                                                            className="px-4 py-2 text-sm bg-white border border-slate-200 text-slate-700 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm"
                                                      >
                                                            {action.label}
                                                      </button>
                                                ))}
                                          </div>
                                    </motion.div>
                              )}

                                    {/* Proposed Action Card */}
                              <AnimatePresence>
                                    {proposedAction && (
                                          <motion.div
                                                key="proposed-action"
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                className="border border-blue-100 bg-blue-50/50 rounded-xl p-3 space-y-3"
                                          >
                                                <div className="flex items-center gap-2 text-blue-800">
                                                      <span className="material-symbols-outlined text-[18px]">verified</span>
                                                      <span className="text-xs font-bold uppercase tracking-wider">Proposed Action</span>
                                                </div>
                                                <div className="bg-white rounded-lg border border-blue-100 p-3 shadow-sm">
                                                      <div className="text-[10px] font-mono text-slate-500 mb-1">Capability: {proposedAction.capability}</div>
                                                      {proposedAction.summary && (
                                                            <div className="text-sm font-medium text-slate-900">{proposedAction.summary}</div>
                                                      )}
                                                      {proposedAction.params && Object.keys(proposedAction.params).length > 0 && (
                                                            <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                                                  <pre className="whitespace-pre-wrap font-mono">{JSON.stringify(proposedAction.params, null, 2)}</pre>
                                                            </div>
                                                      )}
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                      <button
                                                            onClick={onCancel}
                                                            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                                      >
                                                            Cancel
                                                      </button>
                                                      <button
                                                            onClick={() => onAction?.('confirm')}
                                                            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 transition-colors flex items-center gap-1"
                                                      >
                                                            <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                                                            Confirm
                                                      </button>
                                                </div>

                                                {/* Voice confirm hint */}
                                                <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-blue-100">
                                                      <span className="material-symbols-outlined text-[12px] text-blue-400">mic</span>
                                                      <span className="text-[10px] text-blue-400 font-medium">Say "confirm" or "cancel" to use voice</span>
                                                </div>
                                          </motion.div>
                                    )}
                              </AnimatePresence>

                              {/* Action Steps Execution Log */}
                              <AnimatePresence>
                                    {steps.length > 0 && !proposedAction && (state === AgentState.EXECUTING || state === AgentState.COMPLETED || state === AgentState.NAVIGATING || state === AgentState.ERROR) && (
                                          <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-2 mt-4 pt-4 border-t border-slate-100"
                                          >
                                                <div className="flex items-center justify-between">
                                                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Activity Log</span>
                                                      {state === AgentState.EXECUTING && (
                                                            <span className="flex h-2 w-2 relative">
                                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                            </span>
                                                      )}
                                                </div>
                                                <div className="bg-slate-50 rounded-lg p-2 space-y-2 border border-slate-100">
                                                      {steps.map((step, idx) => {
                                                            const isFailed = step.label.toLowerCase().includes("failed") || step.label.toLowerCase().includes("error");
                                                            return (
                                                                  <motion.div
                                                                        key={step.id || idx}
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: idx * 0.1 }}
                                                                        className="flex gap-2 items-center"
                                                                  >
                                                                        {isFailed ? (
                                                                              <span className="material-symbols-outlined text-[14px] text-rose-500 font-bold shrink-0">error</span>
                                                                        ) : step.status === 'completed' ? (
                                                                              <span className="material-symbols-outlined text-[14px] text-emerald-500 font-bold shrink-0">check</span>
                                                                        ) : step.status === 'pending' && idx === steps.length - 1 && state === AgentState.EXECUTING ? (
                                                                              <span className="w-3 h-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin shrink-0"></span>
                                                                        ) : (
                                                                              <span className="w-3 h-3 rounded-full bg-slate-200 shrink-0"></span>
                                                                        )}
                                                                        <span className={`text-xs ${isFailed ? 'text-rose-600 font-medium' : step.status === 'completed' ? 'text-slate-600 line-through opacity-70' : 'text-slate-700 font-medium'}`}>
                                                                              {step.label}
                                                                        </span>
                                                                  </motion.div>
                                                            );
                                                      })}
                                                </div>
                                          </motion.div>
                                    )}
                              </AnimatePresence>


                              {/* Thinking Loader */}
                              {isProcessing && (!messages.length || messages[messages.length - 1].role === 'user') && (
                                          <motion.div
                                          initial={{ opacity: 0, y: 5 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="flex justify-start mb-4 pl-2"
                                          >
                                          <div className="flex items-center gap-2">
                                                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                                                      <span className="material-symbols-outlined text-white text-[16px] animate-pulse">
                                                            smart_toy
                                                      </span>
                                                </div>
                                                <div className="bg-slate-100 border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 h-10 px-4">
                                                      <div
                                                            className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-bounce"
                                                            style={{ animationDelay: "0ms" }}
                                                      />
                                                      <div
                                                            className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-bounce"
                                                            style={{ animationDelay: "150ms" }}
                                                      />
                                                      <div
                                                            className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-bounce"
                                                            style={{ animationDelay: "300ms" }}
                                                      />
                                                </div>
                                          </div>
                                          </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                              </div>
                  </ScrollArea>

                  {/* Voice Listener (compact, shown above input when active) */}
                  <div className="px-3 pt-1">
                        <VoiceListener
                              isListening={voice.isListening}
                              onStart={voice.start}
                              onStop={voice.stop}
                              interimText={voice.interimText}
                              disabled={isProcessing}
                        />
                  </div>

                  {/* Input */}
                  <div className="p-3.5 bg-white sticky bottom-0 border-t border-slate-100 shrink-0 z-10">
                        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">

                              <div className="relative flex-1 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-slate-300 focus-within:ring-4 focus-within:ring-slate-100 transition-all duration-200 flex items-center">
                                    <input
                                          type="text"
                                          value={input}
                                          onChange={handleInputChange}
                                          disabled={isProcessing}
                                          placeholder={
                                                voice.isListening
                                                      ? "Listening to you..."
                                                      : proposedAction
                                                            ? 'Type "confirm"...'
                                                            : "Ask anything..."
                                          }
                                          className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm px-4 py-3 border-0 focus:ring-0 outline-none w-full"
                                    />

                                    {/* Send Button inside Input */}
                                    <AnimatePresence>
                                          {input.trim() && (
                                                <motion.button
                                                      initial={{ opacity: 0, scale: 0.8 }}
                                                      animate={{ opacity: 1, scale: 1 }}
                                                      exit={{ opacity: 0, scale: 0.8 }}
                                                      type="submit"
                                                      disabled={isProcessing}
                                                      className="mr-2 p-1.5 bg-slate-900 text-white rounded-xl shadow-md hover:bg-slate-800 active:scale-95 transition-all"
                                                >
                                                      <span className="material-symbols-outlined text-[18px] leading-none">arrow_upward</span>
                                                </motion.button>
                                          )}
                                    </AnimatePresence>
                              </div>

                              {/* Mic Button - Floating alongside */}
                              {!isSpeaking && (
                                    <button
                                          type="button"
                                          onClick={handleMicClick}
                                          disabled={isProcessing}
                                          className={`shrink-0 w-[46px] h-[46px] rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${voice.isListening
                                                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                                                : isProcessing
                                                      ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100"
                                                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 hover:border-slate-300"
                                                }`}
                                    >
                                          {voice.isListening && (
                                                <span className="absolute inset-0 rounded-2xl animate-ping bg-rose-500 opacity-20"></span>
                                          )}
                                          <span className={`material-symbols-outlined text-[24px] z-10 ${voice.isListening ? "animate-pulse" : ""}`}>
                                                {voice.isListening ? "mic_off" : "mic"}
                                          </span>
                                    </button>
                              )}
                        </form>
                  </div>
            </div>
      );
};
