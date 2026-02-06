'use client';

import React from 'react';

interface OrganicVoiceOverlayProps {
  isListening: boolean;
  isSpeaking?: boolean;
  transcript?: string;
  onClose?: () => void;
}

export function OrganicVoiceOverlay({ isListening, isSpeaking, transcript, onClose }: OrganicVoiceOverlayProps) {
  if (!isListening && !isSpeaking) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1a1a1a]/80 dark:bg-black/90 backdrop-blur-2xl transition-all duration-500 font-sans">
      {/* Link to Material Symbols */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />

      {/* Dismiss Button */}
      <button 
        onClick={onClose}
        className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors p-2"
        aria-label="Close overlay"
      >
        <span className="material-symbols-outlined text-4xl">close</span>
      </button>

      {/* Animation Container */}
      <div className="relative flex items-center justify-center w-full h-96">
        {/* Organic pulsing waveform blob */}
        <div className="animate-pulse-blob relative">
          {/* Abstract Glow Layer */}
          <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-150"></div>
          
          {/* Main Animated SVG Blob */}
          <svg 
            className={`text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-1000 ${isSpeaking ? 'scale-125 text-blue-200' : 'scale-100'}`} 
            height="240" 
            viewBox="0 0 200 200" 
            width="240" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,77.3,-44.7C85.4,-31.3,90.5,-15.7,89.7,-0.5C88.8,14.7,82,29.4,73.1,43.2C64.1,57,53,69.9,39,78.2C25,86.5,8.1,90.2,-8.1,88.9C-24.3,87.6,-39.8,81.3,-53.2,71.5C-66.5,61.7,-77.7,48.4,-84.4,33.5C-91.1,18.6,-93.3,2.1,-90.4,-13.7C-87.5,-29.5,-79.6,-44.6,-67.7,-55.5C-55.8,-66.4,-39.9,-73.1,-24.8,-78.4C-9.7,-83.7,4.5,-87.6,19.9,-86.3C35.3,-85,51.8,-78.6,44.7,-76.4Z" 
              fill="currentColor" 
              transform="translate(100 100)"
              className="animate-blob-morph"
            />
          </svg>
        </div>

        {/* Subtle secondary particles/waves */}
        <div className="absolute w-48 h-48 border border-white/10 rounded-full animate-ping opacity-20"></div>
        <div className="absolute w-64 h-64 border border-white/5 rounded-full animate-ping opacity-10 [animation-delay:1s]"></div>
      </div>

      {/* Feedback UI */}
      <div className="flex flex-col items-center gap-6 -mt-10 max-w-2xl px-8 text-center">
        <h2 className="text-white text-4xl font-light tracking-[0.2em] uppercase transition-all duration-300">
          {isSpeaking ? 'Speaking' : transcript ? 'Processing' : 'Listening'}
          <span className="animate-pulse">...</span>
        </h2>
        
        <div className="flex flex-col items-center gap-1">
          <p className="text-white text-xl font-medium tracking-wide">
            {transcript ? `"${transcript}"` : '"Show me last month\'s conversion trends"'}
          </p>
          <div className="h-[1px] w-8 bg-white/50 my-4"></div>
          <p className="text-white/40 text-xs font-normal">
            Click anywhere or press <span className="px-1.5 py-0.5 rounded border border-white/20 font-mono text-[10px]">ESC</span> to cancel
          </p>
        </div>
      </div>

      {/* Microphone Indicator Bottom */}
      <div className="absolute bottom-20 flex flex-col items-center gap-4">
        <div className="size-16 rounded-full bg-white flex items-center justify-center text-[#1a1a1a] shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-transform hover:scale-110 active:scale-95">
          <span className="material-symbols-outlined text-3xl">
            {isSpeaking ? 'volume_up' : 'mic'}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-blob {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        .animate-pulse-blob {
          animation: pulse-blob 3s ease-in-out infinite;
        }

        @keyframes blob-morph {
          0%, 100% { d: path("M44.7,-76.4C58.1,-69.2,69.2,-58.1,77.3,-44.7C85.4,-31.3,90.5,-15.7,89.7,-0.5C88.8,14.7,82,29.4,73.1,43.2C64.1,57,53,69.9,39,78.2C25,86.5,8.1,90.2,-8.1,88.9C-24.3,87.6,-39.8,81.3,-53.2,71.5C-66.5,61.7,-77.7,48.4,-84.4,33.5C-91.1,18.6,-93.3,2.1,-90.4,-13.7C-87.5,-29.5,-79.6,-44.6,-67.7,-55.5C-55.8,-66.4,-39.9,-73.1,-24.8,-78.4C-9.7,-83.7,4.5,-87.6,19.9,-86.3C35.3,-85,51.8,-78.6,44.7,-76.4Z"); }
          33% { d: path("M52.3,-71.4C65.4,-61.7,72.4,-44.4,76.5,-27.1C80.6,-9.8,81.8,7.5,75.9,22.1C70,36.7,57,48.5,43.4,58.3C29.8,68.1,14.9,75.9,-1.4,77.9C-17.7,79.9,-35.4,76.1,-50.3,66.1C-65.2,56.1,-77.3,39.9,-81.7,22.2C-86.1,4.5,-82.8,-14.7,-73.9,-29.7C-65,-44.7,-50.5,-55.6,-35.3,-64C-20.1,-72.4,-4.1,-78.3,12.2,-79.8C28.5,-81.3,45.2,-78.4,52.3,-71.4Z"); }
          66% { d: path("M48.2,-75.6C60.4,-68.9,66.8,-50.1,71.6,-32.4C76.4,-14.7,79.6,1.9,76.5,17.4C73.4,32.9,64.1,47.3,51.4,57.1C38.7,66.9,22.7,72.1,5.5,71.1C-11.7,70.1,-30.1,62.9,-44.2,51.9C-58.3,40.9,-68.1,26,-72.9,9.4C-77.7,-7.2,-77.5,-25.5,-69.1,-40.4C-60.7,-55.3,-44.1,-66.8,-28.5,-73.1C-12.9,-79.4,1.7,-80.5,18.5,-79.1C35.3,-77.7,36,-62.3,48.2,-75.6Z"); }
        }
        .animate-blob-morph {
          animation: blob-morph 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
