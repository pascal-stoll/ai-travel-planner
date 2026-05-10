/**
 * Retry Strategies and Utilities
 * Implements various retry patterns for handling transient failures
 */

const AppError = require('../utils/AppError');

/**
 * Exponential backoff calculator
 * @param {number} attempt - Current attempt number (0-based)
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @param {number} multiplier - Backoff multiplier
 * @returns {number} - Delay in milliseconds
 */
function exponentialBackoff(attempt, baseDelay = 1000, maxDelay = 30000, multiplier = 2) {
  const delay = baseDelay * Math.pow(multiplier, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Jittered exponential backoff (prevents thundering herd)
 * @param {number} attempt - Current attempt number (0-based)
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @param {number} multiplier - Backoff multiplier
 * @param {number} jitterFactor - Jitter factor (0-1)
 * @returns {number} - Delay in milliseconds
 */
function jitteredBackoff(attempt, baseDelay = 1000, maxDelay = 30000, multiplier = 2, jitterFactor = 0.1) {
  const baseBackoff = exponentialBackoff(attempt, baseDelay, maxDelay, multiplier);
  const jitter = baseBackoff * jitterFactor * Math.random();
  return Math.floor(baseBackoff + jitter);
}

/**
 * Retry configuration
 */
class RetryConfig {
  constructor(options = {}) {
    this.maxAttempts = options.maxAttempts || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.jitterFactor = options.jitterFactor || 0.1;
    this.retryableErrors = options.retryableErrors || ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'];
    this.retryCondition = options.retryCondition || this.defaultRetryCondition.bind(this);
  }

  /**
   * Default retry condition - checks for network and timeout errors
   * @param {Error} error - The error that occurred
   * @param {number} attempt - Current attempt number
   * @returns {boolean} - Whether to retry
   */
  defaultRetryCondition(error, attempt) {
    // Don't retry on the last attempt
    if (attempt >= this.maxAttempts - 1) {
      return false;
    }

    // Retry on network errors
    if (this.retryableErrors.includes(error.code)) {
      return true;
    }

    // Retry on HTTP 5xx errors
    if (error.response?.status >= 500) {
      return true;
    }

    // Retry on rate limiting (429)
    if (error.response?.status === 429) {
      return true;
    }

    // Retry on timeout
    if (error.message?.toLowerCase().includes('timeout')) {
      return true;
    }

    return false;
  }

  /**
   * Calculate delay for the given attempt
   * @param {number} attempt - Current attempt number (0-based)
   * @returns {number} - Delay in milliseconds
   */
  calculateDelay(attempt) {
    return jitteredBackoff(attempt, this.baseDelay, this.maxDelay, this.backoffMultiplier, this.jitterFactor);
  }
}

/**
 * Execute a function with retry logic
 * @param {Function} fn - Async function to execute
 * @param {RetryConfig} config - Retry configuration
 * @param {Object} context - Context for logging/debugging
 * @returns {*} - Result of the function
 */
async function withRetry(fn, config = new RetryConfig(), context = {}) {
  let lastError;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (!config.retryCondition(error, attempt)) {
        break;
      }

      // Calculate delay and wait
      const delay = config.calculateDelay(attempt);
      if (attempt < config.maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All attempts failed
  throw new AppError(`Operation failed after ${config.maxAttempts} attempts`, {
    status: 502,
    code: 'RETRY_EXHAUSTED',
    errorContext: {
      lastError: lastError.message,
      attempts: config.maxAttempts,
      context
    },
    cause: lastError
  });
}

/**
 * Retry configurations for different scenarios
 */
const retryConfigs = {
  // For LLM API calls - more aggressive retry
  llm: new RetryConfig({
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitterFactor: 0.2,
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'EPIPE'],
    retryCondition: (error, attempt) => {
      if (attempt >= 2) return false; // Max 3 attempts

      // Retry on network errors
      if (['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'EPIPE'].includes(error.code)) {
        return true;
      }

      // Retry on HTTP 5xx and rate limiting
      if (error.response?.status >= 500 || error.response?.status === 429) {
        return true;
      }

      // Retry on timeout messages
      if (error.message?.toLowerCase().includes('timeout')) {
        return true;
      }

      return false;
    }
  }),

  // For general API calls - conservative retry
  api: new RetryConfig({
    maxAttempts: 2,
    baseDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 1.5,
    jitterFactor: 0.1
  }),

  // For database operations - minimal retry
  database: new RetryConfig({
    maxAttempts: 2,
    baseDelay: 100,
    maxDelay: 1000,
    backoffMultiplier: 2,
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
  })
};

/**
 * Create a retry wrapper for a specific configuration
 * @param {string|RetryConfig} config - Retry config name or instance
 * @returns {Function} - Retry wrapper function
 */
function createRetryWrapper(config) {
  const retryConfig = typeof config === 'string' ? retryConfigs[config] : config;

  return (fn, context = {}) => withRetry(fn, retryConfig, context);
}

module.exports = {
  RetryConfig,
  withRetry,
  exponentialBackoff,
  jitteredBackoff,
  retryConfigs,
  createRetryWrapper
};
