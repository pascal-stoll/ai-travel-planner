import { getApiBaseUrl } from '../../config/runtime.js';

const API_BASE_URL = getApiBaseUrl();

function buildError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export async function requestGeneratedItinerary(destination, preferences) {
  const response = await fetch(`${API_BASE_URL}/api/generate-itinerary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      destination,
      preferences,
    }),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    throw buildError('The itinerary service returned an unreadable response.', 'INVALID_JSON');
  }

  if (!response.ok || payload?.success === false) {
    throw buildError(
      payload?.message || payload?.error || 'Failed to generate itinerary.',
      payload?.error || payload?.code || `HTTP_${response.status}`,
    );
  }

  return payload;
}
