// MT02 — Display destination thumbnail and metadata
//
// ⚠️ ADAPTED: The existing component had signature TripHistoryCard({ trip })
//             with no onDelete/onClick. Replaced to add those props.
// ⚠️ ADAPTED: Data shape comes from normalizeSavedTripEntry in tripStorage.js,
//             so fields are: destinationName, thumbnailUrl, travelStyle (array),
//             durationLabel, generatedAt, stopCount — NOT trip.destination.name
//             or trip.mood[] as the spec assumed.

import React from 'react';

export function TripHistoryCard({ trip, onDelete, onClick }) {
  const name = trip.destinationName || trip.itinerary?.destination?.name || 'Unknown destination';
  const thumbnail = trip.thumbnailUrl || '/destination-placeholder.svg';
  const styles = Array.isArray(trip.travelStyle) ? trip.travelStyle : [];
  const date = trip.generatedAt ? new Date(trip.generatedAt).toLocaleDateString() : '';
  const stops = trip.stopCount ?? 0;
  const tripId = trip.id;

  return (
    <div
      className="flex items-center gap-4 p-4 bg-white rounded-[1.75rem]
                 border border-slate-200 shadow-sm
                 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(trip)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(trip)}
    >
      {/* Thumbnail */}
      <img
        src={thumbnail}
        alt={name}
        className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-slate-100"
        onError={(e) => { e.currentTarget.src = '/destination-placeholder.svg'; }}
      />

      {/* Metadata */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-950 truncate">{name}</h3>

        {/* Mood / style chips */}
        {styles.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {styles.slice(0, 2).map((s) => (
              <span
                key={s}
                className="text-xs px-2 py-0.5 rounded-full bg-ocean-deep/10 text-ocean-deep font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
          {date && <span>{date}</span>}
          {stops > 0 && <span>{stops} stops</span>}
        </div>
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(tripId); }}
          className="p-2 text-slate-400 hover:text-rose-600 transition-colors flex-shrink-0"
          aria-label={`Delete trip to ${name}`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
