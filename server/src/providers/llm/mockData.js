const MOCK_ITINERARY = {
  destination: {
    name: 'Lake Como',
    country: 'Italy',
    coordinates: [45.9979, 9.2572],
  },
  travelStyle: 'Relax + Food',
  duration: '2–3 Days',
  radius: '50–150 km',
  bestTimeToVisit: 'Apr–Oct',
  transport: ['drive', 'public transport'],
  subtitle: 'A slow lakeside itinerary shaped around cafés, promenades, and scenic villas.',
  days: [
    {
      day: 1,
      title: 'Arrival & Lakeside Leisure',
      stops: [
        {
          id: 'lake-como-day-1-stop-1',
          name: 'Caffè Sociale Breakfast',
          category: 'restaurant',
          arrivalTime: '08:30',
          durationMinutes: 60,
          description: 'Start your day with espresso and pastries in a charming lakeside café in Como old town.',
          coordinates: [45.812, 9.085],
        },
        {
          id: 'lake-como-day-1-stop-2',
          name: 'Como Waterfront Promenade',
          category: 'landmark',
          arrivalTime: '10:00',
          durationMinutes: 75,
          description: 'Stroll the lakefront and settle into the polished, unhurried rhythm of the shoreline.',
          coordinates: [45.8142, 9.0833],
        },
        {
          id: 'lake-como-day-1-stop-3',
          name: 'Mercato di Como',
          category: 'activity',
          arrivalTime: '12:00',
          durationMinutes: 90,
          description: 'Browse local produce, cheeses, and artisan treats for a food-focused midday stop.',
          coordinates: [45.8089, 9.0817],
        },
        {
          id: 'lake-como-day-1-stop-4',
          name: 'Dinner with a View',
          category: 'restaurant',
          arrivalTime: '19:00',
          durationMinutes: 120,
          description: 'End the day with lake fish, regional pasta, and a golden-hour terrace over the water.',
          coordinates: [45.8074, 9.0765],
        },
      ],
      segments: [
        {
          id: 'lake-como-day-1-segment-1',
          fromStopId: 'lake-como-day-1-stop-1',
          toStopId: 'lake-como-day-1-stop-2',
          durationMinutes: 8,
          note: '8 min walk',
          mode: 'walking',
        },
        {
          id: 'lake-como-day-1-segment-2',
          fromStopId: 'lake-como-day-1-stop-2',
          toStopId: 'lake-como-day-1-stop-3',
          durationMinutes: 12,
          note: '12 min drive',
          mode: 'drive',
        },
        {
          id: 'lake-como-day-1-segment-3',
          fromStopId: 'lake-como-day-1-stop-3',
          toStopId: 'lake-como-day-1-stop-4',
          durationMinutes: 15,
          note: '15 min public transport',
          mode: 'public_transport',
        },
      ],
    },
    {
      day: 2,
      title: 'Views, Villas & Long Lunches',
      stops: [
        {
          id: 'lake-como-day-2-stop-1',
          name: 'Villa Olmo Gardens',
          category: 'landmark',
          arrivalTime: '09:30',
          durationMinutes: 90,
          description: 'Ease into the day with historic architecture, formal gardens, and lake breezes.',
          coordinates: [45.8154, 9.0632],
        },
        {
          id: 'lake-como-day-2-stop-2',
          name: 'Lakeside Lunch in Cernobbio',
          category: 'restaurant',
          arrivalTime: '12:00',
          durationMinutes: 75,
          description: 'Take a slow lunch with classic northern Italian dishes and postcard-worthy views.',
          coordinates: [45.8414, 9.0768],
        },
        {
          id: 'lake-como-day-2-stop-3',
          name: 'Brunate Viewpoint',
          category: 'nature',
          arrivalTime: '15:00',
          durationMinutes: 120,
          description: 'Finish above the lake with panoramic views and an easy scenic finale.',
          coordinates: [45.8331, 9.1002],
        },
      ],
      segments: [
        {
          id: 'lake-como-day-2-segment-1',
          fromStopId: 'lake-como-day-2-stop-1',
          toStopId: 'lake-como-day-2-stop-2',
          durationMinutes: 10,
          note: '10 min drive',
          mode: 'drive',
        },
        {
          id: 'lake-como-day-2-segment-2',
          fromStopId: 'lake-como-day-2-stop-2',
          toStopId: 'lake-como-day-2-stop-3',
          durationMinutes: 18,
          note: '18 min public transport',
          mode: 'public_transport',
        },
      ],
    },
  ],
};

const MOCK_DESTINATIONS = {
  destinations: [
    {
      name: 'Lake Como',
      country: 'Italy',
      rationale: 'A polished lakeside escape with relaxed pacing, scenic views, and strong food stops.',
      distance: '120 km',
    },
    {
      name: 'Lisbon',
      country: 'Portugal',
      rationale: 'A mellow city break with viewpoints, café culture, and plenty of easy food-led exploration.',
      distance: '420 km',
    },
    {
      name: 'Kyoto',
      country: 'Japan',
      rationale: 'A strong cultural option with heritage sites, calm neighborhoods, and memorable day structure.',
      distance: '760 km',
    },
  ],
};

const MOCK_REGEN_STOP = {
  stop: {
    id: 'regen-stop-1',
    name: 'Villa Olmo Gardens',
    category: 'landmark',
    arrivalTime: '11:00',
    durationMinutes: 90,
    description: 'A relaxed lakeside stop with historic architecture and garden views.',
    coordinates: [45.8154, 9.0632],
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getMockResponseType(prompt = '') {
  const text = String(prompt).toLowerCase();
  if (text.includes('regenerate a single stop') || text.includes('replacement stop')) return 'regen';
  if (text.includes('suggest 2-3 destination') || text.includes('destination recommendations')) return 'destinations';
  return 'itinerary';
}

function buildMockResponse(prompt = '') {
  const type = getMockResponseType(prompt);
  if (type === 'regen') return clone(MOCK_REGEN_STOP);
  if (type === 'destinations') return clone(MOCK_DESTINATIONS);
  return clone(MOCK_ITINERARY);
}

module.exports = {
  buildMockResponse,
  MOCK_ITINERARY,
  MOCK_DESTINATIONS,
  MOCK_REGEN_STOP,
};
