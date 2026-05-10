const { v4: uuidv4 } = require('uuid');

const createApiResponse = (success, data = null, error = null, message = null, errorContext = null) => ({
  success,
  data,
  error,
  message,
  ...(errorContext && { errorContext }),
  timestamp: new Date().toISOString(),
  requestId: uuidv4()
});

module.exports = {
  createApiResponse
};
