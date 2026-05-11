import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultWizardState } from '../utils/constants.js';
import { tryNormalizeItinerary } from '../features/results/itineraryNormalizer.js';
import {
  clearTripBrief,
  deleteSavedTrip,
  getSavedTrips,
  getStoredActiveItinerary,
  getTripBrief,
  saveGeneratedTrip,
  saveStoredActiveItinerary,
  saveTripBrief,
} from '../services/tripStorage.js';
import { TravelContext } from './travelContext.js';

function hydrateWizardState(brief) {
  if (!brief) return defaultWizardState;

  return {
    ...defaultWizardState,
    mood: Array.isArray(brief.mood) ? brief.mood : defaultWizardState.mood,
    duration: brief.duration || defaultWizardState.duration,
    radius: brief.radius || defaultWizardState.radius,
    location: {
      ...defaultWizardState.location,
      label: brief.cityName || defaultWizardState.location.label,
      coords: null,
    },
  };
}

function getPersistableCityLabel(wizardState) {
  const label = wizardState.location?.label || '';
  return label && label !== defaultWizardState.location.label ? label : '';
}

export function TravelProvider({ children }) {
  const [wizardState, setWizardState] = useState(() => hydrateWizardState(getTripBrief()));
  const [activeItinerary, setActiveItinerary] = useState(() => getStoredActiveItinerary() || null);
  const [history, setHistory] = useState(() => getSavedTrips().map((entry) => entry.itinerary).filter(Boolean));

  useEffect(() => {
    const brief = {
      mood: Array.isArray(wizardState.mood) ? wizardState.mood : [],
      duration: wizardState.duration || '',
      radius: wizardState.radius || '',
      cityName: getPersistableCityLabel(wizardState),
    };

    if (!brief.mood.length && !brief.duration && !brief.radius && !brief.cityName) {
      clearTripBrief();
      return;
    }

    saveTripBrief(brief);
  }, [wizardState.mood, wizardState.duration, wizardState.radius, wizardState.location?.label]);

  useEffect(() => {
    saveStoredActiveItinerary(activeItinerary);
  }, [activeItinerary]);

  const saveTrip = useCallback((trip) => {
    const normalized = tryNormalizeItinerary(trip);
    if (!normalized) return;

    saveGeneratedTrip(normalized);
    setActiveItinerary(normalized);
    setHistory((current) => {
      if (current.some((item) => item.id === normalized.id)) return current;
      return [normalized, ...current].slice(0, 12);
    });
    return normalized;
  }, []);

  const loadTrip = useCallback((tripId) => {
    const trip = history.find((item) => item.id === tripId);
    if (trip) {
      setActiveItinerary(trip);
    }
  }, [history]);

  const removeTrip = useCallback((tripId) => {
    if (!tripId) return false;

    deleteSavedTrip(tripId);
    setHistory((current) => current.filter((item) => item.id !== tripId));
    setActiveItinerary((current) => (current?.id === tripId ? null : current));
    return true;
  }, []);

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
      removeTrip,
      resetWizard,
    }),
    [wizardState, activeItinerary, history, saveTrip, loadTrip, removeTrip, resetWizard],
  );

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
}
