const app = require('./app');
const { getConfig, validateEnv } = require('./config/env');
const logger = require('./config/logger');

console.log('[STARTUP] Loading configuration...');
const config = getConfig();
console.log('[STARTUP] Configuration loaded:', {
  port: config.port,
  provider: config.llmProvider,
  frontendUrl: config.frontendUrl
});

const missing = validateEnv();
if (missing.length > 0) {
  console.error(`[STARTUP] Missing required environment variables for ${config.llmProvider}: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('[STARTUP] Starting server...');
const server = app.listen(config.port, () => {
  console.log(`🚀 TravelMind backend server running on port ${config.port}`);
  console.log(`🤖 AI Provider: ${config.llmProvider}`);
  console.log(`📍 Health check: http://localhost:${config.port}/api/health`);
  console.log(`[STARTUP] Server ready to accept connections`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[STARTUP] Port ${config.port} is already in use. Please stop the existing server or change PORT in your environment.`);
    process.exit(1);
  }

  console.error('[STARTUP] Server failed to start:', err);
  process.exit(1);
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
