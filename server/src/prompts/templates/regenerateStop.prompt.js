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
    previousStop: providedPreviousStop = null,
    nextStop: providedNextStop = null,
    mood = [],
    budget = 'Mid-Range',
    groupSize = { adults: 2, children: 0 }
  } = params;

  const previousStop = providedPreviousStop || existingStops[stopIndex - 1];
  const nextStop = providedNextStop || existingStops[stopIndex + 1];
  const formatStop = (stop, idx) => {
    const category = stop.category || stop.type || 'activity';
    const timing = stop.arrivalTime || `${stop.duration}h`;
    return `${idx + 1}. ${stop.name} (${category}) - ${timing}`;
  };
  const formatNeighbor = (label, stop) => {
    if (!stop) return label === 'Previous stop' ? 'First stop of the day' : 'Last stop of the day';

    const timing = stop.arrivalTime || `${stop.duration}h`;
    return `${label}: ${stop.name} at ${timing}`;
  };

  return `You are TravelMind, an AI-powered travel planner. Regenerate a single stop for day ${dayIndex + 1} in ${destination.name}.

Context:
- Travel Style: ${mood.join(', ') || 'Not specified'}
- Budget Level: ${budget}
- Group: ${groupSize.adults} adults${groupSize.children > 0 ? `, ${groupSize.children} children` : ''}

Existing stops on this day:
${existingStops.map(formatStop).join('\n')}

${formatNeighbor('Previous stop', previousStop)}
${formatNeighbor('Next stop', nextStop)}

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
