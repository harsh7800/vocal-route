'use client';

import { useVocalRoute } from 'vocalroute-sdk';
import { OrganicVoiceOverlay } from './OrganicVoiceOverlay';

export function GlobalVoiceHandler() {
      const { isListening, transcript, error, confidence, volume, stopListening, startListening } = useVocalRoute();

      // We are using the new Organic overlay but keeping the code for the old one
      return <OrganicVoiceOverlay
            isListening={isListening}
            transcript={transcript}
            error={error}
            confidence={confidence}
            volume={volume}
            onClose={stopListening}
            onRetry={startListening}
      />;
}
