/**
 * Validation schemas for API requests
 * Uses Joi for comprehensive validation with detailed error messages
 */

const Joi = require('joi');

// Common validation schemas
const destinationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'Destination name cannot be empty',
      'string.min': 'Destination name must be at least 2 characters',
      'string.max': 'Destination name cannot exceed 100 characters',
      'any.required': 'Destination is required'
    }),
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required()
  }).optional()
});

const preferencesSchema = Joi.object({
  mood: Joi.array().items(
    Joi.string().min(2).max(50)
  ).min(1).max(10).optional()
    .messages({
      'array.min': 'At least one mood is required',
      'array.max': 'Cannot have more than 10 moods',
      'string.min': 'Each mood must be at least 2 characters',
      'string.max': 'Each mood cannot exceed 50 characters'
    }),
  duration: Joi.string().valid('A few hours', '1 Day', '2–3 Days', '2-3 Days', '1 Week+').required()
    .messages({
      'any.only': 'Duration must be one of: A few hours, 1 Day, 2–3 Days, 2-3 Days, 1 Week+',
      'any.required': 'Duration is required'
    }),
  budget: Joi.string().valid('Economy', 'Budget', 'Mid-Range', 'Premium', 'Luxury').required()
    .messages({
      'any.only': 'Budget must be one of: Economy, Budget, Mid-Range, Premium, Luxury',
      'any.required': 'Budget is required'
    }),
  transport: Joi.array().items(
    Joi.string().min(2).max(50)
  ).optional(),
  radius: Joi.string().optional(),
  location: Joi.object({
    label: Joi.string().optional(),
    coords: Joi.array().items(Joi.number()).length(2).optional()
  }).optional(),
  // Legacy fields for backward compatibility
  interests: Joi.array().items(Joi.string()).optional(),
  travelStyle: Joi.string().optional(),
  accommodation: Joi.string().optional(),
  transportation: Joi.string().optional(),
  dietaryRestrictions: Joi.array().items(Joi.string()).optional(),
  accessibility: Joi.boolean().optional()
});

// Request validation schemas
const generateItinerarySchema = Joi.object({
  destination: destinationSchema.required(),
  preferences: preferencesSchema.required()
});

const suggestDestinationsSchema = Joi.object({
  preferences: preferencesSchema.required()
});

const regenStopSchema = Joi.object({
  destination: destinationSchema.required(),
  dayIndex: Joi.number().integer().min(0).required()
    .messages({
      'number.base': 'Day index must be a number',
      'number.min': 'Day index cannot be negative',
      'any.required': 'Day index is required'
    }),
  stopIndex: Joi.number().integer().min(0).required()
    .messages({
      'number.base': 'Stop index must be a number',
      'number.min': 'Stop index cannot be negative',
      'any.required': 'Stop index is required'
    }),
  existingStops: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      type: Joi.string().required(),
      category: Joi.string().optional(),
      arrivalTime: Joi.string().optional(),
      duration: Joi.number().min(0.5).max(8).required(),
      description: Joi.string().required()
    })
  ).min(1).required()
    .messages({
      'array.min': 'At least one existing stop is required',
      'any.required': 'Existing stops are required'
    }),
  previousStop: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().optional(),
    category: Joi.string().optional(),
    arrivalTime: Joi.string().optional(),
    duration: Joi.number().min(0.5).max(8).optional(),
    description: Joi.string().optional()
  }).allow(null).optional(),
  nextStop: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().optional(),
    category: Joi.string().optional(),
    arrivalTime: Joi.string().optional(),
    duration: Joi.number().min(0.5).max(8).optional(),
    description: Joi.string().optional()
  }).allow(null).optional(),
  preferences: preferencesSchema.required()
});

module.exports = {
  generateItinerarySchema,
  suggestDestinationsSchema,
  regenStopSchema,
  destinationSchema,
  preferencesSchema
};
