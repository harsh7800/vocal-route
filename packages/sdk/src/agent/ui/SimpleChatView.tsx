"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "../../components/ui/scroll-area";
import { AgentState } from "../types/AgentState";
import { Step } from "../core/Step";
import { VoiceListener, useVoiceInput } from "./VoiceListener";

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
      autoListenOnConfirm?: boolean;
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
      autoListenOnConfirm = false,
}) => {
      const [input, setInput] = React.useState("");
      const messagesEndRef = useRef<HTMLDivElement>(null);

      // Voice input hook — always send (confirm/cancel handled by processIntent)
      const voice = useVoiceInput((finalText) => {
            if (finalText.trim()) {
                  onSendMessage(finalText.trim());
            }
      });

      // Auto-open mic when awaiting confirmation or clarification
      useEffect(() => {
            if (!autoListenOnConfirm) return;
            const shouldAutoListen =
                  state === AgentState.AWAITING_CONFIRMATION ||
                  state === AgentState.CLARIFYING;
            if (shouldAutoListen && !voice.isListening) {
                  // Delay to let the UI render and isProcessing to settle
                  const timer = setTimeout(() => voice.start(), 800);
                  return () => clearTimeout(timer);
            }
      }, [state, autoListenOnConfirm]);

      const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      useEffect(() => {
            scrollToBottom();
      }, [messages, isProcessing, proposedAction, steps, state, voice.isListening]);

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
            } else {
                  voice.start();
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
                              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}></div>
                              <span className="text-white font-bold text-sm tracking-wide transition-opacity duration-300">
                                    {getStatusText()}
                              </span>
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
                                                                  ? "bg-blue-600 text-white rounded-br-sm prose-invert"
                                                                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
                                                                  }`}
                                                      >
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
                                                      </div>
                                                </motion.div>
                                          ))
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


                              {isProcessing && !steps.length && (
                                          <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex justify-start"
                                          >
                                                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 w-16 justify-center">
                                                      <div
                                                            className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: "0ms" }}
                                                      />
                                                      <div
                                                            className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: "150ms" }}
                                                      />
                                                      <div
                                                            className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: "300ms" }}
                                                      />
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
                  <div className="p-3 bg-white sticky bottom-0 border-t border-slate-100 shrink-0">
                        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                              <div className="relative flex-1">
                                    <input
                                          type="text"
                                          value={input}
                                          onChange={handleInputChange}
                                          disabled={isProcessing}
                                          placeholder={
                                                voice.isListening
                                                      ? "Listening... or type here"
                                                      : proposedAction
                                                            ? 'Type "confirm" or "cancel"...'
                                                            : "Type your message..."
                                          }
                                          className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm px-4 py-3 pr-10 rounded-lg border-0 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                                    />
                                    <button
                                          type="submit"
                                          disabled={!input.trim() || isProcessing}
                                          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all ${input.trim() && !isProcessing
                                                ? "text-blue-600 hover:bg-blue-50"
                                                : "text-slate-300 cursor-not-allowed"
                                                }`}
                                    >
                                          <span className="material-symbols-outlined text-[18px]">send</span>
                                    </button>
                              </div>

                              {/* Mic Button */}
                              <button
                                    type="button"
                                    onClick={handleMicClick}
                                    disabled={isProcessing}
                                    className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${voice.isListening
                                          ? "bg-rose-500 text-white shadow-sm shadow-rose-200 hover:bg-rose-600"
                                          : isProcessing
                                                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                                                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                          }`}
                              >
                                    <span className="material-symbols-outlined text-[20px]">
                                          {voice.isListening ? "mic_off" : "mic"}
                                    </span>
                              </button>
                        </form>
                  </div>
            </div>
      );
};
