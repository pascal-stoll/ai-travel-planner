/**
 * Enhanced Schema Validation Module for TravelMind
 * Builds on the existing schema validation with improved error handling,
 * detailed validation messages, and additional validation features.
 */

const Joi = require('joi');
const { validateProperty } = require('../../schemaValidator');

// Enhanced Joi schemas for AI responses (more detailed than JSON Schema)
const destinationResponseSchema = Joi.object({
  destinations: Joi.array()
    .items(Joi.object({
      name: Joi.string().min(1).max(100).required()
        .messages({
          'string.empty': 'Destination name cannot be empty',
          'string.min': 'Destination name must be at least 1 character',
          'string.max': 'Destination name cannot exceed 100 characters'
        }),
      country: Joi.string().min(1).max(100).required()
        .messages({
          'string.empty': 'Country cannot be empty',
          'string.min': 'Country must be at least 1 character',
          'string.max': 'Country cannot exceed 100 characters'
        }),
      rationale: Joi.string().min(20).max(500).required()
        .messages({
          'string.min': 'Rationale must be at least 20 characters',
          'string.max': 'Rationale cannot exceed 500 characters'
        }),
      distance: Joi.string().pattern(/^\d+\s*-?\s*\d*\s*km$/).required()
        .messages({
          'string.pattern.base': 'Distance must be in format like "500 km" or "500-600 km"'
        })
    }))
    .min(2).max(3).required()
    .messages({
      'array.min': 'At least 2 destinations are required',
      'array.max': 'Cannot have more than 3 destinations'
    })
});

const itineraryResponseSchema = Joi.object({
  destination: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    country: Joi.string().min(1).max(100).required(),
    coordinates: Joi.array().items(Joi.number()).length(2).optional()
  }).required(),
  travelStyle: Joi.string().optional(),
  duration: Joi.string().optional(),
  radius: Joi.string().optional(),
  bestTimeToVisit: Joi.string().optional(),
  transport: Joi.array().items(Joi.string()).optional(),
  subtitle: Joi.string().optional(),
  days: Joi.array()
    .items(Joi.object({
      day: Joi.number().integer().min(1).required(),
      title: Joi.string().optional(),
      segments: Joi.array()
        .items(Joi.object({
          id: Joi.string().min(1).required(),
          fromStopId: Joi.string().min(1).required(),
          toStopId: Joi.string().min(1).required(),
          durationMinutes: Joi.number().min(1).max(480).required(),
          note: Joi.string().min(1).required(),
          mode: Joi.string().valid('walking', 'public_transport', 'drive', 'car', 'train', 'flight').required()
        }))
        .optional(),
      stops: Joi.array()
        .items(Joi.object({
          id: Joi.string().min(1).required(),
          name: Joi.string().min(1).max(150).required(),
          category: Joi.string().valid(
            'restaurant', 'museum', 'nature', 'landmark', 'activity',
            'shopping', 'nightlife', 'entertainment', 'cultural', 'outdoor'
          ).required(),
          arrivalTime: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required()
            .messages({
              'string.pattern.base': 'Arrival time must be in HH:MM format (24-hour)'
            }),
          durationMinutes: Joi.number().min(15).max(480).required()
            .messages({
              'number.min': 'Duration must be at least 15 minutes',
              'number.max': 'Duration cannot exceed 8 hours (480 minutes)'
            }),
          description: Joi.string().min(20).max(500).required(),
          coordinates: Joi.array().items(Joi.number()).length(2).optional()
        }))
        .min(3).required()
        .messages({
          'array.min': 'Each day must have at least 3 stops'
        })
    }))
    .min(1).required()
});

const stopRegenResponseSchema = Joi.object({
  stop: Joi.object({
    id: Joi.string().min(1).required(),
    name: Joi.string().min(1).max(150).required(),
    category: Joi.string().valid(
      'restaurant', 'museum', 'nature', 'landmark', 'activity',
      'shopping', 'nightlife', 'entertainment', 'cultural', 'outdoor'
    ).required(),
    arrivalTime: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required()
      .messages({
        'string.pattern.base': 'Arrival time must be in HH:MM format (24-hour)'
      }),
    durationMinutes: Joi.number().min(15).max(480).required()
      .messages({
        'number.min': 'Duration must be at least 15 minutes',
        'number.max': 'Duration cannot exceed 8 hours (480 minutes)'
      }),
    description: Joi.string().min(20).max(500).required(),
    coordinates: Joi.array().items(Joi.number()).length(2).optional()
  }).required()
});

/**
 * Enhanced validation function with detailed error reporting
 * @param {*} data - The data to validate
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} schemaName - Name of the schema for error reporting
 * @returns {Object} - {valid: boolean, errors: Array, warnings: Array}
 */
