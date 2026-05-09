import React from 'react';

export function TripBriefChips({ wizardState, onChipClick }) {
  if (!wizardState || (!wizardState.mood.length && !wizardState.duration && !wizardState.radius)) return null;
  
  const getChipColor = (type) => {
    switch (type) {
      case 'mood': return 'bg-ocean-deep hover:bg-ocean-deep/90';
      case 'duration': return 'bg-forest-trail hover:bg-forest-trail/90';
      case 'radius': return 'bg-sunset-gold hover:bg-sunset-gold/90';
      default: return 'bg-slate-200 hover:bg-slate-300';
    }
  };

  return (
    <div className="mb-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
      <p className="text-sm font-medium text-slate-500 mb-3">Your selections</p>
      <div className="flex flex-wrap gap-2">
        {wizardState.mood.map((mood) => (
          <button
            key={mood}
            onClick={() => onChipClick && onChipClick('mood')}
            className={`rounded-full ${getChipColor('mood')} px-3 py-1 text-sm font-medium text-white transition-colors cursor-pointer`}
          >
            {mood}
          </button>
        ))}
        {wizardState.duration && (
          <button
            onClick={() => onChipClick && onChipClick('duration')}
            className={`rounded-full ${getChipColor('duration')} px-3 py-1 text-sm font-medium text-white transition-colors cursor-pointer`}
          >
            {wizardState.duration}
          </button>
        )}
        {wizardState.radius && (
          <button
            onClick={() => onChipClick && onChipClick('radius')}
            className={`rounded-full ${getChipColor('radius')} px-3 py-1 text-sm font-medium text-white transition-colors cursor-pointer`}
          >
            {wizardState.radius}
          </button>
        )}
      </div>
    </div>
  );
}
