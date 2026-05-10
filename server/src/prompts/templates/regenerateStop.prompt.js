/**
 * Stop Regeneration Prompt Template
 * Used for replacing a single stop within an existing itinerary.
 */

const buildRegenPrompt = (params) => {
  const {
    destination,
    dayIndex,
    stopIndex,
    existingStops,
    mood = [],
    budget = 'Mid-Range',
    groupSize = { adults: 2, children: 0 }
  } = params;

  const previousStop = existingStops[stopIndex - 1];
  const nextStop = existingStops[stopIndex + 1];

  return `You are TravelMind, an AI-powered travel planner. Regenerate a single stop for day ${dayIndex + 1} in ${destination.name}.

Context:
- Travel Style: ${mood.join(', ') || 'Not specified'}
- Budget Level: ${budget}
- Group: ${groupSize.adults} adults${groupSize.children > 0 ? `, ${groupSize.children} children` : ''}

Existing stops on this day:
${existingStops.map((stop, idx) => `${idx + 1}. ${stop.name} (${stop.category}) - ${stop.arrivalTime}`).join('\n')}

${previousStop ? `Previous stop: ${previousStop.name} at ${previousStop.arrivalTime}` : 'First stop of the day'}
${nextStop ? `Next stop: ${nextStop.name} at ${nextStop.arrivalTime}` : 'Last stop of the day'}

Generate a replacement stop that:
- Fits logically between the previous and next stops
- Matches the travel style preferences
- Is contextually appropriate for the destination
- Includes realistic timing and duration

Respond with valid JSON in this exact format:
{
  "stop": {
    "id": "uuid-string",
    "name": "New Stop Name",
    "category": "category",
    "arrivalTime": "HH:MM",
    "durationMinutes": 90,
    "description": "Detailed 2-3 sentence description...",
    "coordinates": [lat, lng]
  }
}`;
};

module.exports = {
  buildRegenPrompt
};
