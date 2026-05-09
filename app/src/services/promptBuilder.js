/**
 * TravelMind AI Prompt Builder
 * Handles prompt construction, parameter sanitization, and JSON schema validation
 * for the DeepSeek LLM API integration.
 */

/**
 * Itinerary JSON Schema Definition
 * Defines the expected structure for AI-generated travel itineraries
 */
export const ITINERARY_SCHEMA = {
  type: 'object',
  properties: {
    destination: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        country: { type: 'string' },
        coordinates: {
          type: 'array',
          items: { type: 'number' },
          minItems: 2,
          maxItems: 2
        }
      },
      required: ['name', 'country']
    },
    days: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          dayNumber: { type: 'number', minimum: 1 },
          date: { type: 'string' }, // ISO date string
          stops: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                category: {
                  type: 'string',
                  enum: ['restaurant', 'museum', 'nature', 'landmark', 'activity', 'shopping', 'entertainment']
                },
                arrivalTime: { type: 'string', pattern: '^\\d{2}:\\d{2}$' }, // HH:MM format
                durationMinutes: { type: 'number', minimum: 15, maximum: 480 },
                description: { type: 'string', minLength: 10, maxLength: 500 },
                coordinates: {
                  type: 'array',
                  items: { type: 'number' },
                  minItems: 2,
                  maxItems: 2
                }
              },
              required: ['id', 'name', 'category', 'arrivalTime', 'durationMinutes', 'description']
            },
            minItems: 3 // Minimum 3 stops per day
          }
        },
        required: ['dayNumber', 'stops']
      },
      minItems: 1
    }
  },
  required: ['destination', 'days']
};

/**
 * Destination Suggestions JSON Schema
 * Defines the expected structure for AI-generated destination recommendations
 */
export const DESTINATION_SCHEMA = {
  type: 'object',
  properties: {
    destinations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          country: { type: 'string' },
          rationale: { type: 'string', minLength: 20, maxLength: 300 },
          distanceKm: { type: 'number', minimum: 0 },
          estimatedTravelTime: { type: 'string' }
        },
        required: ['name', 'country', 'rationale', 'distanceKm']
      },
      minItems: 2,
      maxItems: 3
    }
  },
  required: ['destinations']
};

/**
 * Fast-path default values for unspecified parameters
 */
const FAST_PATH_DEFAULTS = {
  budget: 'Mid-Range',
  adults: 2,
  children: 0,
  transport: ['Car', 'Public Transport']
};

/**
 * Sanitize user input to prevent prompt injection attacks
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[\\]/g, '\\\\') // Escape backslashes
    .replace(/["]/g, '\\"')   // Escape quotes
    .replace(/[\n\r]/g, ' ')  // Replace newlines with spaces
    .replace(/[^\w\s\-.,!?()]/g, '') // Remove potentially dangerous characters
    .trim()
    .substring(0, 200); // Limit length
}

/**
 * Sanitize array inputs
 * @param {Array} input - Array of strings
 * @returns {Array} - Sanitized array
 */
function sanitizeArray(input) {
  if (!Array.isArray(input)) return [];
  return input.map(item => sanitizeInput(item)).filter(item => item.length > 0);
}

/**
 * Build the complete AI prompt for itinerary generation
 * @param {Object} params - User parameters from wizard
 * @param {string} mode - 'itinerary' or 'destinations'
 * @returns {string} - Complete prompt ready for LLM API
 */
export function buildItineraryPrompt(params, mode = 'itinerary') {
  // Apply fast-path defaults for unspecified parameters
  const sanitizedParams = applyDefaultsAndSanitize(params);

  // Build the prompt based on mode
  if (mode === 'destinations') {
    return buildDestinationPrompt(sanitizedParams);
  }

  return buildFullItineraryPrompt(sanitizedParams);
}

/**
 * Apply fast-path defaults and sanitize all parameters
 * @param {Object} params - Raw user parameters
 * @returns {Object} - Sanitized parameters with defaults applied
 */
function applyDefaultsAndSanitize(params) {
  const sanitized = { ...params };

  // Sanitize string parameters
  if (sanitized.location?.label) {
    sanitized.location.label = sanitizeInput(sanitized.location.label);
  }

  // Sanitize array parameters
  if (sanitized.mood) {
    sanitized.mood = sanitizeArray(sanitized.mood);
  }

  if (sanitized.transport) {
    sanitized.transport = sanitizeArray(sanitized.transport);
  }

  // Apply fast-path defaults for unspecified parameters
  sanitized.budget = sanitized.budget || FAST_PATH_DEFAULTS.budget;
  sanitized.adults = sanitized.adults ?? FAST_PATH_DEFAULTS.adults;
  sanitized.children = sanitized.children ?? FAST_PATH_DEFAULTS.children;
  sanitized.transport = sanitized.transport.length > 0 ? sanitized.transport : FAST_PATH_DEFAULTS.transport;

  // Sanitize numeric parameters
  sanitized.adults = Math.max(1, Math.min(20, parseInt(sanitized.adults) || 2));
  sanitized.children = Math.max(0, Math.min(10, parseInt(sanitized.children) || 0));

  return sanitized;
}

