import { createContext, useContext, useEffect, useMemo, useState } from 'react';

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
  const [wizardState, setWizardState] = useState({
    mood: [],
    duration: '',
    radius: '',
    budget: 'Mid-Range',
    adults: 2,
    children: 0,
    transport: ['Car'],
    location: { label: 'Your location', coords: null },
  });

  const [activeItinerary, setActiveItinerary] = useState(() => readJson(STORAGE_KEYS.ACTIVE, null));
  const [history, setHistory] = useState(() => readJson(STORAGE_KEYS.HISTORY, []));

  useEffect(() => {
    writeJson(STORAGE_KEYS.ACTIVE, activeItinerary);
  }, [activeItinerary]);

  useEffect(() => {
    writeJson(STORAGE_KEYS.HISTORY, history);
  }, [history]);

  const value = useMemo(
    () => ({
      wizardState,
      setWizardState,
      activeItinerary,
      setActiveItinerary,
      history,
      setHistory,
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
