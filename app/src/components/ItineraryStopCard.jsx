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
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Regenerate stop: ${stop.name}`}
            >
              {isRegenerating ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" aria-hidden="true" />
              ) : (
                <span aria-hidden="true">↻</span>
              )}
              <span>{isRegenerating ? 'Updating' : 'Regenerate'}</span>
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
