/**
 * Schema Validation Module for TravelMind
 * Validates AI-generated responses against JSON schemas to ensure data integrity
 * and structural compliance before frontend rendering.
 */

/**
 * Destination Response Schema
 * Expected structure for AI-generated destination recommendations
 */
const DESTINATION_RESPONSE_SCHEMA = {
  type: 'object',
  required: ['destinations'],
  properties: {
    destinations: {
      type: 'array',
      minItems: 2,
      maxItems: 3,
      items: {
        type: 'object',
        required: ['name', 'country', 'rationale', 'distance'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100
          },
          country: {
            type: 'string',
            minLength: 1,
            maxLength: 100
          },
          rationale: {
            type: 'string',
            minLength: 20,
            maxLength: 500
          },
          distance: {
            type: 'string',
            pattern: '^\\d+\\s*-?\\s*\\d*\\s*km$'
          }
        }
      }
    }
  }
};

/**
 * Itinerary Response Schema
 * Expected structure for AI-generated full itineraries
 */
const ITINERARY_RESPONSE_SCHEMA = {
  type: 'object',
  required: ['destination', 'days'],
  properties: {
    destination: {
      type: 'object',
      required: ['name', 'country'],
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        },
        country: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        },
        coordinates: {
          type: 'array',
          items: { type: 'number' },
          minItems: 2,
          maxItems: 2
        }
      }
    },
    days: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['day', 'stops'],
        properties: {
          day: {
            type: 'number',
            minimum: 1
          },
          stops: {
            type: 'array',
            minItems: 3,
            items: {
              type: 'object',
              required: ['id', 'name', 'category', 'arrivalTime', 'durationMinutes', 'description'],
              properties: {
                id: {
                  type: 'string',
                  minLength: 1
                },
                name: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 150
                },
                category: {
                  type: 'string',
                  enum: ['restaurant', 'museum', 'nature', 'landmark', 'activity', 'shopping', 'nightlife', 'entertainment', 'cultural', 'outdoor']
                },
                arrivalTime: {
                  type: 'string',
                  pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
                },
                durationMinutes: {
                  type: 'number',
                  minimum: 15,
                  maximum: 480
                },
                description: {
                  type: 'string',
                  minLength: 20,
                  maxLength: 500
                },
                coordinates: {
                  type: 'array',
                  items: { type: 'number' },
                  minItems: 2,
                  maxItems: 2
                }
              }
            }
          }
        }
      }
    }
  }
};

/**
 * Stop Regeneration Response Schema
 * Expected structure for AI-generated single stop replacement
 */
const STOP_REGEN_RESPONSE_SCHEMA = {
  type: 'object',
  required: ['stop'],
  properties: {
    stop: {
      type: 'object',
      required: ['id', 'name', 'category', 'arrivalTime', 'durationMinutes', 'description'],
      properties: {
        id: {
          type: 'string',
          minLength: 1
        },
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 150
        },
        category: {
          type: 'string',
          enum: ['restaurant', 'museum', 'nature', 'landmark', 'activity', 'shopping', 'nightlife', 'entertainment', 'cultural', 'outdoor']
        },
        arrivalTime: {
          type: 'string',
          pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
        },
        durationMinutes: {
          type: 'number',
          minimum: 15,
          maximum: 480
        },
        description: {
          type: 'string',
          minLength: 20,
          maxLength: 500
        },
        coordinates: {
          type: 'array',
          items: { type: 'number' },
          minItems: 2,
          maxItems: 2
        }
      }
    }
  }
};

/**
 * Validate a value against a schema property definition
 * @param {*} value - The value to validate
 * @param {Object} schema - The schema property definition
 * @param {string} path - The path to the property (for error reporting)
 * @returns {Array} - Array of validation errors (empty if valid)
 */
