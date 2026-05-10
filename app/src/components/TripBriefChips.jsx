import React from 'react';

export function TripBriefChips({ wizardState, onChipClick }) {
  if (!wizardState || (!wizardState.mood.length && !wizardState.duration && !wizardState.radius)) return null;

  const entries = [
    {
      key: 'mood',
      label: 'Mood',
      value: wizardState.mood.length ? wizardState.mood.join(' + ') : 'Choose a mood',
      accent: 'text-ocean-deep',
      dot: 'bg-ocean-deep',
    },
    {
      key: 'duration',
      label: 'Duration',
      value: wizardState.duration || 'Set duration',
      accent: 'text-forest-trail',
      dot: 'bg-forest-trail',
    },
    {
      key: 'radius',
      label: 'Radius',
      value: wizardState.radius || 'Set radius',
      accent: 'text-sunset-gold',
      dot: 'bg-sunset-gold',
    },
  ];

  return (
    <div className="overflow-hidden rounded-[1.7rem] border border-slate-200/80 bg-white/92 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div className="px-5 pt-4">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">Your trip brief</p>
      </div>
      <div className="mt-3 grid gap-px bg-slate-200/70 sm:grid-cols-3">
        {entries.map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => onChipClick && onChipClick(entry.key)}
            className="flex items-center gap-3 bg-white px-5 py-4 text-left transition-colors hover:bg-slate-50"
          >
            <span className={`h-11 w-11 rounded-full ${entry.dot} flex items-center justify-center text-white shadow-[0_10px_20px_rgba(15,23,42,0.12)]`}>
              {entry.key === 'mood' ? '≋' : entry.key === 'duration' ? '▣' : '⌖'}
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{entry.label}</span>
              <span className={`mt-1 block truncate text-sm font-semibold ${entry.accent}`}>{entry.value}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
