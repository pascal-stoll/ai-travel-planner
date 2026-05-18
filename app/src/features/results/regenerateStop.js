import { useTravel } from '../../context/useTravel.js';
import { getApiBaseUrl } from '../../config/runtime.js';

// SR02 — Connect /api/regen endpoint
/**
 * Sends a single-stop regeneration request to the backend.
 * @param {Object} params
 * @param {Object} params.currentStop         — the stop to regenerate
 * @param {Object} params.neighboringStops    — { previous, next }
 * @param {Object} params.itineraryContext    — { destination, mood, duration }
 * @returns {Promise<Object>} the new stop from the API
 */
export async function regenerateStop({ currentStop, neighboringStops, itineraryContext }) {
  const API_BASE = getApiBaseUrl();

  const response = await fetch(`${API_BASE}/api/regen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentStop,
      neighboringStops,
      itineraryContext,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `Regeneration failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.stop;
}

// SR03 — Send contextual neighboring stops to AI
/**
 * Extracts the stops immediately adjacent to the target stop.
 * @param {Object[]} allStops    — flat array of all stops across all days
 * @param {number}   targetIndex — index of the stop to regenerate
 * @returns {{ previous: Object|null, next: Object|null }}
 */
export function getNeighboringStops(allStops, targetIndex) {
  return {
    previous: targetIndex > 0 ? allStops[targetIndex - 1] : null,
    next: targetIndex < allStops.length - 1 ? allStops[targetIndex + 1] : null,
  };
}

// SR04 — Replace only regenerated stop in state
// SR06 — Preserve rest of itinerary during regeneration
/**
 * Hook that provides a `handleRegenerate(stopIndex)` function.
 * Only the targeted stop is replaced; the rest of the itinerary is preserved.
 *
 * ⚠️ ADAPTED: TravelContext exposes `activeItinerary`/`setActiveItinerary`
 * (not `currentItinerary`/`setCurrentItinerary` as the spec assumed).
 */
export function useRegenerateStop() {
  const { activeItinerary, setActiveItinerary } = useTravel();

  const handleRegenerate = async (stopIndex) => {
    if (!activeItinerary?.days?.length) return;

    // Flatten all stops across all days, keeping day + in-day index references
    const allStops = [];
    activeItinerary.days.forEach((day, dayIndex) => {
      (day.stops || []).forEach((stop, stopInDayIndex) => {
        allStops.push({ ...stop, _dayIndex: dayIndex, _stopInDayIndex: stopInDayIndex });
      });
    });

    if (stopIndex < 0 || stopIndex >= allStops.length) return;

    const targetStop = allStops[stopIndex];
    const { previous, next } = getNeighboringStops(allStops, stopIndex);

    const newStop = await regenerateStop({
      currentStop: targetStop,
      neighboringStops: { previous, next },
      itineraryContext: {
        destination: activeItinerary.destination,
        mood: activeItinerary.mood,
        duration: activeItinerary.duration,
      },
    });

    setActiveItinerary((prev) => {
      if (!prev?.days?.length) return prev;

      return {
        ...prev,
        days: prev.days.map((day, dayIndex) => {
          if (dayIndex !== targetStop._dayIndex) return day;

          return {
            ...day,
            stops: day.stops.map((stop, stopInDayIndex) => {
              if (stopInDayIndex !== targetStop._stopInDayIndex) return stop;

              return {
                ...stop,
                ...newStop,
                id: newStop.id || stop.id,
                coordinates: newStop.coordinates || stop.coordinates,
              };
            }),
          };
        }),
      };
    });
  };

  return { handleRegenerate };
}
