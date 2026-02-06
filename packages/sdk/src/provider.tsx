'use client';

import React, { createContext, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AudioRecorder } from './audio/recorder';
import { routeRegistry } from './registry/routeMap';
import type { VocalIntent } from './types';
import { VocalRouteClient } from './client';

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
      const clientRef = useRef<VocalRouteClient | null>(null);
      const isStreamingRef = useRef(false);

      const startListening = async () => {
            console.log('🎤 startListening');

            setIsListening(true);
            setTranscript('');

            if (!clientRef.current) {
                  clientRef.current = new VocalRouteClient({
                        wsUrl: process.env.NEXT_PUBLIC_WS_URL,
                  });

                  clientRef.current.onMessage = (intent: VocalIntent) => {
                        console.log('🧠 Intent from server:', intent);
                        const route = routeRegistry[intent.target];
                        if (route) router.push(route);
                  };

                  await clientRef.current.connect(); // ✅ wait here
            }

            clientRef.current.send('audio-start');

            isStreamingRef.current = true;

            await recorderRef.current.start(async (chunk) => {
                  if (!isStreamingRef.current) return;

                  const buffer = await chunk.arrayBuffer();
                  const base64 = btoa(
                        String.fromCharCode(...new Uint8Array(buffer)),
                  );

                  clientRef.current?.send('audio-chunk', base64);
            });
      };




      const stopListening = async () => {
            console.log('🛑 stopListening');

            setIsListening(false);

            isStreamingRef.current = false;
            recorderRef.current.stop();
            clientRef.current?.send('audio-stop');

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
