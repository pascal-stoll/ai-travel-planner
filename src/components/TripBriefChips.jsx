import React from 'react';

export function TripBriefChips({ wizardState }) {
  if (!wizardState) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-700">
      {wizardState.mood.length ? <span className="rounded-full bg-slate-100 px-3 py-1">Mood: {wizardState.mood.join(', ')}</span> : null}
      {wizardState.duration ? <span className="rounded-full bg-slate-100 px-3 py-1">Duration: {wizardState.duration}</span> : null}
      {wizardState.radius ? <span className="rounded-full bg-slate-100 px-3 py-1">Radius: {wizardState.radius}</span> : null}
      {wizardState.location?.label ? <span className="rounded-full bg-slate-100 px-3 py-1">Home: {wizardState.location.label}</span> : null}
    </div>
  );
}
