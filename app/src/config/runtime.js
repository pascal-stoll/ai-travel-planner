export function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
}

export function getItineraryMode() {
  const configuredMode = String(import.meta.env.VITE_ITINERARY_MODE || '').trim().toLowerCase();
  if (configuredMode === 'mock' || configuredMode === 'api') {
    return configuredMode;
  }

  return import.meta.env.MODE === 'production' ? 'api' : 'mock';
}

export function shouldUseMockItineraries() {
  return getItineraryMode() === 'mock';
}
