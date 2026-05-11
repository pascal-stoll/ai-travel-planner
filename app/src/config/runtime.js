export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  return import.meta.env.MODE === 'development' ? '' : 'http://localhost:3001';
}

export function getItineraryMode() {
  const configuredMode = String(import.meta.env.VITE_ITINERARY_MODE || '').trim().toLowerCase();
  if (configuredMode === 'mock' || configuredMode === 'api') {
    return configuredMode;
  }

  return 'api';
}

export function shouldUseMockItineraries() {
  return getItineraryMode() === 'mock';
}
