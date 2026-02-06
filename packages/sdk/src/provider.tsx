'use client';

import React, { createContext, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AudioRecorder } from './audio/recorder';
import { routeRegistry } from './registry/routeMap';
import type { VocalIntent } from './types';

type ContextType = {
      isListening: boolean;
      transcript: string;
      startListening: () => Promise<void>;
      stopListening: () => Promise<void>;
};

const VocalRouteContext = createContext<ContextType | null>(null);

export function VocalRouteProvider({ children }: { children: React.ReactNode }) {
      const [isListening, setIsListening] = React.useState(false);
      const [transcript, setTranscript] = React.useState('');
      const recorderRef = useRef(new AudioRecorder());
      const router = useRouter();

      const startListening = async () => {
            setIsListening(true);
            setTranscript('');
            await recorderRef.current.start();
      };

      const stopListening = async () => {
            setIsListening(false);
            const _audio = await recorderRef.current.stop();

            // 🔴 Fake intent for now
            setTranscript('Take me to invoices');

            const intent: VocalIntent = {
                  intent: 'navigate',
                  target: 'invoices',
                  confidence: 0.95,
            };

            const route = routeRegistry[intent.target];
            if (route) router.push(route);
      };

      return (
            <VocalRouteContext.Provider value={{ isListening, transcript, startListening, stopListening }}>
                  {children}
            </VocalRouteContext.Provider>
      );
}

export const useVocalRoute = () => {
      const ctx = useContext(VocalRouteContext);
      if (!ctx) throw new Error('useVocalRoute must be used inside provider');
      return ctx;
};
