/**
 * Circuit Breaker Middleware
 * Implements circuit breaker pattern for external service calls (LLM providers)
 */

const AppError = require('../utils/AppError');

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5; // failures before opening
    this.recoveryTimeout = options.recoveryTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
    this.nextAttemptTime = null;
  }

  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Async function to execute
   * @returns {*} - Result of the function
   */
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        throw new AppError('Circuit breaker is OPEN - service temporarily unavailable', {
          status: 503,
          code: 'CIRCUIT_BREAKER_OPEN',
          errorContext: {
            nextAttemptIn: Math.ceil((this.nextAttemptTime - Date.now()) / 1000),
            failureCount: this.failures
          }
        });
      } else {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      }
    }

    try {
      const result = await fn();

      // Success - reset failure count and close circuit
      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= 2) { // Require 2 successes to fully close
          this.state = 'CLOSED';
          this.failures = 0;
          this.lastFailureTime = null;
        }
      } else if (this.state === 'CLOSED') {
        this.failures = Math.max(0, this.failures - 1); // Gradually reduce failure count
      }

      return result;

    } catch (error) {
      this.recordFailure();

      // Re-throw the original error
      throw error;
    }
  }

  /**
   * Record a failure and potentially open the circuit
   */
  recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      // Failed in half-open state - go back to open
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.recoveryTimeout;
    } else if (this.failures >= this.failureThreshold) {
      // Open the circuit
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.recoveryTimeout;
    }
  }

  /**
   * Get current circuit breaker status
   * @returns {Object} - Status information
   */
  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      successCount: this.successCount
    };
  }

  /**
   * Force reset the circuit breaker (for testing/admin purposes)
   */
  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
    this.nextAttemptTime = null;
  }
}

// Global circuit breaker instances
const llmCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3, // Open after 3 failures
  recoveryTimeout: 30000, // Try again after 30 seconds
  monitoringPeriod: 5000 // Check every 5 seconds
});

// Health check circuit breaker (less strict)
const healthCircuitBreaker = new CircuitBreaker({
  failureThreshold: 10,
  recoveryTimeout: 60000,
  monitoringPeriod: 10000
});

/**
 * Circuit breaker middleware for protecting external service calls
 * @param {CircuitBreaker} breaker - Circuit breaker instance to use
 */
const circuitBreakerMiddleware = (breaker = llmCircuitBreaker) => {
  return async (req, res, next) => {
    try {
      // Add circuit breaker status to request for monitoring
      req.circuitBreaker = breaker.getStatus();

      // For actual service calls, the circuit breaker would be used in the service layer
      // This middleware just adds monitoring info
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Circuit breaker wrapper for service methods
 * @param {CircuitBreaker} breaker - Circuit breaker instance
 * @param {Function} serviceMethod - The service method to wrap
 * @returns {Function} - Wrapped service method
 */
const withCircuitBreaker = (breaker, serviceMethod) => {
  return async (...args) => {
    return await breaker.execute(() => serviceMethod(...args));
  };
};

/**
 * Health check with circuit breaker protection
 * @param {Function} healthCheckFn - Health check function
 * @returns {Function} - Protected health check function
 */
const protectedHealthCheck = (healthCheckFn) => {
  return withCircuitBreaker(healthCircuitBreaker, healthCheckFn);
};

module.exports = {
  CircuitBreaker,
  circuitBreakerMiddleware,
  withCircuitBreaker,
  protectedHealthCheck,
  llmCircuitBreaker,
  healthCircuitBreaker
};
