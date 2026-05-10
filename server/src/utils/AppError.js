class AppError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', errorContext = null } = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.errorContext = errorContext;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
