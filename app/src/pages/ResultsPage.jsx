import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTravel } from '../context/useTravel.js';
import { DestinationHeader } from '../components/DestinationHeader.jsx';
import { ItineraryList } from '../components/ItineraryList.jsx';
import { Toast } from '../components/Toast.jsx';
import { exportItineraryToPdf } from '../services/pdf.js';
import { buildShareLink, parseShareLink } from '../services/share.js';
import { getItineraryDestinationName, normalizeItinerary } from '../features/results/itineraryNormalizer.js';

function ResultsPage() {
  const location = useLocation();
  const { activeItinerary, saveTrip, history } = useTravel();
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!activeItinerary) {
      const shared = parseShareLink(location.search);
      if (shared) {
        try {
          const normalized = normalizeItinerary(shared);
          if (normalized) {
            saveTrip(normalized);
            setTimeout(() => setToast('Shared itinerary loaded successfully.'), 0);
          }
        } catch {
          setTimeout(() => setToast('The shared itinerary could not be opened.'), 0);
        }
      }
    }
  }, [activeItinerary, location.search, saveTrip]);

  useEffect(() => {
    if (activeItinerary) {
      try {
        const normalized = normalizeItinerary(activeItinerary);
        if (normalized && normalized.id !== activeItinerary.id) {
          saveTrip(normalized);
        }
      } catch {
        console.warn('The current itinerary could not be normalized.');
      }
    }
  }, [activeItinerary, saveTrip]);

  if (!activeItinerary) {
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

  const handleCopyShare = async () => {
    try {
      const url = buildShareLink(activeItinerary);
      await navigator.clipboard.writeText(url);
      setToast('Share link copied to clipboard.');
    } catch {
      setToast('Unable to copy share link.');
    }
  };

  const handleDownload = () => {
    exportItineraryToPdf(activeItinerary);
    setToast('Your itinerary PDF is downloading.');
  };

  const alreadySaved = history.some((item) => item.id === activeItinerary.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-[2rem] bg-white/90 p-6 shadow-card backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Your itinerary</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">{getItineraryDestinationName(activeItinerary)}</h1>
          <p className="mt-2 text-slate-600">{activeItinerary.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
            Edit trip
          </Link>
          <button type="button" onClick={handleDownload} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Export PDF
          </button>
          <button type="button" onClick={handleCopyShare} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
            Copy share link
          </button>
        </div>
      </div>

      <DestinationHeader key={activeItinerary.id} itinerary={activeItinerary} />

      <div className="mt-8 space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Duration</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{activeItinerary.duration || 'Flexible'}</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Radius</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{activeItinerary.radius || 'Flexible'}</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Travelers</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{activeItinerary.adults} adults, {activeItinerary.children} kids</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Mood</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{activeItinerary.mood || 'Flexible'}</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Itinerary</h2>
              <p className="mt-2 text-sm text-slate-600">Each day is arranged in chronological order with travel notes between stops.</p>
            </div>
            <p className="text-sm text-slate-500">{alreadySaved ? 'Saved in My Trips' : 'Not yet saved'}</p>
          </div>
          <div className="mt-6">
            <ItineraryList key={activeItinerary.id} itinerary={activeItinerary} />
          </div>
        </section>
      </div>

      {toast ? <Toast message={toast} onClose={() => setToast('')} /> : null}
    </main>
  );
}

export default ResultsPage;
