import React from 'react';
import { ArrivalTimeDisplay } from './ArrivalTimeDisplay.jsx';
import { CategoryChip } from './CategoryChip.jsx';
import { DurationPill } from './DurationPill.jsx';

export function ItineraryStopCard({ stop, compact = false }) {
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
        <div className="flex flex-wrap items-center gap-2">
          <DurationPill minutes={stop.durationMinutes} />
        </div>
      </div>
    </article>
  );
}
