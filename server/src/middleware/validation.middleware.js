/**
 * Request validation middleware
 * Uses Joi schemas to validate incoming requests and provide detailed error messages
 */

const AppError = require('../utils/AppError');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Collect all validation errors
      stripUnknown: true, // Remove unknown fields
      convert: true // Convert types where possible
    });

    if (error) {
      // Transform Joi errors into our AppError format
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      const appError = new AppError('Request validation failed', {
        status: 400,
        code: 'VALIDATION_ERROR',
        errorContext: {
          validationErrors,
          totalErrors: validationErrors.length
        }
      });

      return next(appError);
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      const appError = new AppError('URL parameter validation failed', {
        status: 400,
        code: 'PARAM_VALIDATION_ERROR',
        errorContext: {
          validationErrors,
          totalErrors: validationErrors.length
        }
      });

      return next(appError);
    }

    req.params = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      const appError = new AppError('Query parameter validation failed', {
        status: 400,
        code: 'QUERY_VALIDATION_ERROR',
        errorContext: {
          validationErrors,
          totalErrors: validationErrors.length
        }
      });

      return next(appError);
    }

    req.query = value;
    next();
  };
};

module.exports = {
  validateRequest,
  validateParams,
  validateQuery
};
