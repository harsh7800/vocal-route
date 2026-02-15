"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "../../components/ui/scroll-area";

interface ChatViewProps {
      messages: { role: "user" | "assistant"; content: string }[];
      isProcessing: boolean;
      onSendMessage: (msg: string) => void;
      onClose: () => void;
      onMinimize: () => void;
      proposedAction?: any;
      onAction?: (actionId: string) => void;
      onCancel?: () => void;
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
}) => {
      const [input, setInput] = React.useState("");
      const messagesEndRef = useRef<HTMLDivElement>(null);

      const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      useEffect(() => {
            scrollToBottom();
      }, [messages, isProcessing, proposedAction]);

      const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (input.trim() && !isProcessing) {
                  onSendMessage(input.trim());
                  setInput("");
            }
      };

      return (
            <div
                  className="flex flex-col w-[350px] relative bg-white rounded-xl shadow-2xl overflow-hidden font-sans border border-slate-100 overflow-y-auto"
                  style={{ height: 'min(600px, 90vh)' }}
            >
                  {/* Header */}
                  <div className="bg-slate-900 px-4 py-3 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                              {proposedAction ? (
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                              ) : (
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                              )}
                              <span className="text-white font-bold text-sm tracking-wide">
                                    AI Assistant
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
                  <div className="flex-1 relative min-h-0 bg-white">
                        <ScrollArea className="absolute inset-0">
                              <div className="p-4 space-y-6">
                                    {messages.length === 0 && !proposedAction ? (
                                          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 min-h-[300px]">
                                                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">
                                                      chat_bubble
                                                </span>
                                                <p className="text-sm font-medium text-slate-400">Start a conversation</p>
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
                                    {proposedAction && (
                                          <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
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
                                          </motion.div>
                                    )}

                                    {isProcessing && (
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
                  </div>

                  {/* Input */}
                  <div className="p-3 bg-white sticky bottom-0 border-t border-slate-100 shrink-0">
                        <form onSubmit={handleSubmit} className="relative">
                              <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={isProcessing}
                                    placeholder={proposedAction ? "Review action..." : "Type your message..."}
                                    className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm px-4 py-3 pr-12 rounded-lg border-0 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                              />
                              <button
                                    type="submit"
                                    disabled={!input.trim() || isProcessing}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all ${input.trim() && !isProcessing
                                          ? "text-blue-600 hover:bg-blue-50"
                                          : "text-slate-300 cursor-not-allowed"
                                          }`}
                              >
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                              </button>
                        </form>
                  </div>
            </div>
      );
};
