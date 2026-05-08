import React from 'react';

export function ItineraryList({ itinerary, onRegenerate }) {
  if (!itinerary) return null;

  return (
    <div className="space-y-6">
      {itinerary.days.map((day) => (
        <div key={day.day} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">{day.title}</p>
              <p className="mt-1 text-sm text-slate-500">A balanced day with local highlights.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{day.stops.length} stops</span>
          </div>
          <div className="mt-4 space-y-4">
            {day.stops.map((stop) => (
              <div key={stop.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{stop.time} • {stop.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{stop.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">{stop.duration}</span>
                    <span className="rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">{stop.transport}</span>
                    <button
                      type="button"
                      onClick={() => onRegenerate(day.day, stop.id)}
                      className="rounded-full bg-slate-900 px-3 py-1 text-white transition hover:bg-slate-700"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
