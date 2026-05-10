const { createApiResponse } = require('../utils/createApiResponse');

const healthCheck = (req, res) => {
  res.json(createApiResponse(true, {
    status: 'OK',
    server: 'TravelMind Backend',
    version: '1.0.0',
    uptime: process.uptime()
  }));
};

module.exports = {
  healthCheck
};
