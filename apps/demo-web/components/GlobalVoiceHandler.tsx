'use client';

import { useVocalRoute } from 'vocalroute-sdk';
import { VoiceOverlay } from './VoiceOverlay';

export function GlobalVoiceHandler() {
  const { isListening, transcript } = useVocalRoute();

  return <VoiceOverlay isListening={isListening} transcript={transcript} />;
}
