import React from 'react';

export function DestinationHeader({ itinerary }) {
  if (!itinerary) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white shadow-lg">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-200">Your TravelMind plan</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">{itinerary.destination}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">{itinerary.subtitle}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-100">
          <span className="rounded-full bg-white/10 px-3 py-1">Mood: {itinerary.mood}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Duration: {itinerary.duration}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Radius: {itinerary.radius}</span>
        </div>
      </div>
    </div>
  );
}
