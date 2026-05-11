import { buildDestinationImageUrl, getDestinationFallbackImage } from './image.js';

const ALLOWED_CATEGORIES = new Set(['restaurant', 'museum', 'nature', 'landmark', 'activity']);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toFiniteNumber(value) {
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return Number.isFinite(number) ? number : null;
}

function toStringValue(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function toArrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function generateStableId(prefix = 'item') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeCategory(category) {
  const lower = toStringValue(category, 'activity').toLowerCase();
  return ALLOWED_CATEGORIES.has(lower) ? lower : 'activity';
}

function formatDurationLabel(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return 'Duration flexible';
  if (minutes < 60) return `${Math.round(minutes)} min`;

  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  if (!remaining) return `${hours} h`;
  if (hours === 0) return `${remaining} min`;

  return `${hours} h ${remaining} min`;
}

function formatArrivalTime(value) {
  const text = toStringValue(value);
  if (!text) return 'Flexible';
  const match = text.match(/^([0-1]\d|2[0-3]):([0-5]\d)$/);
  return match ? `${match[1]}:${match[2]}` : 'Flexible';
}

function parseCoordinates(value) {
  if (!Array.isArray(value) || value.length < 2) return null;

  const lat = toFiniteNumber(value[0]);
  const lng = toFiniteNumber(value[1]);
  if (lat === null || lng === null) return null;

  return [lat, lng];
}

function parseDurationMinutes(value) {
  const numeric = toFiniteNumber(value);
  if (numeric !== null) return numeric;

  if (typeof value !== 'string') return null;
  const text = value.trim().toLowerCase();
  const hourMinuteMatch = text.match(/^(\d+(?:\.\d+)?)\s*h(?:\s*(\d+)\s*min)?$/);
  if (hourMinuteMatch) {
    const hours = Number(hourMinuteMatch[1]);
    const minutes = hourMinuteMatch[2] ? Number(hourMinuteMatch[2]) : 0;
    return Math.round(hours * 60 + minutes);
  }

  const minuteMatch = text.match(/^(\d+)\s*min$/);
  if (minuteMatch) return Number(minuteMatch[1]);

  return null;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function getTravelNote(currentCoords, nextCoords) {
  if (!currentCoords || !nextCoords) return 'Short transfer to the next stop.';

  const [lat1, lng1] = currentCoords;
  const [lat2, lng2] = nextCoords;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const distanceKm = 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  if (!Number.isFinite(distanceKm) || distanceKm < 0.4) {
    return 'About a 5-minute walk to the next stop.';
  }
  if (distanceKm < 2) {
    return 'Roughly a 10-minute walk to the next stop.';
  }
  if (distanceKm < 8) {
    return 'Expect around 15 minutes by taxi or transit to the next stop.';
  }
  return 'Allow about 25 minutes for the transfer to the next stop.';
}

function normalizeSegment(rawSegment, dayIndex, segmentIndex, stops = []) {
  const fromStopId = toStringValue(rawSegment?.fromStopId, stops[segmentIndex]?.id || '');
  const toStopId = toStringValue(rawSegment?.toStopId, stops[segmentIndex + 1]?.id || '');
  const note = toStringValue(rawSegment?.note, getTravelNote(stops[segmentIndex]?.coordinates, stops[segmentIndex + 1]?.coordinates));
  const mode = toStringValue(rawSegment?.mode, 'drive');
  const durationMinutes = parseDurationMinutes(rawSegment?.durationMinutes) ?? 10;

  return {
    id: toStringValue(rawSegment?.id, `day-${dayIndex + 1}-segment-${segmentIndex + 1}`),
    fromStopId,
    toStopId,
    durationMinutes: Number.isFinite(durationMinutes) ? durationMinutes : 10,
    note,
    mode,
  };
}

function normalizeDestination(rawDestination, preferences = {}) {
  if (typeof rawDestination === 'string') {
    return {
      name: rawDestination.trim() || 'Your destination',
      country: '',
      moodTag: Array.isArray(preferences.mood) && preferences.mood.length ? preferences.mood[0] : '',
      imageUrl: buildDestinationImageUrl(rawDestination.trim(), ''),
    };
  }

  if (!isPlainObject(rawDestination)) {
    const fallbackName = toStringValue(preferences.destinationName, 'Your destination');
    return {
      name: fallbackName,
      country: '',
      moodTag: Array.isArray(preferences.mood) && preferences.mood.length ? preferences.mood[0] : '',
      imageUrl: buildDestinationImageUrl(fallbackName, ''),
    };
  }

  const name = toStringValue(rawDestination.name, toStringValue(preferences.destinationName, 'Your destination'));
  const country = toStringValue(rawDestination.country, '');
  const moodTag = toStringValue(rawDestination.moodTag, Array.isArray(preferences.mood) && preferences.mood.length ? preferences.mood[0] : '');

  return {
    name,
    country,
    moodTag,
    imageUrl: toStringValue(rawDestination.imageUrl, buildDestinationImageUrl(name, country)) || getDestinationFallbackImage(),
  };
}

function normalizeStop(rawStop, dayIndex, stopIndex, destinationName, preferences = {}) {
  const coords = parseCoordinates(rawStop?.coordinates || rawStop?.coords);
  const durationMinutes = parseDurationMinutes(rawStop?.durationMinutes) ?? parseDurationMinutes(rawStop?.duration) ?? 60;
  const arrivalTime = formatArrivalTime(rawStop?.arrivalTime || rawStop?.time);
  const name = toStringValue(rawStop?.name, `${destinationName} stop ${stopIndex + 1}`);
  const description = toStringValue(rawStop?.description, 'No description available yet.');

  return {
    id: toStringValue(rawStop?.id, `day-${dayIndex + 1}-stop-${stopIndex + 1}`),
    name,
    category: normalizeCategory(rawStop?.category),
    arrivalTime,
    durationMinutes: Number.isFinite(durationMinutes) ? durationMinutes : 60,
    durationLabel: formatDurationLabel(Number.isFinite(durationMinutes) ? durationMinutes : 60),
    description,
    coordinates: coords,
    travelToNext: null,
    transport: toStringValue(rawStop?.transport, Array.isArray(preferences.transport) && preferences.transport.length ? preferences.transport[0] : 'Car'),
  };
}

function normalizeDay(rawDay, dayIndex, destinationName, preferences = {}) {
  const stops = toArrayValue(rawDay?.stops).map((stop, stopIndex) => normalizeStop(stop, dayIndex, stopIndex, destinationName, preferences));

  for (let index = 0; index < stops.length - 1; index += 1) {
    stops[index] = {
      ...stops[index],
      travelToNext: getTravelNote(stops[index].coordinates, stops[index + 1].coordinates),
    };
  }

  const segmentsSource = toArrayValue(rawDay?.segments);
  const segments = segmentsSource.length
    ? segmentsSource.map((segment, segmentIndex) => normalizeSegment(segment, dayIndex, segmentIndex, stops))
    : stops
        .slice(0, Math.max(stops.length - 1, 0))
        .map((stop, segmentIndex) => normalizeSegment(null, dayIndex, segmentIndex, stops));

  return {
    id: toStringValue(rawDay?.id, `day-${dayIndex + 1}`),
    day: Number.isFinite(toFiniteNumber(rawDay?.day)) ? toFiniteNumber(rawDay?.day) : dayIndex + 1,
    title: toStringValue(rawDay?.title, `Day ${dayIndex + 1}`),
    stops,
    segments,
  };
}

function normalizePreferences(preferences = {}) {
  const mood = toArrayValue(preferences.mood).filter(Boolean);
  const transport = toArrayValue(preferences.transport).filter(Boolean);
  const locationLabel = toStringValue(preferences.location?.label, '');

  return {
    mood,
    moodLabel: mood.join(', '),
    duration: toStringValue(preferences.duration, ''),
    radius: toStringValue(preferences.radius, ''),
    budget: toStringValue(preferences.budget, 'Mid-Range'),
    transport: transport.length ? transport : ['Car'],
    adults: Number.isFinite(toFiniteNumber(preferences.adults)) ? toFiniteNumber(preferences.adults) : 2,
    children: Number.isFinite(toFiniteNumber(preferences.children)) ? toFiniteNumber(preferences.children) : 0,
    location: {
      label: locationLabel || 'Your location',
      coords: parseCoordinates(preferences.location?.coords),
    },
  };
}

function finalizeItinerary(payload, preferences = {}) {
  if (!isPlainObject(payload)) {
    throw new Error('Invalid itinerary payload.');
  }

  const daysSource = toArrayValue(payload.days);
  if (!daysSource.length) {
    throw new Error('Itinerary is missing day data.');
  }

  const normalizedPreferences = normalizePreferences(preferences);
  const destination = normalizeDestination(payload.destination, preferences);
  const days = daysSource.map((day, dayIndex) => normalizeDay(day, dayIndex, destination.name, normalizedPreferences));
  const destinationCoords = parseCoordinates(payload.destination?.coordinates || payload.destination?.coords || payload.center) ||
    parseCoordinates(preferences.location?.coords) ||
    days.flatMap((day) => day.stops.map((stop) => stop.coordinates)).find(Boolean) ||
    null;

  const subtitle =
    toStringValue(payload.subtitle, '') ||
    toStringValue(payload.summary, '') ||
    (normalizedPreferences.duration
      ? `A ${normalizedPreferences.duration.toLowerCase()} escape shaped around ${destination.name}.`
      : `A tailored travel plan for ${destination.name}.`);

  return {
    id: toStringValue(payload.id, generateStableId('itinerary')),
    destination,
    destinationName: destination.name,
    subtitle,
    mood: normalizedPreferences.moodLabel || toStringValue(payload.mood, ''),
    moodTags: normalizedPreferences.mood.length
      ? normalizedPreferences.mood
      : (typeof payload.mood === 'string'
        ? payload.mood.split(',').map((item) => item.trim()).filter(Boolean)
        : toArrayValue(payload.mood).filter(Boolean)),
    duration: normalizedPreferences.duration || toStringValue(payload.duration, ''),
    radius: normalizedPreferences.radius || toStringValue(payload.radius, ''),
    budget: normalizedPreferences.budget || toStringValue(payload.budget, 'Mid-Range'),
    transport: normalizedPreferences.transport.length
      ? normalizedPreferences.transport
      : (typeof payload.transport === 'string'
        ? payload.transport.split(',').map((item) => item.trim()).filter(Boolean)
        : toArrayValue(payload.transport).filter(Boolean)),
    adults: Number.isFinite(toFiniteNumber(payload.adults)) ? toFiniteNumber(payload.adults) : normalizedPreferences.adults,
    children: Number.isFinite(toFiniteNumber(payload.children)) ? toFiniteNumber(payload.children) : normalizedPreferences.children,
    generatedAt: toStringValue(payload.generatedAt, new Date().toISOString()),
    days,
    center: destinationCoords,
    location: normalizedPreferences.location?.label !== 'Your location' || normalizedPreferences.location?.coords
      ? normalizedPreferences.location
      : {
          label: toStringValue(payload.location?.label, toStringValue(payload.location, 'Your location')),
          coords: parseCoordinates(payload.location?.coords),
        },
  };
}

export function normalizeItinerary(value, preferences = {}) {
  if (!value) return null;

  const payload = value.success === true && isPlainObject(value.data) ? value.data : value;
  if (value.success === false) {
    throw new Error(value.message || value.error || 'Failed to generate itinerary.');
  }

  return finalizeItinerary(payload, preferences);
}

export function tryNormalizeItinerary(value, preferences = {}) {
  try {
    return normalizeItinerary(value, preferences);
  } catch {
    return null;
  }
}

export function parseGeneratedItineraryResponse(responseJson, preferences = {}) {
  if (!isPlainObject(responseJson)) {
    throw new Error('Unexpected itinerary response.');
  }

  if (responseJson.success === false) {
    throw new Error(responseJson.message || responseJson.error || 'Failed to generate itinerary.');
  }

  const payload = responseJson.data ?? responseJson;
  return finalizeItinerary(payload, preferences);
}

export function getItineraryDestinationName(itinerary) {
  if (!itinerary) return 'Your trip';
  if (typeof itinerary.destination === 'string') return itinerary.destination;
  return itinerary.destination?.name || itinerary.destinationName || 'Your trip';
}

export function getItineraryDestinationCountry(itinerary) {
  if (!itinerary || typeof itinerary.destination === 'string') return '';
  return itinerary.destination?.country || '';
}

export function getItineraryMoodLabel(itinerary) {
  if (!itinerary) return '';
  if (Array.isArray(itinerary.moodTags) && itinerary.moodTags.length) return itinerary.moodTags.join(', ');
  return itinerary.mood || '';
}

export function getItineraryDestinationImage(itinerary) {
  if (!itinerary) return getDestinationFallbackImage();
  if (typeof itinerary.destination === 'string') return buildDestinationImageUrl(itinerary.destination);
  return itinerary.destination?.imageUrl || buildDestinationImageUrl(itinerary.destination?.name, itinerary.destination?.country);
}

export function formatArrivalLabel(arrivalTime) {
  return formatArrivalTime(arrivalTime);
}

export function formatDurationLabelFromMinutes(minutes) {
  return formatDurationLabel(minutes);
}
