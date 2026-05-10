/**
 * Itinerary Generation Prompt Template
 * Used for generating detailed day-by-day itineraries for a destination.
 */

const buildItineraryPrompt = (params) => {
  const {
    destination,
    mood = [],
    duration = '2–3 Days',
    budget = 'Mid-Range',
    groupSize = { adults: 2, children: 0 },
    transport = ['Car', 'Public Transport']
  } = params;

  const durationMapping = {
    'A few hours': 1,
    '1 Day': 1,
    '2–3 Days': 3,
    '1 Week+': 7
  };

  const days = durationMapping[duration] || 3;
  const stopsPerDay = duration === 'A few hours' ? 3 : Math.max(5, Math.ceil(8 / days));

  return `You are TravelMind, an AI-powered travel planner. Create a detailed day-by-day itinerary for ${destination.name}, ${destination.country}.

User Preferences:
- Travel Style: ${mood.join(', ') || 'Not specified'}
- Trip Duration: ${duration} (${days} day${days > 1 ? 's' : ''})
- Budget Level: ${budget}
- Group: ${groupSize.adults} adults${groupSize.children > 0 ? `, ${groupSize.children} children` : ''}
- Transport Modes: ${transport.join(', ')}

Requirements:
- Create exactly ${days} day${days > 1 ? 's' : ''} of activities
- Each day should have ${stopsPerDay} stops minimum
- Include diverse activities matching the travel style preferences
- Consider group composition (family-friendly if children included)
- Respect budget level in activity suggestions

For each stop, provide:
- Unique ID (uuid)
- Stop name
- Category (restaurant, museum, nature, landmark, activity, shopping, nightlife, etc.)
- Suggested arrival time (HH:MM format)
- Estimated visit duration in minutes
- Detailed 2-3 sentence description contextualized to user's preferences
- Coordinates (latitude, longitude as numbers)

Include travel times between consecutive stops based on transport modes.

Respond with valid JSON in this exact format:
{
  "destination": {
    "name": "${destination.name}",
    "country": "${destination.country}",
    "coordinates": [latitude, longitude]
  },
  "days": [
    {
      "day": 1,
      "stops": [
        {
          "id": "uuid-string",
          "name": "Stop Name",
          "category": "category",
          "arrivalTime": "09:00",
          "durationMinutes": 120,
          "description": "Detailed description...",
          "coordinates": [lat, lng]
        }
      ]
    }
  ]
}`;
};

module.exports = {
  buildItineraryPrompt
};
