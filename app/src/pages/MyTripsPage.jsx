// MT03 — Add search/filter input
// MT04 — Implement real-time filtering
//
// ⚠️ ADAPTED: spec rewrote MyTripsPage from scratch using loadAllTrips() +
//             deleteTrip() and a standalone trips array in useState. The existing
//             page uses useTravel() context (history + removeTrip) which is the
//             authoritative source of trip state. We extend the existing page:
//             - add loadAllTrips/deleteTrip imports (MT01 wrappers)
//             - keep useTravel() as the state source (history)
//             - add searchQuery state + filteredTrips computed from history
//             - replace the inline article grid with TripHistoryCard
//             - keep the DeleteTripModal pattern from the original
// ⚠️ ADAPTED: spec used trip._key; context trips use trip.id
// ⚠️ ADAPTED: navigate to /results?trip=<id> for opening (matches existing Open link)

import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/useTravel.js';
import { DeleteTripModal } from '../components/DeleteTripModal.jsx';
import { SwipeableTripCard } from '../components/SwipeableTripCard.jsx';

function MyTripsPage() {
  const { history, removeTrip } = useTravel();
  const navigate = useNavigate();
  const [tripToDelete, setTripToDelete] = useState(null);

  // MT03 — search query state
  const [searchQuery, setSearchQuery] = useState('');

  // MT04 — real-time filtering on destination name (no debounce, client-side)
  const filteredTrips = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter((trip) => {
      const name = (trip.destinationName || trip.destination?.name || '').toLowerCase();
      return name.includes(q);
    });
  }, [history, searchQuery]);

  const handleConfirmDelete = () => {
    if (!tripToDelete) return;
    removeTrip(tripToDelete.id, { source: tripToDelete.source });
    setTripToDelete(null);
  };

  const handleCardClick = (trip) => {
    navigate(`/results?trip=${encodeURIComponent(trip.id)}`);
  };

  // Empty state (no trips at all — before filtering)
  if (history.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[2rem] bg-white/90 p-8 shadow-card backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">My Trips</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Saved itineraries</h1>
        </header>

        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-10 text-center shadow-card backdrop-blur-xl">
          <svg className="mx-auto mb-4 w-16 h-16 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-lg font-semibold text-slate-950">No trips yet</p>
          <p className="mt-3 text-slate-600">Create an itinerary on the landing page to save a plan here.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
          >
            Back to landing
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-[2rem] bg-white/90 p-8 shadow-card backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">My Trips</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Saved itineraries</h1>
            <p className="mt-2 text-slate-600">Open a trip to continue with the detailed map and itinerary view.</p>
          </div>
          <Link
            to="/"
            className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
          >
            Back to landing
          </Link>
        </div>
      </header>

      {/* MT03 — Search input */}
      <div className="relative mb-6">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          id="trips-search"
          type="text"
          placeholder="Search by destination name…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200
                     bg-white shadow-sm text-slate-900 placeholder-slate-400 text-sm
                     focus:outline-none focus:ring-2 focus:ring-ocean-deep/30 focus:border-ocean-deep/50
                     transition"
          aria-label="Search saved trips by destination name"
        />
      </div>

      {/* MT04 — Real-time filtered list */}
      {filteredTrips.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-10 text-center shadow-card backdrop-blur-xl">
          <p className="text-lg font-semibold text-slate-950">No trips match &ldquo;{searchQuery}&rdquo;</p>
          <p className="mt-2 text-sm text-slate-500">Try a different destination name.</p>
        </div>
      ) : (
        <section className="space-y-3">
          {filteredTrips.map((trip) => (
            // MT05 — wrapped in SwipeableTripCard for mobile swipe-to-delete
            <SwipeableTripCard
              key={trip.id}
              trip={trip}
              onDelete={() => setTripToDelete(trip)}
              onClick={handleCardClick}
            />
          ))}
        </section>
      )}

      <DeleteTripModal
        open={Boolean(tripToDelete)}
        destinationName={tripToDelete?.destinationName || ''}
        onCancel={() => setTripToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}

export default MyTripsPage;
