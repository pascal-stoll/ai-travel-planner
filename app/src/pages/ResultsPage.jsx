import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/useTravel.js';
import { TripDetailShell } from '../components/TripDetailShell.jsx';
import { DeleteTripModal } from '../components/DeleteTripModal.jsx';
import { parseShareLink } from '../services/share.js';
import { normalizeItinerary } from '../features/results/itineraryNormalizer.js';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeItinerary, saveTrip, history, loadTrip, removeTrip } = useTravel();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleDeleteTrip = () => {
    removeTrip(currentTrip.id, { source: currentTrip.source });
    setShowDeleteModal(false);
    navigate('/trips');
  };

  return (
    <>
      <TripDetailShell
        itinerary={currentTrip}
        primaryActionHref="/?edit=true"
        primaryActionLabel="Edit trip"
        secondaryActionHref="/trips"
        secondaryActionLabel="My Trips"
        onDeleteTrip={() => setShowDeleteModal(true)}
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
