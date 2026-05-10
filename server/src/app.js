const express = require('express');
const cors = require('cors');
const { getConfig } = require('./config/env');
const { createCorsOptions } = require('./config/cors');
const requestLogger = require('./middleware/requestLogger.middleware');
const errorHandler = require('./middleware/error.middleware');
const { rateLimitMiddleware, aiRateLimitMiddleware } = require('./middleware/rateLimit.middleware');
const { validateRequest } = require('./middleware/validation.middleware');
const { createApiResponse } = require('./utils/createApiResponse');
const {
  generateItinerarySchema,
  suggestDestinationsSchema,
  regenStopSchema
} = require('./validators/requestSchemas');
const LLMProviderFactory = require('./providers/llmProviderFactory');
const { createAiService } = require('./services/ai/ai.service');
const promptBuilder = require('./prompts/builders/promptBuilder');
const healthRoutes = require('./routes/health.routes');
const itineraryRoutes = require('./routes/itinerary.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();
const config = getConfig();

app.use(cors(createCorsOptions(config.frontendUrl)));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Apply general rate limiting to all API routes
app.use('/api', rateLimitMiddleware());

const aiService = createAiService({
  llmProvider: LLMProviderFactory.createFromEnvironment(config),
  promptBuilder,
  timeoutMs: config.requestTimeoutMs
});

// Health routes (no additional validation needed)
app.use('/api', healthRoutes);

// AI routes with enhanced validation and stricter rate limiting
app.use('/api/ai', aiRateLimitMiddleware());
app.use('/api/ai/suggest-destinations', validateRequest(suggestDestinationsSchema));
app.use('/api/ai/regen-stop', validateRequest(regenStopSchema));

// Itinerary routes with validation
app.use('/api/itinerary/generate-itinerary', validateRequest(generateItinerarySchema));

app.use('/api', itineraryRoutes({
  createApiResponse,
  aiService
}));
app.use('/api', aiRoutes({
  createApiResponse,
  aiService
}));

app.use((req, res) => {
  res.status(404).json(createApiResponse(false, null, 'NOT_FOUND', `Endpoint ${req.method} ${req.path} not found`));
});

app.use(errorHandler);

module.exports = app;
