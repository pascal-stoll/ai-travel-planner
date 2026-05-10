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
