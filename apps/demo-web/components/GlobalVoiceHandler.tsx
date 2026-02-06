'use client';

import { useVocalRoute } from 'vocalroute-sdk';
import { VoiceOverlay } from './VoiceOverlay';

export function GlobalVoiceHandler() {
      const { isListening, transcript, stopListening } = useVocalRoute();

      return <VoiceOverlay isListening={isListening} transcript={transcript} onClose={stopListening} />;
}
