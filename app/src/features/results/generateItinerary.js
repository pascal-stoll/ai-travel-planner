import { buildItinerary, chooseDestination } from '../../services/itinerary.js';
import { shouldUseMockItineraries } from '../../config/runtime.js';
import { requestGeneratedItinerary } from './itineraryApi.js';
import { normalizeItinerary, parseGeneratedItineraryResponse } from './itineraryNormalizer.js';

function toLabel(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function mergeExtendedWizardSelection(itinerary, wizardData) {
  const destinationName = toLabel(wizardData.location?.cityName, 'Your destination');
  const tripTypes = Array.isArray(wizardData.tripType) ? wizardData.tripType.filter(Boolean) : [];
  const transportModes = Array.isArray(wizardData.transportModes) ? wizardData.transportModes.filter(Boolean) : [];
  const mergedDestination = {
    ...(itinerary.destination && typeof itinerary.destination === 'object' ? itinerary.destination : {}),
    name: destinationName,
    country: toLabel(wizardData.location?.country, itinerary.destination?.country || ''),
    moodTag: tripTypes[0] || itinerary.destination?.moodTag || '',
  };

  return {
    ...itinerary,
    destination: mergedDestination,
    destinationName,
    mood: tripTypes.length ? tripTypes.join(', ') : itinerary.mood,
    moodTags: tripTypes.length ? tripTypes : itinerary.moodTags,
    duration: toLabel(wizardData.duration, itinerary.duration),
    radius: toLabel(wizardData.location?.radiusChoice, itinerary.radius),
    budget: toLabel(wizardData.budget, itinerary.budget),
    transport: transportModes.length ? transportModes : itinerary.transport,
    adults: Number.isFinite(Number(wizardData.travellerGroup?.adults))
      ? Number(wizardData.travellerGroup.adults)
      : itinerary.adults,
    children: Number.isFinite(Number(wizardData.travellerGroup?.children))
      ? Number(wizardData.travellerGroup.children)
      : itinerary.children,
    location: {
      ...(itinerary.location && typeof itinerary.location === 'object' ? itinerary.location : {}),
      label: destinationName,
    },
    subtitle: tripTypes.length
      ? `${tripTypes.join(' + ')} escape in ${destinationName}.`
      : itinerary.subtitle,
  };
}

export async function generateItineraryForWizard(wizardState) {
  const destination = chooseDestination(wizardState);
  const preferences = {
    ...wizardState,
    destinationName: destination.name,
  };

  if (shouldUseMockItineraries()) {
    const itinerary = normalizeItinerary(buildItinerary(destination, wizardState), preferences);
    if (!itinerary) {
      throw new Error('Failed to create a mock itinerary.');
    }
    return {
      itinerary,
      destination,
      mode: 'mock',
    };
  }

  const response = await requestGeneratedItinerary(
    { name: destination.name, country: destination.country || '' },
    wizardState,
  );

  return {
    itinerary: parseGeneratedItineraryResponse(response, preferences),
    destination,
    mode: 'api',
  };
}

export async function generateItineraryForExtendedWizard(wizardData) {
  const destination = {
    name: wizardData.location?.cityName || 'Your destination',
    country: wizardData.location?.country || '',
  };

  const preferences = {
    mood: wizardData.tripType || [],
    duration: wizardData.duration || '',
    budget: wizardData.budget || 'Mid-Range',
    transport: wizardData.transportModes || [],
    radius: wizardData.location?.radiusChoice || '',
    location: {
      label: wizardData.location?.cityName || '',
      coords: null,
    },
    adults: wizardData.travellerGroup?.adults ?? 1,
    children: wizardData.travellerGroup?.children ?? 0,
    destinationName: wizardData.location?.cityName || 'Your destination',
    source: wizardData.source || 'extended-wizard',
  };

  const response = await requestGeneratedItinerary(destination, preferences);
  const parsedItinerary = parseGeneratedItineraryResponse(response, preferences);

  return {
    itinerary: mergeExtendedWizardSelection(parsedItinerary, wizardData),
    destination,
    mode: 'api',
  };
}
