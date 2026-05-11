const { createApiResponse } = require('../utils/createApiResponse');
const { getConfig } = require('../config/env');

const healthCheck = (req, res) => {
  const config = getConfig();
  console.log('[HEALTH] Health check requested');

  res.json(createApiResponse(true, {
    status: 'OK',
    server: 'TravelMind Backend',
    version: '1.0.0',
    uptime: process.uptime(),
    provider: config.llmProvider,
    port: config.port
  }));
};

module.exports = {
  healthCheck
};
