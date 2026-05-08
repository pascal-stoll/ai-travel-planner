import { destinationLibrary } from '../utils/constants.js';

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
