import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/useTravel.js';
import { TripDetailShell } from '../components/TripDetailShell.jsx';
import { DeleteTripModal } from '../components/DeleteTripModal.jsx';
import { parseShareLink } from '../services/share.js';
import { buildStopRegenerationRequest } from '../services/itinerary.js';
import { requestStopRegeneration } from '../features/results/itineraryApi.js';
import { normalizeItinerary } from '../features/results/itineraryNormalizer.js';

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function buildTravelNote(currentCoords, nextCoords) {
  if (!currentCoords || !nextCoords) return 'Short transfer to the next stop.';

  const [lat1, lng1] = currentCoords;
  const [lat2, lng2] = nextCoords;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const distanceKm = 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  if (!Number.isFinite(distanceKm) || distanceKm < 0.4) return 'About a 5-minute walk to the next stop.';
  if (distanceKm < 2) return 'Roughly a 10-minute walk to the next stop.';
  if (distanceKm < 8) return 'Expect around 15 minutes by taxi or transit to the next stop.';
  return 'Allow about 25 minutes for the transfer to the next stop.';
}

function applyRegeneratedStop(itinerary, dayId, stopId, replacementStop) {
  const updatedDays = itinerary.days.map((day) => {
    if (day.id !== dayId) return day;

    const stops = day.stops.map((stop) => (stop.id === stopId ? { ...stop, ...replacementStop, id: replacementStop.id || stop.id } : stop));
    const nextStops = stops.map((stop, index) => {
      if (index === stops.length - 1) return { ...stop, travelToNext: stop.travelToNext || null };
      return {
        ...stop,
        travelToNext: buildTravelNote(stop.coordinates, stops[index + 1].coordinates),
      };
    });

    return {
      ...day,
      stops: nextStops,
    };
  });

  return {
    ...itinerary,
    days: updatedDays,
  };
}

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeItinerary, saveTrip, history, loadTrip, removeTrip } = useTravel();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [regeneratingStopKey, setRegeneratingStopKey] = useState(null);
  const [regenError, setRegenError] = useState('');
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const tripId = params.get('trip');
  const sharedTrip = params.get('share');

  const currentTrip = useMemo(() => {
    if (tripId) {
      return history.find((item) => item.id === tripId) || (activeItinerary?.id === tripId ? activeItinerary : null);
    }
    return activeItinerary || null;
  }, [activeItinerary, history, tripId]);

  useEffect(() => {
    if (tripId && (!activeItinerary || activeItinerary.id !== tripId)) {
      loadTrip(tripId);
      return;
    }

    if (!currentTrip && sharedTrip) {
      const parsed = parseShareLink(location.search);
      if (parsed) {
        try {
          const normalized = normalizeItinerary(parsed);
          if (normalized) {
            saveTrip(normalized);
          }
        } catch {
          // Keep the page stable even if the shared trip is malformed.
        }
      }
      return;
    }

    if (currentTrip) {
      try {
        const normalized = normalizeItinerary(currentTrip);
        if (normalized && normalized.id !== currentTrip.id) {
          saveTrip(normalized);
        }
      } catch {
        // Keep the page stable if normalization fails.
      }
    }
  }, [activeItinerary, currentTrip, loadTrip, location.search, saveTrip, sharedTrip, tripId]);

  if (!currentTrip) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-lg font-semibold text-slate-900">No itinerary found.</p>
        <p className="mt-3 text-slate-600">Create a trip on the landing page and come back to see your plan.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
          Back to start
        </Link>
      </main>
    );
  }

  const alreadySaved = history.some((item) => item.id === currentTrip.id);

  const handleRegenerateStop = async ({ day, dayIndex, stop, stopIndex }) => {
    if (!currentTrip) return;

    const regenKey = `${day.id}:${stop.id}`;
    setRegeneratingStopKey(regenKey);
    setRegenError('');

    try {
      const requestPayload = buildStopRegenerationRequest(currentTrip, dayIndex, stopIndex);
      const replacementStop = await requestStopRegeneration(requestPayload);
      const updatedTrip = applyRegeneratedStop(currentTrip, day.id, stop.id, replacementStop);
      saveTrip(updatedTrip);
    } catch (error) {
      setRegenError(error?.message || 'Unable to regenerate this stop right now.');
    } finally {
      setRegeneratingStopKey(null);
    }
  };

  const handleDeleteTrip = () => {
    removeTrip(currentTrip.id, { source: currentTrip.source });
    setShowDeleteModal(false);
    navigate('/trips');
  };

  return (
    <>
      {regenError ? (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {regenError}
          </div>
        </div>
      ) : null}
      <TripDetailShell
        itinerary={currentTrip}
        primaryActionHref="/?edit=true"
        primaryActionLabel="Edit trip"
        secondaryActionHref="/trips"
        secondaryActionLabel="My Trips"
        onDeleteTrip={() => setShowDeleteModal(true)}
        onRegenerateStop={handleRegenerateStop}
        regeneratingStopKey={regeneratingStopKey}
        showSavedState
        savedLabel={alreadySaved ? 'Saved in My Trips' : 'Not yet saved'}
      />
      <DeleteTripModal
        open={showDeleteModal}
        destinationName={currentTrip?.destinationName || currentTrip?.destination?.name || ''}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteTrip}
      />
    </>
  );
}

export default ResultsPage;
