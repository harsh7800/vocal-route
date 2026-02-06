'use client';

import React from 'react';

interface VoiceOverlayProps {
  isListening: boolean;
  transcript?: string;
}

export function VoiceOverlay({ isListening, transcript }: VoiceOverlayProps) {
  if (!isListening) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col items-center gap-8 max-w-2xl px-6 text-center">
        {/* Siri-style animated waveform container */}
        <div className="relative w-64 h-32 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-around">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-blue-400 via-purple-500 to-pink-500 rounded-full animate-voice-wave"
                style={{
                  height: '20%',
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0.7
                }}
              />
            ))}
          </div>
          {/* Central glow */}
          <div className="w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-medium text-white/90 tracking-tight leading-tight">
            {transcript || "Listening..."}
          </h2>
          {!transcript && (
            <p className="text-white/40 text-lg">
              Say something like "Take me to invoices"
            </p>
          )}
        </div>
      </div>

      {/* Footer hint */}
      <div className="absolute bottom-12 text-white/20 text-sm font-medium tracking-widest uppercase">
        Vocal Route Active
      </div>

      <style jsx>{`
        @keyframes voice-wave {
          0%, 100% { height: 20%; }
          50% { height: 80%; }
        }
        .animate-voice-wave {
          animation: voice-wave 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
