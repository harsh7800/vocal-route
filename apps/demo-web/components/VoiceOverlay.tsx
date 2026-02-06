'use client';

interface VoiceOverlayProps {
  isListening: boolean;
  transcript?: string;
      onClose?: () => void;
}

export function VoiceOverlay({ isListening, transcript, onClose }: VoiceOverlayProps) {
  if (!isListening) return null;

  return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white/80 dark:bg-[#191919]/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                                <div className="relative flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a1a1a] dark:bg-white opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1a1a1a] dark:bg-white"></span>
                                </div>
                                <p className="text-sm font-bold text-[#1a1a1a] dark:text-white tracking-tight">
                                      {transcript ? 'Processing...' : 'Listening...'}
                                </p>
                          </div>
                          <button
                                type='button'
                                onClick={onClose}
                                className="text-neutral-400 hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
                          >
                                <span className="material-symbols-outlined text-xl">close</span>
                          </button>
                    </div>

                    {/* Waveform */}
                    <div className="flex items-center gap-1.5 h-8 px-2 justify-center">
                          {[...Array(15)].map((_, i) => (
                                <div
                                      key={i.toString()}
                                      className="w-1 bg-[#1a1a1a] dark:bg-white rounded-full animate-waveform-bar"
                                      style={{
                                            height: `${Math.random() * 100}%`,
                                            animationDelay: `${i * 0.1}s`,
                                      }}
                                />
                          ))}
                    </div>

                    {/* Transcript Area */}
                    <div className="bg-neutral-100/50 dark:bg-neutral-800/50 rounded-lg p-3">
                          {transcript ? (
                                <p className="text-sm font-medium text-[#1a1a1a] dark:text-white">"{transcript}"</p>
                          ) : (
                                <>
                                      <p className="text-xs text-neutral-500 mb-1 font-medium">Try saying:</p>
                                      <div className="flex flex-wrap gap-2">
                                            <span className="text-[10px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded-full font-semibold">"Go to Invoices"</span>
                                            <span className="text-[10px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded-full font-semibold">"Update my profile"</span>
                                            <span className="text-[10px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded-full font-semibold">"Show analytics"</span>
                                      </div>
                                </>
                          )}
                    </div>
      </div>

      <style jsx>{`
        @keyframes waveform {
          0%, 100% { height: 20%; }
          50% { height: 80%; }
        }
        .animate-waveform-bar {
          animation: waveform 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
