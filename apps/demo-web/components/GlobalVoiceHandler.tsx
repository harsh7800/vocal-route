'use client';

import { useVocalRoute } from 'vocalroute-sdk';
import { VoiceOverlay } from './VoiceOverlay';
import { OrganicVoiceOverlay } from './OrganicVoiceOverlay';

export function GlobalVoiceHandler() {
      const { isListening, transcript, stopListening } = useVocalRoute();

      // We are using the new Organic overlay but keeping the code for the old one
      return <OrganicVoiceOverlay isListening={isListening} transcript={transcript} onClose={stopListening} />;
}
