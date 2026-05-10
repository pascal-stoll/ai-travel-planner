import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/useTravel.js';
import { getItineraryDestinationName, getItineraryMoodLabel } from '../features/results/itineraryNormalizer.js';

function MyTripsPage() {
  const { history } = useTravel();
  const navigate = useNavigate();

  if (!history.length) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[2rem] bg-white/90 p-8 shadow-card backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">My Trips</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Saved itineraries</h1>
        </header>

        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-10 text-center shadow-card backdrop-blur-xl">
          <p className="text-lg font-semibold text-slate-950">No saved trips yet.</p>
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {history.map((trip) => (
          <article key={trip.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{getItineraryDestinationName(trip)}</h2>
                <p className="mt-1 text-sm text-slate-500">{getItineraryMoodLabel(trip) || 'Flexible'}</p>
                <p className="mt-3 text-xs text-slate-500">{new Date(trip.generatedAt).toLocaleDateString()}</p>
              </div>
              <Link
                to={`/results?trip=${encodeURIComponent(trip.id)}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
              >
                Open
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default MyTripsPage;
