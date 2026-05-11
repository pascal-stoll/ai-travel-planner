const COMO_DESTINATION = {
  name: 'Como',
  country: 'Italy',
  coordinates: [45.812, 9.085],
};

const MOCK_ITINERARY = {
  destination: COMO_DESTINATION,
  travelStyle: 'Relax + Food',
  duration: '2–3 Days',
  radius: '50–150 km',
  bestTimeToVisit: 'Apr–Oct',
  transport: ['drive', 'public transport'],
  subtitle: 'A slow lakeside itinerary shaped around cafés, promenades, and scenic villas.',
  days: [
    {
      day: 1,
      title: 'Day 1',
      stops: [
        {
          id: 'stop-1',
          name: 'Caffè Sociale Breakfast',
          category: 'restaurant',
          arrivalTime: '08:30',
          durationMinutes: 60,
          description: 'Start your day with espresso and pastries in a charming lakeside café.',
          coordinates: [45.812, 9.085],
        },
        {
          id: 'stop-2',
          name: 'Como Waterfront Promenade',
          category: 'landmark',
          arrivalTime: '10:00',
          durationMinutes: 75,
          description: 'Stroll the lakefront and watch ferries move across the water.',
          coordinates: [45.8142, 9.0833],
        },
        {
          id: 'stop-3',
          name: 'Mercato di Como',
          category: 'activity',
          arrivalTime: '12:00',
          durationMinutes: 90,
          description: 'Explore local produce, cheeses, and small artisan stalls in the market.',
          coordinates: [45.8089, 9.0817],
        },
        {
          id: 'stop-4',
          name: 'Dinner with a View',
          category: 'restaurant',
          arrivalTime: '19:00',
          durationMinutes: 120,
          description: 'Enjoy fresh lake fish and relaxed dining as the sun drops behind the hills.',
          coordinates: [45.8074, 9.0765],
        },
      ],
      segments: [
        {
          id: 'segment-1',
          fromStopId: 'stop-1',
          toStopId: 'stop-2',
          durationMinutes: 8,
          note: '8 min walk',
          mode: 'walking',
        },
        {
          id: 'segment-2',
          fromStopId: 'stop-2',
          toStopId: 'stop-3',
          durationMinutes: 12,
          note: '12 min drive',
          mode: 'drive',
        },
        {
          id: 'segment-3',
          fromStopId: 'stop-3',
          toStopId: 'stop-4',
          durationMinutes: 15,
          note: '15 min public transport',
          mode: 'public_transport',
        },
      ],
    },
    {
      day: 2,
      title: 'Day 2',
      stops: [
        {
          id: 'stop-5',
          name: 'Villa Olmo Gardens',
          category: 'landmark',
          arrivalTime: '09:30',
          durationMinutes: 90,
          description: 'A relaxed lakeside stop with historic architecture and garden views.',
          coordinates: [45.8154, 9.0632],
        },
        {
          id: 'stop-6',
          name: 'Lakeside Lunch',
          category: 'restaurant',
          arrivalTime: '12:00',
          durationMinutes: 75,
          description: 'Have a long lunch with regional pasta, polenta, and a view over the lake.',
          coordinates: [45.8178, 9.0692],
        },
        {
          id: 'stop-7',
          name: 'Brunate Hill Viewpoint',
          category: 'nature',
          arrivalTime: '15:00',
          durationMinutes: 120,
          description: 'Finish with a scenic hilltop stop for panoramic views over Como and the water.',
          coordinates: [45.8331, 9.1002],
        },
      ],
      segments: [
        {
          id: 'segment-4',
          fromStopId: 'stop-5',
          toStopId: 'stop-6',
          durationMinutes: 10,
          note: '10 min drive',
          mode: 'drive',
        },
        {
          id: 'segment-5',
          fromStopId: 'stop-6',
          toStopId: 'stop-7',
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
      name: 'Como',
      country: 'Italy',
      rationale: 'Elegant lake views, calm promenades, and easy food-focused days make it an ideal relaxed escape.',
      distance: '120 km',
    },
    {
      name: 'Ljubljana',
      country: 'Slovenia',
      rationale: 'A compact city with cafés, riverside walks, and a gentle pace that suits relaxed short trips.',
      distance: '180 km',
    },
    {
      name: 'Annecy',
      country: 'France',
      rationale: 'A scenic lakeside town with markets, waterside dining, and strollable streets for food-led weekends.',
      distance: '240 km',
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
