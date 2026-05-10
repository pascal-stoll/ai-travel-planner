const { createApiResponse } = require('../utils/createApiResponse');
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);

  const status = err.status || 500;
  const response = createApiResponse(
    false,
    null,
    err.code || 'INTERNAL_ERROR',
    err.message || 'An unexpected error occurred',
    err.errorContext || {
      type: err.constructor?.name
    }
  );

  res.status(status).json(response);
};

module.exports = errorHandler;
