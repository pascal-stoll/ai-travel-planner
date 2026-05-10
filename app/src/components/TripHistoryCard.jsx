import React from 'react';
import { getItineraryDestinationName } from '../features/results/itineraryNormalizer.js';

export function TripHistoryCard({ trip }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{getItineraryDestinationName(trip)}</h3>
          <p className="mt-1 text-sm text-slate-500">Saved on {new Date(trip.generatedAt).toLocaleDateString()}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{trip.duration}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-full bg-slate-50 px-2 py-1 ring-1 ring-slate-200">Mood: {trip.mood}</span>
        <span className="rounded-full bg-slate-50 px-2 py-1 ring-1 ring-slate-200">Radius: {trip.radius}</span>
        <span className="rounded-full bg-slate-50 px-2 py-1 ring-1 ring-slate-200">
          Transport: {Array.isArray(trip.transport) ? trip.transport.join(', ') : trip.transport || 'Car'}
        </span>
      </div>
    </div>
  );
}
