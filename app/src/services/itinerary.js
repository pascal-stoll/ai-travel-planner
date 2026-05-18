import {
  budgetOptions,
  destinationLibrary,
  durationOptions,
  moodOptions,
  radiusOptions,
  transportModes as transportModeOptions,
} from '../utils/constants.js';

function durationToDays(duration) {
  if (duration === 'A few hours') return 1;
  if (duration === '1 Day') return 1;
  if (duration === '2–3 Days') return 3;
  if (duration === '1 Week+') return 6;
  return 1;
}

function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getRandomSubset(list, minCount = 1, maxCount = 1) {
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  const upperBound = Math.max(minCount, Math.min(maxCount, shuffled.length));
  const count = Math.max(minCount, Math.min(upperBound, shuffled.length));
  return shuffled.slice(0, count);
}

function generateStopName(stopIndex) {
  const templates = [
    'Historic centre walk',
    'Local market discovery',
    'Iconic viewpoint',
    'Signature restaurant',
    'Hidden culture stop',
    'Green escape',
  ];
  return templates[stopIndex % templates.length];
}

function generateStopDescription() {
  const phrases = [
    'Experience a locally loved spot with regional specialties.',
    'Take time to absorb the atmosphere and capture photos.',
    'Enjoy a relaxed visit with time to explore side streets.',
    'Dive into the culture with a short guided route.',
  ];
  return getRandomItem(phrases);
}

export function buildPrompt(wizardState) {
  return {
    mood: wizardState.mood,
    duration: wizardState.duration,
    radius: wizardState.radius,
    budget: wizardState.budget,
    transport: wizardState.transport,
    location: wizardState.location.label,
  };
}

export function chooseDestination(wizardState) {
  const matches = destinationLibrary.filter((destination) => wizardState.mood.includes(destination.mood));
  return matches.length ? getRandomItem(matches) : getRandomItem(destinationLibrary);
}

export function buildSurpriseWizardState(baseWizardState = {}) {
  const moods = getRandomSubset(moodOptions.map((option) => option.value), 1, Math.random() > 0.6 ? 2 : 1);
  const duration = getRandomItem(durationOptions).value;
  const radius = getRandomItem(radiusOptions).value;
  const budget = getRandomItem(budgetOptions);
  const transport = getRandomSubset(transportModeOptions, 1, Math.random() > 0.7 ? 2 : 1);
  const cityName = typeof baseWizardState.location?.label === 'string' && baseWizardState.location.label.trim() && baseWizardState.location.label.trim() !== 'Your location'
    ? baseWizardState.location.label.trim()
    : 'Stuttgart';

  return {
    mood: moods,
    duration,
    radius,
    budget,
    adults: Math.max(1, Number.isFinite(Number(baseWizardState.adults)) ? Number(baseWizardState.adults) : 1 + Math.floor(Math.random() * 3)),
    children: Math.max(0, Number.isFinite(Number(baseWizardState.children)) ? Number(baseWizardState.children) : Math.floor(Math.random() * 2)),
    transport,
    location: {
      label: cityName,
      coords: null,
    },
    source: 'surprise-me',
  };
}

