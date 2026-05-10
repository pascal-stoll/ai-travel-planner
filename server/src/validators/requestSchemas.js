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
  duration: Joi.number().integer().min(1).max(30).required()
    .messages({
      'number.base': 'Duration must be a number',
      'number.min': 'Duration must be at least 1 day',
      'number.max': 'Duration cannot exceed 30 days',
      'any.required': 'Duration is required'
    }),
  budget: Joi.string().valid('budget', 'moderate', 'luxury').required()
    .messages({
      'any.only': 'Budget must be one of: budget, moderate, luxury',
      'any.required': 'Budget is required'
    }),
  interests: Joi.array().items(
    Joi.string().min(2).max(50)
  ).min(1).max(10).required()
    .messages({
      'array.min': 'At least one interest is required',
      'array.max': 'Cannot have more than 10 interests',
      'string.min': 'Each interest must be at least 2 characters',
      'string.max': 'Each interest cannot exceed 50 characters',
      'any.required': 'Interests are required'
    }),
  travelStyle: Joi.string().valid('relaxed', 'active', 'cultural', 'adventure').required()
    .messages({
      'any.only': 'Travel style must be one of: relaxed, active, cultural, adventure',
      'any.required': 'Travel style is required'
    }),
  accommodation: Joi.string().valid('hotel', 'hostel', 'airbnb', 'resort').optional(),
  transportation: Joi.string().valid('public', 'rental', 'taxi', 'walking').optional(),
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
      duration: Joi.number().min(0.5).max(8).required(),
      description: Joi.string().required()
    })
  ).min(1).required()
    .messages({
      'array.min': 'At least one existing stop is required',
      'any.required': 'Existing stops are required'
    }),
  preferences: preferencesSchema.required()
});

module.exports = {
  generateItinerarySchema,
  suggestDestinationsSchema,
  regenStopSchema,
  destinationSchema,
  preferencesSchema
};