function validateWithJoi(data, schema, schemaName) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: false, // Keep unknown fields for warning
    convert: false // Don't convert types
  });

  const errors = [];
  const warnings = [];

  if (error) {
    errors.push(...error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context.value,
      constraint: detail.type
    })));
  }

  // Check for unknown fields (warnings)
  const schemaKeys = getSchemaKeys(schema);
  const dataKeys = getObjectKeys(data);

  for (const key of dataKeys) {
    if (!schemaKeys.has(key)) {
      warnings.push({
        field: key,
        message: `Unknown field "${key}" found in response`,
        type: 'unknown_field'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validatedData: value
  };
}

/**
 * Get all possible keys from a Joi schema
 * @param {Joi.Schema} schema - Joi schema
 * @returns {Set} - Set of possible keys
 */
function getSchemaKeys(schema) {
  const keys = new Set();

  if (schema.type === 'object' && schema._ids) {
    for (const [key] of schema._ids._byKey) {
      keys.add(key);
    }
  }

  return keys;
}

/**
 * Get all keys from an object recursively
 * @param {*} obj - Object to analyze
 * @param {string} prefix - Key prefix for nested objects
 * @returns {Array} - Array of all keys
 */
function getObjectKeys(obj, prefix = '') {
  const keys = [];

  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.push(fullKey);

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        keys.push(...getObjectKeys(value, fullKey));
      }
    }
  }

  return keys;
}

/**
 * Enhanced destination response validation
 * @param {Object} response - AI response to validate
 * @returns {Object} - {valid: boolean, errors: Array, warnings: Array}
 */
function validateDestinationResponse(response) {
  return validateWithJoi(response, destinationResponseSchema, 'destination');
}

/**
 * Enhanced itinerary response validation
 * @param {Object} response - AI response to validate
 * @returns {Object} - {valid: boolean, errors: Array, warnings: Array}
 */
function validateItineraryResponse(response) {
  return validateWithJoi(response, itineraryResponseSchema, 'itinerary');
}

/**
 * Enhanced stop regeneration response validation
 * @param {Object} response - AI response to validate
 * @returns {Object} - {valid: boolean, errors: Array, warnings: Array}
 */
function validateStopRegenResponse(response) {
  return validateWithJoi(response, stopRegenResponseSchema, 'stop_regen');
}

/**
 * Validate response structure and content quality
 * @param {Object} response - Validated response
 * @param {string} type - Response type ('destination', 'itinerary', 'stop_regen')
 * @returns {Object} - {quality: number, issues: Array}
 */
function assessResponseQuality(response, type) {
  const issues = [];
  let quality = 100;

  switch (type) {
    case 'destination':
      // Check destination quality
      response.destinations.forEach((dest, idx) => {
        if (dest.rationale.length < 50) {
          issues.push(`Destination ${idx + 1} rationale is too short (${dest.rationale.length} chars)`);
          quality -= 10;
        }
        if (!dest.country || dest.country.length < 2) {
          issues.push(`Destination ${idx + 1} has invalid country`);
          quality -= 15;
        }
      });
      break;

    case 'itinerary':
      // Check itinerary quality
      response.days.forEach((day, dayIdx) => {
        if (day.stops.length < 3) {
          issues.push(`Day ${dayIdx + 1} has too few stops (${day.stops.length})`);
          quality -= 20;
        }

        day.stops.forEach((stop, stopIdx) => {
          if (stop.description.length < 50) {
            issues.push(`Day ${dayIdx + 1}, Stop ${stopIdx + 1} description is too short`);
            quality -= 5;
          }
          if (stop.durationMinutes < 30) {
            issues.push(`Day ${dayIdx + 1}, Stop ${stopIdx + 1} duration is too short (${stop.durationMinutes}min)`);
            quality -= 5;
          }
        });
      });
      break;

    case 'stop_regen':
      // Check stop quality
      const stop = response.stop;
      if (stop.description.length < 50) {
        issues.push('Regenerated stop description is too short');
        quality -= 15;
      }
      if (stop.durationMinutes < 30) {
        issues.push(`Regenerated stop duration is too short (${stop.durationMinutes}min)`);
        quality -= 10;
      }
      break;
  }

  return { quality: Math.max(0, quality), issues };
}

module.exports = {
  // Enhanced validation functions
  validateDestinationResponse,
  validateItineraryResponse,
  validateStopRegenResponse,

  // Quality assessment
  assessResponseQuality,

  // Utility functions
  validateWithJoi,
  getSchemaKeys,
  getObjectKeys
};
