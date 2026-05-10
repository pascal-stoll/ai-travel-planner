import React, { useState } from 'react';
import { getDestinationFallbackImage } from '../features/results/image.js';
import {
  getItineraryDestinationCountry,
  getItineraryDestinationImage,
  getItineraryDestinationName,
  getItineraryMoodLabel,
} from '../features/results/itineraryNormalizer.js';

export function DestinationHeader({ itinerary }) {
  const [imageError, setImageError] = useState(false);

  if (!itinerary) return null;

  const destinationName = getItineraryDestinationName(itinerary);
  const destinationCountry = getItineraryDestinationCountry(itinerary);
  const mood = getItineraryMoodLabel(itinerary);
  const imageSrc = imageError ? getDestinationFallbackImage() : getItineraryDestinationImage(itinerary);

  return (
    <section className="overflow-hidden rounded-[2.25rem] border border-slate-200 bg-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
      <div className="relative min-h-[320px]">
        <img
          src={imageSrc}
          alt={destinationName}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageError(true)}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-slate-950/20" />

        <div className="relative flex min-h-[320px] flex-col justify-end px-6 py-7 sm:px-8 sm:py-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-200">Your TravelMind plan</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">
              {destinationName}
              {destinationCountry ? <span className="block text-white/80">{destinationCountry}</span> : null}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">{itinerary.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-100">
              <span className="rounded-full bg-white/10 px-3 py-1">Mood: {mood || 'Flexible'}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">Duration: {itinerary.duration || 'Flexible'}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">Radius: {itinerary.radius || 'Flexible'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
