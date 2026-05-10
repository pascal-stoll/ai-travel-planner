import React from 'react';
import { ArrivalTimeDisplay } from './ArrivalTimeDisplay.jsx';
import { CategoryChip } from './CategoryChip.jsx';
import { DurationPill } from './DurationPill.jsx';

export function ItineraryStopCard({ stop }) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <ArrivalTimeDisplay value={stop.arrivalTime} />
            <CategoryChip category={stop.category} />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-950">{stop.name}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{stop.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DurationPill minutes={stop.durationMinutes} />
        </div>
      </div>
    </article>
  );
}