export function buildStopRegenerationRequest(itinerary, dayIndex, stopIndex) {
  const day = itinerary?.days?.[dayIndex];
  const stop = day?.stops?.[stopIndex];
  if (!day || !stop) {
    throw new Error('Stop not found.');
  }

  const destinationName = typeof itinerary?.destination === 'string'
    ? itinerary.destination
    : itinerary?.destination?.name || itinerary?.destinationName || 'Your trip';
  const destinationCountry = typeof itinerary?.destination === 'string'
    ? ''
    : itinerary?.destination?.country || '';
  const locationLabel = itinerary?.location?.label || destinationName;
  const locationCoords = Array.isArray(itinerary?.location?.coords)
    ? itinerary.location.coords
    : (Array.isArray(itinerary?.center) ? itinerary.center : null);
  const location = {};

  if (locationLabel) location.label = locationLabel;
  if (locationCoords) location.coords = locationCoords;

  return {
    itineraryId: itinerary?.id || '',
    dayId: day.id,
    stopId: stop.id,
    destination: {
      name: destinationName,
      country: destinationCountry,
      coordinates: Array.isArray(itinerary?.center) ? itinerary.center : undefined,
    },
    dayIndex,
    stopIndex,
    previousStop: stopIndex > 0
      ? {
          name: day.stops[stopIndex - 1].name,
          type: day.stops[stopIndex - 1].category || 'activity',
          category: day.stops[stopIndex - 1].category || 'activity',
          arrivalTime: day.stops[stopIndex - 1].arrivalTime || day.stops[stopIndex - 1].time || '',
          duration: Math.max(0.5, Number(((Number(day.stops[stopIndex - 1].durationMinutes) || 60) / 60).toFixed(1))),
          description: day.stops[stopIndex - 1].description,
        }
      : null,
    nextStop: stopIndex < day.stops.length - 1
      ? {
          name: day.stops[stopIndex + 1].name,
          type: day.stops[stopIndex + 1].category || 'activity',
          category: day.stops[stopIndex + 1].category || 'activity',
          arrivalTime: day.stops[stopIndex + 1].arrivalTime || day.stops[stopIndex + 1].time || '',
          duration: Math.max(0.5, Number(((Number(day.stops[stopIndex + 1].durationMinutes) || 60) / 60).toFixed(1))),
          description: day.stops[stopIndex + 1].description,
        }
      : null,
    existingStops: day.stops.map((item) => ({
      name: item.name,
      type: item.category || 'activity',
      category: item.category || 'activity',
      arrivalTime: item.arrivalTime || item.time || '',
      duration: Math.max(0.5, Number(((Number(item.durationMinutes) || 60) / 60).toFixed(1))),
      description: item.description || 'No description available yet.',
    })),
    preferences: {
      mood: Array.isArray(itinerary?.moodTags) && itinerary.moodTags.length
        ? itinerary.moodTags
        : typeof itinerary?.mood === 'string'
          ? itinerary.mood.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
      duration: itinerary?.duration || '',
      budget: itinerary?.budget || 'Mid-Range',
      transport: Array.isArray(itinerary?.transport) ? itinerary.transport : [itinerary?.transport].filter(Boolean),
      radius: itinerary?.radius || '',
      location: Object.keys(location).length ? location : undefined,
      adults: Number.isFinite(Number(itinerary?.adults)) ? Number(itinerary.adults) : 2,
      children: Number.isFinite(Number(itinerary?.children)) ? Number(itinerary.children) : 0,
      destinationName,
    },
  };
}

export function generateSuggestions(wizardState) {
  const filtered = destinationLibrary.filter((destination) => wizardState.mood.includes(destination.mood));
  const selected = filtered.length ? filtered.slice(0, 3) : destinationLibrary.slice(0, 3);
  return selected.map((destination, index) => ({
    ...destination,
    distance: 150 + index * 70,
    match: destination.mood,
  }));
}

export function buildItinerary(destination, wizardState) {
  const days = durationToDays(wizardState.duration || '1 Day');
  const dayPlans = [];

  for (let day = 1; day <= days; day += 1) {
    const stops = [];
    const stopCount = day === 1 ? 4 : Math.max(3, 5 - day);
    for (let stopIndex = 1; stopIndex <= stopCount; stopIndex += 1) {
      stops.push({
        id: `${day}-${stopIndex}`,
        time: `${9 + stopIndex * 2}:00`,
        name: `${generateStopName(stopIndex)} in ${destination.name}`,
        description: generateStopDescription(),
        duration: `${1 + (stopIndex % 2)}h`,
        transport: wizardState.transport[stopIndex % wizardState.transport.length] || 'Car',
        coords: [
          destination.coords[0] + (stopIndex - 3) * 0.04 + day * 0.01,
          destination.coords[1] + (stopIndex - 2) * 0.05 - day * 0.01,
        ],
      });
    }
    dayPlans.push({ day, title: `Day ${day}`, stops });
  }

  return {
    id: crypto.randomUUID(),
    destination: destination.name,
    subtitle: destination.subtitle,
    mood: wizardState.mood.join(', '),
    duration: wizardState.duration,
    radius: wizardState.radius,
    budget: wizardState.budget,
    transport: wizardState.transport,
    adults: wizardState.adults,
    children: wizardState.children,
    generatedAt: new Date().toISOString(),
    days: dayPlans,
    center: destination.coords,
  };
}

export function regenerateStop(itinerary, dayNumber, stopId) {
  const updated = { ...itinerary };
  updated.days = updated.days.map((day) => {
    if (day.day !== Number(dayNumber)) return day;
    return {
      ...day,
      stops: day.stops.map((stop) => {
        if (stop.id !== stopId) return stop;
        return {
          ...stop,
          description: `Updated suggestion: ${stop.description.split('.')[0]}. Enjoy a refreshed local experience.`,
          time: `${Number(stop.time.split(':')[0]) + 1}:00`,
        };
      }),
    };
  });
  return updated;
}
