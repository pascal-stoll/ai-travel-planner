/**
 * Destination Suggestion Prompt Template
 * Used for generating 2-3 destination recommendations based on user preferences.
 */

const buildDestinationPrompt = (params) => {
  const {
    mood = [],
    duration = '2–3 Days',
    radius = '150–300 km',
    budget = 'Mid-Range',
    groupSize = { adults: 2, children: 0 },
    transport = ['Car', 'Public Transport'],
    departureCity = 'Unknown'
  } = params;

  return `You are TravelMind, an AI-powered travel planner. Based on the user's preferences, suggest 2-3 destination recommendations.

User Preferences:
- Travel Style: ${mood.join(', ') || 'Not specified'}
- Trip Duration: ${duration}
- Maximum Distance: ${radius} from ${departureCity}
- Budget Level: ${budget}
- Group: ${groupSize.adults} adults${groupSize.children > 0 ? `, ${groupSize.children} children` : ''}
- Transport Modes: ${transport.join(', ')}

For each destination, provide:
1. Destination name and country
2. A 2-3 sentence rationale explaining why it matches the preferences
3. Rough distance from departure point

Respond with valid JSON in this exact format:
{
  "destinations": [
    {
      "name": "Destination Name",
      "country": "Country Name",
      "rationale": "Brief explanation of why this destination matches",
      "distance": "X km"
    }
  ]
}`;
};

module.exports = {
  buildDestinationPrompt
};
