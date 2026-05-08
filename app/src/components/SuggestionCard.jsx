import React from 'react';

export function SuggestionCard({ suggestion, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(suggestion)}
      className="group w-full rounded-3xl border border-slate-200 p-5 text-left transition hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{suggestion.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{suggestion.subtitle}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{suggestion.distance} km</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">Mood: {suggestion.match}</span>
        <span className="rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">Radius: Nearby</span>
      </div>
    </button>
  );
}
