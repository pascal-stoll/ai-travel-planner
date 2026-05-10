const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
};

module.exports = requestLogger;
