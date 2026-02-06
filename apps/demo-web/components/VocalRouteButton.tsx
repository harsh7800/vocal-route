'use client';

import { useVocalRoute } from 'vocalroute-sdk';

export function VocalRouteButton() {
      const { startListening, isListening } = useVocalRoute();

      if (isListening) return null;

      return (
        <div className="fixed bottom-8 right-8 z-40">
              <button
                        type='button'
                    onClick={startListening}
                    className="size-16 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform group border border-white/10 dark:border-[#1a1a1a]/10"
              >
                    <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">mic</span>
              </button>
        </div>
  );
}
