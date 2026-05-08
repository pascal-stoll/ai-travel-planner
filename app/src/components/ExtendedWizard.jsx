import React, { useEffect, useState } from 'react';
import { budgetOptions, durationOptions, moodOptions, radiusOptions, transportModes } from '../utils/constants.js';
import { fetchLocationAutocomplete } from '../services/geocode.js';

export function ExtendedWizard({ wizardState, onChange, onSubmit }) {
  const [query, setQuery] = useState(wizardState.location?.label || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const suggestions = await fetchLocationAutocomplete(query);
      setResults(suggestions);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <legend className="mb-3 text-sm font-semibold text-slate-900">Mood</legend>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ mood: wizardState.mood.includes(option.value) ? wizardState.mood.filter((item) => item !== option.value) : [...wizardState.mood, option.value] })}
                className={`rounded-2xl px-3 py-2 text-sm transition ${wizardState.mood.includes(option.value) ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <legend className="mb-3 text-sm font-semibold text-slate-900">Travel radius</legend>
          <div className="space-y-3">
            {radiusOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:border-slate-300">
                <input
                  name="radius"
                  type="radio"
                  checked={wizardState.radius === option.value}
                  onChange={() => onChange({ radius: option.value })}
                  className="h-4 w-4 accent-slate-900"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <span className="mb-2 block text-sm font-semibold text-slate-900">Duration</span>
          <select
            value={wizardState.duration}
            onChange={(event) => onChange({ duration: event.target.value })}
            className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-slate-900 focus:outline-none"
          >
            <option value="">Choose duration</option>
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="block rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <span className="mb-2 block text-sm font-semibold text-slate-900">Budget</span>
          <select
            value={wizardState.budget}
            onChange={(event) => onChange({ budget: event.target.value })}
            className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-slate-900 focus:outline-none"
          >
            {budgetOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <span className="mb-2 block text-sm font-semibold text-slate-900">Travel companions</span>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              Adults
              <input
                type="number"
                min="1"
                value={wizardState.adults}
                onChange={(event) => onChange({ adults: Number(event.target.value) })}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              Children
              <input
                type="number"
                min="0"
                value={wizardState.children}
                onChange={(event) => onChange({ children: Number(event.target.value) })}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </label>

        <fieldset className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <legend className="mb-3 text-sm font-semibold text-slate-900">Transport</legend>
          <div className="flex flex-wrap gap-2">
            {transportModes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  const next = wizardState.transport.includes(option)
                    ? wizardState.transport.filter((item) => item !== option)
                    : [...wizardState.transport, option];
                  onChange({ transport: next.length ? next : [option] });
                }}
                className={`rounded-2xl px-3 py-2 text-sm transition ${wizardState.transport.includes(option) ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <label className="block rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <span className="mb-2 block text-sm font-semibold text-slate-900">Starting location</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a city or village"
          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-slate-900 focus:outline-none"
        />
        <div className="mt-3 space-y-2">
          {loading ? (
            <p className="text-sm text-slate-500">Searching …</p>
          ) : results.length ? (
            results.map((result) => (
              <button
                type="button"
                key={result.place_id}
                onClick={() => {
                  setQuery(result.display_name);
                  onChange({ location: { label: result.display_name, coords: [Number(result.lat), Number(result.lon)] } });
                  setResults([]);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                {result.display_name}
              </button>
            ))
          ) : (
            <p className="text-sm text-slate-500">Type to search a base location.</p>
          )}
        </div>
      </label>

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Ready to create</p>
        <p className="text-sm text-slate-500">Mood selected: {wizardState.mood.length ? wizardState.mood.join(', ') : 'None yet'}</p>
        <button
          type="button"
          onClick={onSubmit}
          className="mt-3 inline-flex items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Generate itinerary
        </button>
      </div>
    </div>
  );
}
