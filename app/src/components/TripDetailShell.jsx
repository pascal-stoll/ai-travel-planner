import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DestinationHeader } from './DestinationHeader.jsx';
import { ItineraryList } from './ItineraryList.jsx';
import { MapView } from './MapView.jsx';
import { exportItineraryToPdf } from '../services/pdf.js';
import { buildShareLink } from '../services/share.js';
import { getItineraryMoodLabel } from '../features/results/itineraryNormalizer.js';

export function TripDetailShell({
  itinerary,
  primaryActionLabel = 'Edit trip',
  primaryActionHref = '/',
  secondaryActionLabel,
  secondaryActionHref,
  onDeleteTrip = null,
  showSavedState = false,
  savedLabel = '',
  showTripListLink = false,
  tripListHref = '/trips',
  tripListLabel = 'Back to list',
}) {
  const [toast, setToast] = useState('');

  if (!itinerary) return null;

  const handleCopyShare = async () => {
    try {
      const url = buildShareLink(itinerary);
      await navigator.clipboard.writeText(url);
      setToast('Share link copied to clipboard.');
    } catch {
      setToast('Unable to copy share link.');
    }
  };

  const handleDownload = () => {
    exportItineraryToPdf(itinerary);
    setToast('Your itinerary PDF is downloading.');
  };

  const topActions = [
    primaryActionHref
      ? {
          label: primaryActionLabel,
          href: primaryActionHref,
          variant: 'link',
        }
      : null,
    secondaryActionHref && secondaryActionLabel
      ? {
          label: secondaryActionLabel,
          href: secondaryActionHref,
          variant: 'link',
        }
      : null,
  ].filter(Boolean);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {showTripListLink ? (
            <Link to={tripListHref} className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
              {tripListLabel}
            </Link>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          {topActions.map((action) => (
            <Link key={action.label} to={action.href} className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
              {action.label}
            </Link>
          ))}
          <button type="button" onClick={handleDownload} className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
            Export PDF
          </button>
          <button type="button" onClick={handleCopyShare} className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
            Copy share link
          </button>
          {onDeleteTrip ? (
            <button
              type="button"
              onClick={onDeleteTrip}
              className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
            >
              Delete trip
            </button>
          ) : null}
        </div>
      </div>

      <DestinationHeader
        key={itinerary.id}
        itinerary={itinerary}
        variant="compact"
        actions={(
          <>
            <button
              type="button"
              onClick={handleCopyShare}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition hover:scale-105"
              aria-label="Copy share link"
            >
              ↗
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition hover:scale-105"
              aria-label="Export PDF"
            >
              ⤴
            </button>
          </>
        )}
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200">
          <button type="button" className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white">
            List View
          </button>
          <button type="button" className="rounded-full px-5 py-2 text-sm font-semibold text-slate-500">
            Map View
          </button>
        </div>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <div className="min-w-0">
          <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-4 shadow-card backdrop-blur-xl sm:p-5">
            <ItineraryList itinerary={itinerary} compact />
          </div>
        </div>

        <aside className="space-y-5">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <MapView itinerary={itinerary} className="h-[320px]" />
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Trip Specification</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <span className="text-slate-500">Duration</span>
                <span className="font-semibold text-slate-950">{itinerary.duration || 'Flexible'}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <span className="text-slate-500">Radius</span>
                <span className="font-semibold text-slate-950">{itinerary.radius || 'Flexible'}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <span className="text-slate-500">Travel style</span>
                <span className="font-semibold text-slate-950">{getItineraryMoodLabel(itinerary) || 'Flexible'}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <span className="text-slate-500">Travelers</span>
                <span className="font-semibold text-slate-950">{itinerary.adults} adults, {itinerary.children} kids</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <span className="text-slate-500">Budget</span>
                <span className="font-semibold text-slate-950">{itinerary.budget || 'Flexible'}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Transport</span>
                <span className="font-semibold text-slate-950">{Array.isArray(itinerary.transport) ? itinerary.transport.join(', ') : itinerary.transport || 'Flexible'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">AI Tips</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{itinerary.subtitle}</p>
          </div>
        </aside>
      </section>

      {showSavedState ? (
        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-4 text-sm text-slate-600">
          {savedLabel}
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 right-6 rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
