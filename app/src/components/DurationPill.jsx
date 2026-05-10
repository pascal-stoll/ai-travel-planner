import React from 'react';
import { formatDurationLabelFromMinutes } from '../features/results/itineraryNormalizer.js';

export function DurationPill({ minutes }) {
  return (
    <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
      {formatDurationLabelFromMinutes(minutes)}
    </span>
  );
}
