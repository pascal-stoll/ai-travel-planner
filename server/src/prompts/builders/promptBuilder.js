/**
 * Prompt Builder
 * Centralized module for all AI prompt generation.
 * Makes it easy to maintain, test, and evolve prompts independently.
 */

const { buildDestinationPrompt } = require('../templates/destination.prompt.js');
const { buildItineraryPrompt } = require('../templates/itinerary.prompt.js');
const { buildRegenPrompt } = require('../templates/regenerateStop.prompt.js');

const PromptBuilder = {
  buildDestinationPrompt,
  buildItineraryPrompt,
  buildRegenPrompt
};

module.exports = PromptBuilder;
