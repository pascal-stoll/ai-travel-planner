import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultWizardState } from '../utils/constants.js';
import { tryNormalizeItinerary } from '../features/results/itineraryNormalizer.js';
import { TravelContext } from './travelContext.js';

const STORAGE_KEYS = {
  ACTIVE: 'travelmind-active',
  HISTORY: 'travelmind-history',
  WIZARD: 'travelmind-wizard',
};

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);

    if (key === STORAGE_KEYS.WIZARD && parsed.timestamp) {
      const age = Date.now() - parsed.timestamp;
      const maxAge = 24 * 60 * 60 * 1000;
      if (age > maxAge) {
        window.localStorage.removeItem(key);
        return fallback;
      }
    }

    return key === STORAGE_KEYS.WIZARD ? parsed.data : parsed;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return;

  const data = key === STORAGE_KEYS.WIZARD
    ? { data: value, timestamp: Date.now() }
    : value;

  window.localStorage.setItem(key, JSON.stringify(data));
}

export function TravelProvider({ children }) {
  const [wizardState, setWizardState] = useState(() => readJson(STORAGE_KEYS.WIZARD, defaultWizardState));
  const [activeItinerary, setActiveItinerary] = useState(() => tryNormalizeItinerary(readJson(STORAGE_KEYS.ACTIVE, null)) || null);
  const [history, setHistory] = useState(() => {
    const stored = readJson(STORAGE_KEYS.HISTORY, []);
    return Array.isArray(stored) ? stored.map((item) => tryNormalizeItinerary(item)).filter(Boolean) : [];
  });

  useEffect(() => {
    writeJson(STORAGE_KEYS.WIZARD, wizardState);
  }, [wizardState]);

  useEffect(() => {
    writeJson(STORAGE_KEYS.ACTIVE, activeItinerary);
  }, [activeItinerary]);

  useEffect(() => {
    writeJson(STORAGE_KEYS.HISTORY, history);
  }, [history]);

  const saveTrip = useCallback((trip) => {
    const normalized = tryNormalizeItinerary(trip);
    if (!normalized) return;

    setActiveItinerary(normalized);
    setHistory((current) => {
      if (current.some((item) => item.id === normalized.id)) return current;
      return [normalized, ...current].slice(0, 12);
    });
  }, []);

  const loadTrip = useCallback((tripId) => {
    const trip = history.find((item) => item.id === tripId);
    if (trip) {
      setActiveItinerary(trip);
    }
  }, [history]);

  const resetWizard = useCallback(() => setWizardState(defaultWizardState), []);

  const value = useMemo(
    () => ({
      wizardState,
      setWizardState,
      activeItinerary,
      setActiveItinerary,
      history,
      setHistory,
      saveTrip,
      loadTrip,
      resetWizard,
    }),
    [wizardState, activeItinerary, history, saveTrip, loadTrip, resetWizard],
  );

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
}
