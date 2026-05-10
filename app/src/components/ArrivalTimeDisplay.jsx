import React from 'react';
import { formatArrivalLabel } from '../features/results/itineraryNormalizer.js';

export function ArrivalTimeDisplay({ value }) {
  return (
    <span className="text-sm font-semibold text-slate-950">
      {formatArrivalLabel(value)}
    </span>
  );
}
