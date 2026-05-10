const app = require('./app');
const { getConfig, validateEnv } = require('./config/env');
const logger = require('./config/logger');

const config = getConfig();
const missing = validateEnv();

if (missing.length > 0) {
  logger.warn(`Missing environment variables: ${missing.join(', ')}. Using defaults where available.`);
}

app.listen(config.port, () => {
  logger.info(`🚀 TravelMind backend server running on port ${config.port}`);
  logger.info(`📍 Health check: http://localhost:${config.port}/api/health`);
});
