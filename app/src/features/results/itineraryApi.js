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

export async function requestStopRegeneration(payload) {
  const response = await fetch(`${API_BASE_URL}/api/regen`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let responseJson = null;
  try {
    responseJson = await response.json();
  } catch {
    throw buildError('The stop service returned an unreadable response.', 'INVALID_JSON');
  }

  if (!response.ok || responseJson?.success === false) {
    throw buildError(
      responseJson?.message || responseJson?.error || 'Failed to regenerate stop.',
      responseJson?.error || responseJson?.code || `HTTP_${response.status}`,
    );
  }

  const stop = responseJson?.data?.stop || responseJson?.data || responseJson;
  if (!stop || typeof stop !== 'object') {
    throw buildError('The stop service returned an invalid response.', 'INVALID_RESPONSE');
  }

  return stop;
}