/**
 * Build prompt for destination suggestions
 * @param {Object} params - Sanitized parameters
 * @returns {string} - Destination suggestion prompt
 */
function buildDestinationPrompt(params) {
  const moodText = params.mood.length > 0 ? params.mood.join(', ') : 'any style';
  const locationText = params.location?.label || 'anywhere';
  const radiusText = params.radius || 'any distance';

  return `You are TravelMind, an AI travel curator. Based on the user's preferences, suggest 2-3 perfect destinations.

User Preferences:
- Travel Style: ${moodText}
- Starting Location: ${locationText}
- Maximum Distance: ${radiusText}
- Trip Duration: ${params.duration || 'any length'}
- Budget Level: ${params.budget}
- Group Size: ${params.adults} adults, ${params.children} children
- Preferred Transport: ${params.transport.join(', ')}

Requirements:
- Destinations must match the travel style and be within the specified distance
- Each destination needs a 2-3 sentence rationale explaining why it fits
- Include rough distance from starting location
- Focus on authentic, high-quality experiences

${getJSONInstructions(DESTINATION_SCHEMA)}`;
}

/**
 * Build prompt for full itinerary generation
 * @param {Object} params - Sanitized parameters
 * @returns {string} - Full itinerary prompt
 */
function buildFullItineraryPrompt(params) {
  const moodText = params.mood.length > 0 ? params.mood.join(', ') : 'balanced mix';
  const locationText = params.location?.label || 'user location';
  const radiusText = params.radius || 'reasonable distance';

  // Calculate minimum stops based on duration
  const minStops = calculateMinStops(params.duration);

  return `You are TravelMind, an AI travel curator creating personalized itineraries.

User Request:
- Travel Style: ${moodText}
- Destination: ${params.destination?.name || 'to be determined'}
- Starting Location: ${locationText}
- Maximum Distance: ${radiusText}
- Trip Duration: ${params.duration}
- Budget Level: ${params.budget}
- Group Size: ${params.adults} adults, ${params.children} children
- Preferred Transport: ${params.transport.join(', ')}

Itinerary Requirements:
- Create a complete ${params.duration} itinerary with ${minStops} stops minimum
- Each stop must include: name, category, arrival time, duration, and description
- Optimize for the specified travel style and group composition
- Include realistic travel times between stops based on transport preferences
- Ensure logical flow and pacing throughout the day
- Focus on authentic, high-quality experiences within budget

${getJSONInstructions(ITINERARY_SCHEMA)}`;
}

/**
 * Calculate minimum stops based on trip duration
 * @param {string} duration - Trip duration
 * @returns {number} - Minimum number of stops
 */
function calculateMinStops(duration) {
  switch (duration) {
    case 'A few hours': return 3;
    case '1 Day': return 5;
    case '2–3 Days': return 8;
    case '1 Week+': return 15;
    default: return 5;
  }
}

/**
 * Generate JSON schema instructions for the prompt
 * @param {Object} schema - JSON schema object
 * @returns {string} - Formatted instructions
 */
function getJSONInstructions(schema) {
  return `
CRITICAL: Respond ONLY with valid JSON. No markdown, no explanations, no additional text.

JSON Schema Requirements:
${JSON.stringify(schema, null, 2)}

Response Format:
- Must be valid JSON matching the schema exactly
- No additional keys or nested objects beyond the schema
- String values should be descriptive and contextual
- Numeric values must be realistic and appropriate
- Arrays must contain the minimum required items

Your response must parse successfully with JSON.parse() and validate against this schema.`;
}

/**
 * Validate response against JSON schema
 * @param {string|Object} response - API response
 * @param {Object} schema - Schema to validate against
 * @returns {Object} - Validation result {valid: boolean, errors: Array}
 */
export function validateResponse(response, schema) {
  try {
    const data = typeof response === 'string' ? JSON.parse(response) : response;

    // Basic schema validation (simplified - in production use a proper JSON schema validator)
    const errors = [];

    if (schema.type === 'object' && typeof data !== 'object') {
      errors.push('Response must be an object');
    }

    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Add more validation logic as needed...

    return {
      valid: errors.length === 0,
      errors,
      data: errors.length === 0 ? data : null
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Invalid JSON: ${error.message}`],
      data: null
    };
  }
}