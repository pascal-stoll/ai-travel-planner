import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTravel } from '../context/TravelContext.jsx';
import { DestinationHeader } from '../components/DestinationHeader.jsx';
import { ItineraryList } from '../components/ItineraryList.jsx';
import { MapView } from '../components/MapView.jsx';
import { Toast } from '../components/Toast.jsx';
import { exportItineraryToPdf } from '../services/pdf.js';
import { buildShareLink, parseShareLink } from '../services/share.js';
import { regenerateStop } from '../services/itinerary.js';

function ResultsPage() {
  const location = useLocation();
  const { activeItinerary, saveTrip, history } = useTravel();
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!activeItinerary) {
      const shared = parseShareLink(location.search);
      if (shared) {
        saveTrip(shared);
        setToast('Shared itinerary loaded successfully.');
      }
    }
  }, [activeItinerary, location.search, saveTrip]);

  useEffect(() => {
    if (activeItinerary) {
      saveTrip(activeItinerary);
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

  const handleRegenerate = (dayNumber, stopId) => {
    const updated = regenerateStop(activeItinerary, dayNumber, stopId);
    saveTrip(updated);
    setToast('A stop has been refreshed in your plan.');
  };

  const alreadySaved = history.some((item) => item.id === activeItinerary.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-[2rem] bg-white/90 p-6 shadow-card backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Your itinerary</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">{activeItinerary.destination}</h1>
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

      <DestinationHeader itinerary={activeItinerary} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Duration</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{activeItinerary.duration}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Radius</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{activeItinerary.radius}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Travelers</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{activeItinerary.adults} adults, {activeItinerary.children} kids</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Itinerary</h2>
            <p className="mt-2 text-sm text-slate-600">Each day is designed for effortless discovery and local rhythm.</p>
            <ItineraryList itinerary={activeItinerary} onRegenerate={handleRegenerate} />
          </section>
        </div>

        <div className="space-y-6">
          <MapView itinerary={activeItinerary} />
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-3 text-slate-700">{alreadySaved ? 'This plan is saved in My Trips.' : 'This itinerary will be stored when you leave the page.'}</p>
          </section>
        </div>
      </div>

      {toast ? <Toast message={toast} onClose={() => setToast('')} /> : null}
    </main>
  );
}

export default ResultsPage;
