'use client';

import React from 'react';

interface VoiceOverlayProps {
  isListening: boolean;
  transcript?: string;
      onClose?: () => void;
}

export function VoiceOverlay({ isListening, transcript, onClose }: VoiceOverlayProps) {
  if (!isListening) return null;

  return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-3xl bg-white/20 dark:bg-[#101922]/30 overflow-hidden font-sans">
              {/* Link to Material Symbols - Adding here for ease but usually better in layout */}
              <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />

              {/* Close Button */}
              <button
                    onClick={onClose}
                    className="absolute top-8 right-8 size-12 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                    <span className="material-symbols-outlined text-3xl">close</span>
              </button>

              {/* Siri Centerpiece */}
              <div className="relative flex items-center justify-center">
                    {/* Pulsing Rings */}
                    <div className="absolute size-[400px] border border-[#137fec]/10 rounded-full animate-pulse-ring"></div>
                    <div className="absolute size-[500px] border border-[#137fec]/5 rounded-full animate-pulse-ring-slow"></div>

                    {/* The Organic Blob */}
                    <div className="siri-blob relative z-10"></div>

                    {/* Glow Overlay */}
                    <div className="absolute inset-0 bg-white/10 dark:bg-black/10 blur-2xl rounded-full"></div>
              </div>

              {/* Listening Status */}
              <div className="mt-16 text-center">
                    <p className="text-3xl font-light tracking-widest text-[#111418] dark:text-white pulse-text mb-4 uppercase">
                          {transcript ? 'Processing' : 'Listening'}
                    </p>
                    <div className="flex gap-1.5 justify-center">
                          <div className="h-1 w-8 bg-[#137fec] rounded-full"></div>
                          <div className="h-1 w-4 bg-[#137fec]/40 rounded-full"></div>
                          <div className="h-1 w-4 bg-[#137fec]/40 rounded-full"></div>
        </div>
                    <p className="mt-8 text-gray-500 dark:text-gray-400 font-medium max-w-sm px-6 text-lg">
                          {transcript ? `"${transcript}"` : '"Take me to invoices"'}
                    </p>
      </div>

              {/* Keyboard Hint */}
              <div className="absolute bottom-10 flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                    <span>Press</span>
                    <kbd className="px-2 py-1 bg-white/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md font-sans">Esc</kbd>
                    <span>to cancel</span>
      </div>

      <style jsx>{`
        .siri-blob {
          background: radial-gradient(circle at 50% 50%, #137fec 0%, #a855f7 30%, #ec4899 60%, transparent 80%);
          filter: blur(40px);
          opacity: 0.8;
          mix-blend-mode: screen;
          width: 300px;
          height: 300px;
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          animation: blob-animate 8s ease-in-out infinite alternate;
        }

        @keyframes blob-animate {
          0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: scale(1) rotate(0deg); }
          33% { border-radius: 60% 40% 50% 50% / 50% 60% 40% 60%; transform: scale(1.1) rotate(120deg); }
          66% { border-radius: 50% 60% 30% 70% / 60% 40% 70% 40%; transform: scale(0.9) rotate(240deg); }
          100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: scale(1) rotate(360deg); }
        }

        .pulse-text {
          animation: text-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes text-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        .animate-pulse-ring {
          animation: pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-ring-slow {
          animation: pulse-ring 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

