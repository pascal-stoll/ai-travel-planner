import {
  getItineraryDestinationCountry,
  getItineraryDestinationImage,
  getItineraryDestinationName,
  getItineraryMoodLabel,
  tryNormalizeItinerary,
} from '../features/results/itineraryNormalizer.js';

export const TRIP_HISTORY_KEY = 'travelmind.tripHistory';
export const TRIP_BRIEF_KEY = 'travelmind.tripBrief';
export const ACTIVE_ITINERARY_KEY = 'travelmind.activeItinerary';

const LEGACY_TRIP_HISTORY_KEY = 'travelmind-history';
const LEGACY_TRIP_BRIEF_KEY = 'travelmind-wizard';
const LEGACY_ACTIVE_ITINERARY_KEY = 'travelmind-active';
export const TRIP_BRIEF_TTL_MS = 24 * 60 * 60 * 1000;

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toStringValue(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => toStringValue(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toFiniteNumber(value) {
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return Number.isFinite(number) ? number : null;
}

function getStorage() {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readRawStorage(key) {
  const storage = getStorage();
  if (!storage) return null;

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeRawStorage(key, value) {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeRawStorage(key) {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function readStorageJson(key, fallback = null) {
  const raw = readRawStorage(key);
  if (raw === null) return fallback;

  try {
    return JSON.parse(raw);
  } catch {
    removeRawStorage(key);
    return fallback;
  }
}

export function writeStorageJson(key, value) {
  return writeRawStorage(key, JSON.stringify(value));
}

export function removeStorageItem(key) {
  return removeRawStorage(key);
}

function normalizeTripHistoryPayload(rawValue) {
  if (!Array.isArray(rawValue)) return null;

  const normalized = rawValue
    .map((entry) => normalizeSavedTripEntry(entry))
    .filter(Boolean)
    .sort((left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime());

  return normalized;
}

function readTripHistoryFromKey(key) {
  const raw = readRawStorage(key);
  if (raw === null) return null;

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeTripHistoryPayload(parsed);
    if (!normalized) {
      removeRawStorage(key);
      return null;
    }
    return normalized;
  } catch {
    removeRawStorage(key);
    return null;
  }
}

function parseTripHistory() {
  return (
    readTripHistoryFromKey(TRIP_HISTORY_KEY) ||
    readTripHistoryFromKey(LEGACY_TRIP_HISTORY_KEY) ||
    []
  );
}

function getStopCount(itinerary) {
  return Array.isArray(itinerary?.days)
    ? itinerary.days.reduce((total, day) => total + (Array.isArray(day?.stops) ? day.stops.length : 0), 0)
    : 0;
}

function generateEntryId(itinerary) {
  const base = toStringValue(itinerary?.id, '');
  if (base) return base;

  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `trip-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeSavedTripEntry(rawValue) {
  if (!rawValue) return null;

  const source = isPlainObject(rawValue?.itinerary) ? rawValue.itinerary : rawValue;
  const itinerary = tryNormalizeItinerary(source);
  if (!itinerary) return null;

  const generatedAt = toStringValue(rawValue?.generatedAt, itinerary.generatedAt || new Date().toISOString());
  const destinationName = toStringValue(rawValue?.destinationName, getItineraryDestinationName(itinerary));
  const destinationCountry = toStringValue(rawValue?.destinationCountry, getItineraryDestinationCountry(itinerary));
  const thumbnailUrl = toStringValue(rawValue?.thumbnailUrl, getItineraryDestinationImage(itinerary));
  const travelStyle = toStringArray(rawValue?.travelStyle).length
    ? toStringArray(rawValue.travelStyle)
    : toStringArray(itinerary.moodTags).length
      ? toStringArray(itinerary.moodTags)
      : toStringArray(getItineraryMoodLabel(itinerary));
  const durationLabel = toStringValue(rawValue?.durationLabel, itinerary.duration || '');
  const radiusLabel = toStringValue(rawValue?.radiusLabel, itinerary.radius || '');
  const stopCount = Number.isFinite(toFiniteNumber(rawValue?.stopCount)) ? toFiniteNumber(rawValue.stopCount) : getStopCount(itinerary);

  return {
    id: toStringValue(rawValue?.id, itinerary.id || generateEntryId(itinerary)),
    destinationName,
    destinationCountry,
    thumbnailUrl,
    travelStyle,
    durationLabel,
    radiusLabel,
    generatedAt,
    stopCount,
    itinerary,
  };
}

export function saveGeneratedTrip(itinerary) {
  const normalized = tryNormalizeItinerary(itinerary);
  if (!normalized) return null;

  const entry = normalizeSavedTripEntry({
    id: normalized.id,
    destinationName: getItineraryDestinationName(normalized),
    destinationCountry: getItineraryDestinationCountry(normalized),
    thumbnailUrl: getItineraryDestinationImage(normalized),
    travelStyle: Array.isArray(normalized.moodTags) ? normalized.moodTags : toStringArray(normalized.mood),
    durationLabel: normalized.duration || '',
    radiusLabel: normalized.radius || '',
    generatedAt: normalized.generatedAt || new Date().toISOString(),
    stopCount: getStopCount(normalized),
    itinerary: normalized,
  });

  if (!entry) return null;

  const nextHistory = [entry, ...parseTripHistory().filter((item) => item.id !== entry.id)];
  if (!writeStorageJson(TRIP_HISTORY_KEY, nextHistory)) {
    return null;
  }

  return entry;
}

export function getSavedTrips() {
  return parseTripHistory();
}

export function deleteSavedTrip(tripId) {
  const id = toStringValue(tripId);
  if (!id) return false;

  const current = parseTripHistory();
  const nextHistory = current.filter((item) => item.id !== id);
  if (nextHistory.length === current.length) return false;

  return writeStorageJson(TRIP_HISTORY_KEY, nextHistory);
}

function normalizeTripBrief(rawValue) {
  if (!isPlainObject(rawValue)) return null;

  const savedAt = toStringValue(rawValue.savedAt || rawValue.timestamp, new Date().toISOString());
  const moment = Date.parse(savedAt);
  if (!Number.isFinite(moment)) return null;

  const age = Date.now() - moment;
  if (age > TRIP_BRIEF_TTL_MS) return null;

  const mood = toStringArray(rawValue.mood);
  const duration = toStringValue(rawValue.duration, '');
  const radius = toStringValue(rawValue.radius, '');
  const cityName = toStringValue(rawValue.cityName || rawValue.location?.label, '');

  return {
    mood,
    duration,
    radius,
    cityName: cityName === 'Your location' ? '' : cityName,
    savedAt,
  };
}

function readTripBriefFromKey(key) {
  const raw = readRawStorage(key);
  if (raw === null) return null;

  try {
    const parsed = JSON.parse(raw);
    const payload = parsed && isPlainObject(parsed.data) && parsed.timestamp ? { ...parsed.data, savedAt: parsed.timestamp } : parsed;
    const normalized = normalizeTripBrief(payload);
    if (!normalized) {
      removeRawStorage(key);
      return null;
    }
    return normalized;
  } catch {
    removeRawStorage(key);
    return null;
  }
}

export function saveTripBrief(brief) {
  const mood = toStringArray(brief?.mood);
  const duration = toStringValue(brief?.duration, '');
  const radius = toStringValue(brief?.radius, '');
  const cityName = toStringValue(brief?.cityName || brief?.location?.label, '');

  const payload = {
    mood,
    duration,
    radius,
    cityName: cityName === 'Your location' ? '' : cityName,
    savedAt: new Date().toISOString(),
  };

  return writeStorageJson(TRIP_BRIEF_KEY, payload) ? payload : null;
}

export function getTripBrief() {
  const current = readTripBriefFromKey(TRIP_BRIEF_KEY);
  if (current) return current;

  const legacy = readTripBriefFromKey(LEGACY_TRIP_BRIEF_KEY);
  return legacy || null;
}

export function clearTripBrief() {
  removeRawStorage(TRIP_BRIEF_KEY);
  removeRawStorage(LEGACY_TRIP_BRIEF_KEY);
}

export function getStoredActiveItinerary() {
  const current = readStorageJson(ACTIVE_ITINERARY_KEY, null);
  const normalized = tryNormalizeItinerary(current);
  if (normalized) return normalized;

  const legacy = readStorageJson(LEGACY_ACTIVE_ITINERARY_KEY, null);
  return tryNormalizeItinerary(legacy) || null;
}

export function saveStoredActiveItinerary(itinerary) {
  const normalized = tryNormalizeItinerary(itinerary);
  if (!normalized) {
    removeStorageItem(ACTIVE_ITINERARY_KEY);
    return false;
  }

  return writeStorageJson(ACTIVE_ITINERARY_KEY, normalized);
}
