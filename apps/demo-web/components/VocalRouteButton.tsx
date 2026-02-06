'use client';

import { useVocalRoute } from 'vocalroute-sdk';

export function VocalRouteButton() {
      const { startListening, stopListening } = useVocalRoute();

      return (
            <div className="flex gap-2">
                  <button onClick={startListening}>Start Listening</button>
                  <button onClick={stopListening}>Stop</button>
            </div>
      );
}