function validateProperty(value, schema, path = 'root') {
  const errors = [];

  // Type checking
  if (schema.type) {
    let actualType = typeof value;
    if (value === null) actualType = 'null';
    if (Array.isArray(value)) actualType = 'array';

    if (actualType !== schema.type) {
      errors.push(`${path}: expected ${schema.type}, got ${actualType}`);
      return errors;
    }
  }

  // String validations
  if (schema.type === 'string') {
    if (schema.minLength && value.length < schema.minLength) {
      errors.push(`${path}: string length must be at least ${schema.minLength}, got ${value.length}`);
    }
    if (schema.maxLength && value.length > schema.maxLength) {
      errors.push(`${path}: string length must be at most ${schema.maxLength}, got ${value.length}`);
    }
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.push(`${path}: string does not match pattern ${schema.pattern}`);
      }
    }
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`${path}: value must be one of [${schema.enum.join(', ')}], got "${value}"`);
    }
  }

  // Array validations
  if (schema.type === 'array') {
    if (schema.minItems && value.length < schema.minItems) {
      errors.push(`${path}: array must have at least ${schema.minItems} items, got ${value.length}`);
    }
    if (schema.maxItems && value.length > schema.maxItems) {
      errors.push(`${path}: array must have at most ${schema.maxItems} items, got ${value.length}`);
    }

    // Validate array items
    if (schema.items) {
      value.forEach((item, idx) => {
        const itemErrors = validateProperty(item, schema.items, `${path}[${idx}]`);
        errors.push(...itemErrors);
      });
    }
  }

  // Number validations
  if (schema.type === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${path}: value must be at least ${schema.minimum}, got ${value}`);
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`${path}: value must be at most ${schema.maximum}, got ${value}`);
    }
  }

  // Object validations
  if (schema.type === 'object') {
    if (schema.required) {
      for (const requiredField of schema.required) {
        if (!(requiredField in value)) {
          errors.push(`${path}: missing required field "${requiredField}"`);
        }
      }
    }

    // Validate object properties
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in value) {
          const propErrors = validateProperty(value[key], propSchema, `${path}.${key}`);
          errors.push(...propErrors);
        }
      }
    }
  }

  return errors;
}

/**
 * Validate response against destination schema
 * @param {Object} response - The AI response to validate
 * @returns {Object} - {valid: boolean, errors: Array}
 */
function validateDestinationResponse(response) {
  const errors = validateProperty(response, DESTINATION_RESPONSE_SCHEMA);
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate response against itinerary schema
 * @param {Object} response - The AI response to validate
 * @returns {Object} - {valid: boolean, errors: Array}
 */
function validateItineraryResponse(response) {
  const errors = validateProperty(response, ITINERARY_RESPONSE_SCHEMA);
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate response against stop regeneration schema
 * @param {Object} response - The AI response to validate
 * @returns {Object} - {valid: boolean, errors: Array}
 */
function validateStopRegenResponse(response) {
  const errors = validateProperty(response, STOP_REGEN_RESPONSE_SCHEMA);
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if response appears to be malformed (likely requires retry)
 * @param {string} jsonString - Raw JSON string from AI
 * @returns {boolean} - True if response appears malformed
 */
function isMalformedResponse(jsonString) {
  // Check for common AI hallucinations and formatting issues
  const malformedPatterns = [
    /```json[\s\S]*?```/, // Markdown code blocks
    /```[\s\S]*?```/, // Any markdown blocks
    /^["'].*["']$/, // Quoted string instead of object
    /^\[.*\]$/, // Array instead of object when object expected
    /^[^{]/, // Doesn't start with {
    /[^}]$/ // Doesn't end with }
  ];

  for (const pattern of malformedPatterns) {
    if (pattern.test(jsonString.trim())) {
      return true;
    }
  }

  return false;
}

/**
 * Attempt to extract JSON from a malformed response
 * @param {string} text - Raw text that should contain JSON
 * @returns {Object|null} - Extracted JSON object or null if extraction failed
 */
function extractJsonFromMalformed(text) {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\s*\n?/, '').replace(/```\n?/, '');
  
  // Try to find JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }

  // Try to parse as-is
  try {
    return JSON.parse(cleaned.trim());
  } catch {
    return null;
  }
}

module.exports = {
  // Schemas
  DESTINATION_RESPONSE_SCHEMA,
  ITINERARY_RESPONSE_SCHEMA,
  STOP_REGEN_RESPONSE_SCHEMA,

  // Validation functions
  validateDestinationResponse,
  validateItineraryResponse,
  validateStopRegenResponse,
  isMalformedResponse,
  extractJsonFromMalformed,

  // Direct property validation (for custom use cases)
  validateProperty
};
