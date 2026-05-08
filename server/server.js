const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Shared API response format
const createApiResponse = (success, data = null, error = null, message = null) => ({
  success,
  data,
  error,
  message,
  timestamp: new Date().toISOString(),
  requestId: uuidv4()
});

// DeepSeek API configuration
const DEEPSEEK_CONFIG = {
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 4000,
  timeout: 15000 // 15 seconds as per requirements
};

// Validate DeepSeek API key
const validateApiKey = () => {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY environment variable is not configured');
  }
};

// AI API call helper
const callDeepSeekAPI = async (prompt) => {
  validateApiKey();

  try {
    const response = await axios.post(`${DEEPSEEK_CONFIG.baseURL}/chat/completions`, {
      model: DEEPSEEK_CONFIG.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: DEEPSEEK_CONFIG.temperature,
      max_tokens: DEEPSEEK_CONFIG.maxTokens
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: DEEPSEEK_CONFIG.timeout
    });

    return response.data;
  } catch (error) {
    console.error('DeepSeek API Error:', error.message);
    throw error;
  }
};

// Construct prompt for destination suggestions (RF-AI01)
const constructDestinationPrompt = (params) => {
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

// Construct prompt for full itinerary generation (RF-AI04, RF-AI05, RF-AI06)
const constructItineraryPrompt = (params) => {
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

// Construct prompt for single stop regeneration (RF-AI07)
const constructRegenPrompt = (params) => {
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

// API Endpoints

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json(createApiResponse(true, {
    status: 'OK',
    server: 'TravelMind Backend',
    version: '1.0.0',
    uptime: process.uptime()
  }));
});

// Generate full itinerary endpoint (RF-AI04, RF-AI05, RF-AI06, RF-AI08)
app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const { destination, preferences } = req.body;

    if (!destination || !preferences) {
      return res.status(400).json(createApiResponse(false, null, 'INVALID_REQUEST', 'Destination and preferences are required'));
    }

    const prompt = constructItineraryPrompt({ destination, ...preferences });
    const aiResponse = await callDeepSeekAPI(prompt);

    // Parse and validate JSON response
    let itineraryData;
    try {
      const content = aiResponse.choices[0].message.content;
      itineraryData = JSON.parse(content);

      // Basic validation
      if (!itineraryData.destination || !itineraryData.days || !Array.isArray(itineraryData.days)) {
        throw new Error('Invalid itinerary structure');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return res.status(500).json(createApiResponse(false, null, 'AI_RESPONSE_INVALID', 'AI returned invalid response format'));
    }

    res.json(createApiResponse(true, itineraryData, null, 'Itinerary generated successfully'));

  } catch (error) {
    console.error('Generate Itinerary Error:', error);

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(504).json(createApiResponse(false, null, 'TIMEOUT', 'Request timed out. Please try again.'));
    }

    res.status(500).json(createApiResponse(false, null, 'GENERATION_FAILED', 'Failed to generate itinerary. Please try again.'));
  }
});

// Regenerate single stop endpoint (RF-AI07)
app.post('/api/regen-stop', async (req, res) => {
  try {
    const { destination, dayIndex, stopIndex, existingStops, preferences } = req.body;

    if (!destination || dayIndex === undefined || stopIndex === undefined || !existingStops || !preferences) {
      return res.status(400).json(createApiResponse(false, null, 'INVALID_REQUEST', 'All parameters are required for stop regeneration'));
    }

    const prompt = constructRegenPrompt({ destination, dayIndex, stopIndex, existingStops, ...preferences });
    const aiResponse = await callDeepSeekAPI(prompt);

    // Parse and validate JSON response
    let regenData;
    try {
      const content = aiResponse.choices[0].message.content;
      regenData = JSON.parse(content);

      if (!regenData.stop || !regenData.stop.id || !regenData.stop.name) {
        throw new Error('Invalid stop regeneration structure');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return res.status(500).json(createApiResponse(false, null, 'AI_RESPONSE_INVALID', 'AI returned invalid response format'));
    }

    res.json(createApiResponse(true, regenData, null, 'Stop regenerated successfully'));

  } catch (error) {
    console.error('Regen Stop Error:', error);

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(504).json(createApiResponse(false, null, 'TIMEOUT', 'Request timed out. Please try again.'));
    }

    res.status(500).json(createApiResponse(false, null, 'REGENERATION_FAILED', 'Failed to regenerate stop. Please try again.'));
  }
});

// Generate destination suggestions endpoint (RF-AI01, RF-AI02)
app.post('/api/suggest-destinations', async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json(createApiResponse(false, null, 'INVALID_REQUEST', 'Preferences are required'));
    }

    const prompt = constructDestinationPrompt(preferences);
    const aiResponse = await callDeepSeekAPI(prompt);

    // Parse and validate JSON response
    let suggestionsData;
    try {
      const content = aiResponse.choices[0].message.content;
      suggestionsData = JSON.parse(content);

      if (!suggestionsData.destinations || !Array.isArray(suggestionsData.destinations)) {
        throw new Error('Invalid suggestions structure');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return res.status(500).json(createApiResponse(false, null, 'AI_RESPONSE_INVALID', 'AI returned invalid response format'));
    }

    res.json(createApiResponse(true, suggestionsData, null, 'Destination suggestions generated successfully'));

  } catch (error) {
    console.error('Suggest Destinations Error:', error);

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(504).json(createApiResponse(false, null, 'TIMEOUT', 'Request timed out. Please try again.'));
    }

    res.status(500).json(createApiResponse(false, null, 'SUGGESTION_FAILED', 'Failed to generate destination suggestions. Please try again.'));
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json(createApiResponse(false, null, 'INTERNAL_ERROR', 'An unexpected error occurred'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json(createApiResponse(false, null, 'NOT_FOUND', 'Endpoint not found'));
});

app.listen(PORT, () => {
  console.log(`🚀 TravelMind backend server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});