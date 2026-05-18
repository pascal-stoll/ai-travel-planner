import React from 'react';
import { ArrivalTimeDisplay } from './ArrivalTimeDisplay.jsx';
import { CategoryChip } from './CategoryChip.jsx';
import { DurationPill } from './DurationPill.jsx';

export function ItineraryStopCard({ stop, compact = false, onRegenerate = null, isRegenerating = false }) {
  return (
    <article className={`rounded-[1.75rem] border border-slate-200 bg-white shadow-sm ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className={compact ? 'space-y-2' : 'space-y-3'}>
          <div className="flex flex-wrap items-center gap-2">
            <ArrivalTimeDisplay value={stop.arrivalTime} />
            <CategoryChip category={stop.category} />
          </div>
          <div>
            <h3 className={`font-semibold tracking-tight text-slate-950 ${compact ? 'text-base' : 'text-lg'}`}>{stop.name}</h3>
            <p className={`mt-2 max-w-3xl leading-6 text-slate-600 ${compact ? 'text-xs' : 'text-sm'}`}>{stop.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <DurationPill minutes={stop.durationMinutes} />
          {onRegenerate ? (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Regenerate stop: ${stop.name}`}
              title="Regenerate this stop"
            >
              {isRegenerating ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" aria-hidden="true" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M20 6v5h-5M4 18v-5h5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.4 9A7 7 0 0 0 6.2 6.6L4 8.8M5.6 15A7 7 0 0 0 17.8 17.4L20 15.2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span className="sr-only">{isRegenerating ? 'Updating stop' : 'Regenerate stop'}</span>
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
