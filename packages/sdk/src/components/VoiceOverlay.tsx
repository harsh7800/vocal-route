'use client';

import React from 'react';

export interface VoiceOverlayProps {
  isListening: boolean;
  isProcessing?: boolean;
  isSpeaking?: boolean;
  transcript?: string;
  error?: string | null;
  confidence?: number;
  volume?: number;
  onClose?: () => void;
  onRetry?: () => void;
  // Customization options
  themeColor?: 'cyan' | 'blue' | 'purple';
  title?: string;
}

export function VoiceOverlay({
  isListening,
  isProcessing,
  transcript,
  error,
  onClose,
  title
}: VoiceOverlayProps) {
  if (!isListening && !isProcessing) return null;

  return (
    <div className="vocal-route-overlay fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl z-[9999] px-4">
      {/* Inject styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
                @keyframes vocal-waveform {
                  0%, 100% { height: 20%; }
                  50% { height: 80%; }
                }
                .vocal-animate-waveform-bar {
                  animation: vocal-waveform 0.8s ease-in-out infinite;
                }
                .vocal-overlay-enter {
                  animation: vocal-slide-up 0.3s ease-out forwards;
                }
                @keyframes vocal-slide-up {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}} />

      <div className="vocal-overlay-enter bg-white/90 dark:bg-[#191919]/90 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${error ? 'bg-red-500' : 'bg-[#1a1a1a] dark:bg-white'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${error ? 'bg-red-500' : 'bg-[#1a1a1a] dark:bg-white'}`}></span>
            </div>
            <p className="text-sm font-bold text-[#1a1a1a] dark:text-white tracking-tight">
              {error ? 'Error' : isProcessing ? 'Processing...' : title || 'Listening...'}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className="text-neutral-400 hover:text-[#1a1a1a] dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Waveform */}
        {!error && (
          <div className="flex items-center gap-1.5 h-8 px-2 justify-center">
            {[...Array(15)].map((_, i) => (
              <div
                key={i.toString()}
                className={`w-1 rounded-full ${isProcessing ? 'animate-pulse bg-cyan-500' : 'vocal-animate-waveform-bar bg-[#1a1a1a] dark:bg-white'}`}
                style={!isProcessing ? {
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`,
                } : { height: '60%' }}
              />
            ))}
          </div>
        )}

        {/* Transcript Area */}
        <div className="bg-neutral-100/50 dark:bg-neutral-800/50 rounded-lg p-3">
          {error ? (
            <p className="text-sm font-medium text-red-500">{error}</p>
          ) : transcript ? (
            <p className="text-sm font-medium text-[#1a1a1a] dark:text-white">"{transcript}"</p>
          ) : (
            <>
              <p className="text-xs text-neutral-500 mb-1 font-medium">Try saying:</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded-full font-semibold cursor-default">"Go to Invoices"</span>
                <span className="text-[10px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded-full font-semibold cursor-default">"Update my profile"</span>
                <span className="text-[10px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded-full font-semibold cursor-default">"Show analytics"</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
