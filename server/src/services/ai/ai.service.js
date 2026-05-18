const AppError = require('../../utils/AppError');
const { validateDestinationResponse, validateItineraryResponse, validateStopRegenResponse, assessResponseQuality } = require('../../validators/enhancedSchemaValidator');

const parseAiResponse = (aiResponse, validator, errorCodePrefix, responseType) => {
  if (!aiResponse?.choices?.[0]?.message?.content) {
    throw new AppError('AI response is missing expected content', {
      status: 502,
      code: `${errorCodePrefix}_NO_CONTENT`
    });
  }

  let data;
  try {
    data = JSON.parse(aiResponse.choices[0].message.content);
  } catch (parseError) {
    throw new AppError('AI returned invalid JSON format', {
      status: 400,
      code: `${errorCodePrefix}_AI_RESPONSE_INVALID`,
      errorContext: { parseError: parseError.message }
    });
  }

  const validation = validator(data);
  if (!validation.valid) {
    throw new AppError('Generated response does not match expected schema', {
      status: 422,
      code: 'SCHEMA_VALIDATION_FAILED',
      errorContext: {
        validationErrors: validation.errors,
        warnings: validation.warnings
      }
    });
  }

  // Assess response quality
  const quality = assessResponseQuality(data, responseType);
  // Note: Low quality responses are logged for monitoring but not rejected
  // Quality assessment helps with continuous improvement of AI prompts

  return data;
};

const createAiService = ({ llmProvider, promptBuilder, schemaValidator, timeoutMs }) => {
  const generateItinerary = async (destination, preferences) => {
    console.log('[AI] generateItinerary called with:', { destination, preferences });
    const prompt = promptBuilder.buildItineraryPrompt({ destination, ...preferences });
    console.log('[AI] Generated prompt length:', prompt.length);
    const aiResponse = await llmProvider.generateCompletion(prompt);
    console.log('[AI] Received AI response');
    return parseAiResponse(aiResponse, validateItineraryResponse, 'ITINERARY', 'itinerary');
  };

  const regenStop = async (destination, dayIndex, stopIndex, existingStops, preferences, context = {}) => {
    console.log('[AI] regenStop called with:', { destination, dayIndex, stopIndex, existingStops: existingStops?.length, preferences });
    const prompt = promptBuilder.buildRegenPrompt({ destination, dayIndex, stopIndex, existingStops, ...context, ...preferences });
    console.log('[AI] Generated regen prompt length:', prompt.length);
    const aiResponse = await llmProvider.generateCompletion(prompt);
    console.log('[AI] Received AI response for regen');
    return parseAiResponse(aiResponse, validateStopRegenResponse, 'REGEN', 'stop_regen');
  };

  const suggestDestinations = async (preferences) => {
    console.log('[AI] suggestDestinations called with:', preferences);
    const prompt = promptBuilder.buildDestinationPrompt(preferences);
    console.log('[AI] Generated destination prompt length:', prompt.length);
    const aiResponse = await llmProvider.generateCompletion(prompt);
    console.log('[AI] Received AI response for destinations');
    return parseAiResponse(aiResponse, validateDestinationResponse, 'DESTINATIONS', 'destination');
  };

  return {
    generateItinerary,
    regenStop,
    suggestDestinations
  };
};

module.exports = {
  createAiService,
  parseAiResponse
};
