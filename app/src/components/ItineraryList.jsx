import React, { useState } from 'react';
import { DayCardAccordion } from './DayCardAccordion.jsx';
import { ItineraryStopCard } from './ItineraryStopCard.jsx';
import { TravelNote } from './TravelNote.jsx';

export function ItineraryList({ itinerary, compact = false }) {
  const [openDayId, setOpenDayId] = useState(() => itinerary?.days?.[0]?.id || null);

  if (!itinerary?.days?.length) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        No itinerary details are available yet.
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {itinerary.days.map((day) => {
        const isOpen = openDayId === day.id;

        return (
          <DayCardAccordion
            key={day.id}
            day={day}
            open={isOpen}
            compact={compact}
            onToggle={() => setOpenDayId((current) => (current === day.id ? null : day.id))}
          >
            <div className={compact ? 'space-y-3' : 'space-y-4'}>
              {day.stops.map((stop, index) => (
                <div key={stop.id} className={compact ? 'space-y-3' : 'space-y-4'}>
                  <ItineraryStopCard stop={stop} compact={compact} />
                  {index < day.stops.length - 1 ? <TravelNote note={stop.travelToNext} compact={compact} /> : null}
                </div>
              ))}
            </div>
          </DayCardAccordion>
        );
      })}
    </div>
  );
}
