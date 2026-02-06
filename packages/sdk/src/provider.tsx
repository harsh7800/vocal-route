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

      const startListening = async () => {
           console.log('🎤 startListening');

           setIsListening(true);
           setTranscript('');

           if (!clientRef.current) {
                 clientRef.current = new VocalRouteClient();

                 clientRef.current.onMessage = (intent: VocalIntent) => {
                       console.log('🧠 Intent from server:', intent);

                       setTranscript(`Command: ${intent.target}`);

                       const route = routeRegistry[intent.target];
                       if (route) router.push(route);
                 };

                 clientRef.current.connect();
           }

           await recorderRef.current.start();
     };


      const stopListening = async () => {
            console.log('🛑 stopListening');

            setIsListening(false);
            await recorderRef.current.stop();

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
