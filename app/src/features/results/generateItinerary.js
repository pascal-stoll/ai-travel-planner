import { buildItinerary, chooseDestination } from '../../services/itinerary.js';
import { shouldUseMockItineraries } from '../../config/runtime.js';
import { requestGeneratedItinerary } from './itineraryApi.js';
import { normalizeItinerary, parseGeneratedItineraryResponse } from './itineraryNormalizer.js';

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
    radius:
      wizardData.location?.radiusChoice === 'Anywhere'
        ? 'Anywhere'
        : wizardData.location?.customRadiusKm
          ? `${wizardData.location.customRadiusKm} km`
          : wizardData.location?.radiusChoice || '',
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

  return {
    itinerary: parseGeneratedItineraryResponse(response, preferences),
    destination,
    mode: 'api',
  };
}
