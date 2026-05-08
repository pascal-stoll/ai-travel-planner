import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultWizardState } from '../utils/constants.js';

const TravelContext = createContext(null);

const STORAGE_KEYS = {
  ACTIVE: 'travelmind-active',
  HISTORY: 'travelmind-history',
};

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function TravelProvider({ children }) {
  const [wizardState, setWizardState] = useState(defaultWizardState);
  const [activeItinerary, setActiveItinerary] = useState(() => readJson(STORAGE_KEYS.ACTIVE, null));
  const [history, setHistory] = useState(() => readJson(STORAGE_KEYS.HISTORY, []));

  useEffect(() => {
    writeJson(STORAGE_KEYS.ACTIVE, activeItinerary);
  }, [activeItinerary]);

  useEffect(() => {
    writeJson(STORAGE_KEYS.HISTORY, history);
  }, [history]);

  const saveTrip = (trip) => {
    setActiveItinerary(trip);
    setHistory((current) => {
      if (current.some((item) => item.id === trip.id)) return current;
      return [trip, ...current].slice(0, 12);
    });
  };

  const loadTrip = (tripId) => {
    const trip = history.find((item) => item.id === tripId);
    if (trip) {
      setActiveItinerary(trip);
    }
  };

  const resetWizard = () => setWizardState(defaultWizardState);

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
    [wizardState, activeItinerary, history],
  );

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
}

export function useTravel() {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravel must be used within TravelProvider');
  }
  return context;
}
