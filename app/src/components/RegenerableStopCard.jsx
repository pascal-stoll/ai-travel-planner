import React, { useState } from 'react';
import { ItineraryStopCard } from './ItineraryStopCard.jsx';

// SR01 — Add refresh icon to stop cards
// SR05 — Add inline loading spinner (embedded in button below)
export function RegenerableStopCard({ stop, stopIndex, onRegenerate }) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRefresh = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate(stopIndex);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="relative group">
      {/* ItineraryStopCard receives only its own declared props: stop, compact */}
      <ItineraryStopCard stop={stop} />
      <button
        onClick={handleRefresh}
        disabled={isRegenerating}
        className="absolute top-2 right-2 p-2 rounded-full
                   bg-white/80 hover:bg-white shadow-sm
                   opacity-0 group-hover:opacity-100
                   transition-opacity duration-200
                   disabled:opacity-50"
        aria-label={`Regenerate stop: ${stop.name}`}
        title="Regenerate this stop"
      >
        {isRegenerating ? (
          // SR05 — inline spinner
          <svg className="animate-spin w-4 h-4 text-ocean-deep" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-ocean-deep" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
