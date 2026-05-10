/**
 * Rate Limiting Middleware
 * Implements token bucket algorithm for API rate limiting
 */

const AppError = require('../utils/AppError');

// In-memory storage for rate limiting (in production, use Redis)
const rateLimitStore = new Map();

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    this.maxRequests = options.maxRequests || 100; // requests per window
    this.skipSuccessfulRequests = options.skipSuccessfulRequests || false;
    this.skipFailedRequests = options.skipFailedRequests || false;
  }

  /**
   * Check if request should be rate limited
   * @param {string} key - Unique identifier for the client (IP, user ID, etc.)
   * @returns {Object} - {limited: boolean, resetTime: number, remaining: number}
   */
  checkLimit(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }

    const requests = rateLimitStore.get(key);

    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    rateLimitStore.set(key, validRequests);

    const remaining = Math.max(0, this.maxRequests - validRequests.length);
    const limited = validRequests.length >= this.maxRequests;

    let resetTime = now + this.windowMs;
    if (validRequests.length > 0) {
      resetTime = validRequests[0] + this.windowMs;
    }

    return {
      limited,
      resetTime,
      remaining
    };
  }

  /**
   * Record a request
   * @param {string} key - Unique identifier for the client
   */
  recordRequest(key) {
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }

    const requests = rateLimitStore.get(key);
    requests.push(now);

    // Clean up old entries periodically
    if (requests.length > this.maxRequests * 2) {
      const windowStart = now - this.windowMs;
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      rateLimitStore.set(key, validRequests);
    }
  }

  /**
   * Clean up old entries (call periodically)
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, requests] of rateLimitStore.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      if (validRequests.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, validRequests);
      }
    }
  }
}

// Global rate limiter instances
const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100 // 100 requests per 15 minutes
});

const aiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10 // 10 AI requests per minute
});

// Clean up old entries every 5 minutes
setInterval(() => {
  apiRateLimiter.cleanup();
  aiRateLimiter.cleanup();
}, 5 * 60 * 1000);

/**
 * General API rate limiting middleware
 */
const rateLimitMiddleware = (options = {}) => {
  const limiter = options.limiter || apiRateLimiter;
  const keyGen = options.keyGenerator || getIPKey;

  return (req, res, next) => {
    const key = keyGen(req);
    const limitResult = limiter.checkLimit(key);

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': limiter.maxRequests,
      'X-RateLimit-Remaining': limitResult.remaining,
      'X-RateLimit-Reset': Math.ceil(limitResult.resetTime / 1000)
    });

    if (limitResult.limited) {
      const resetInSeconds = Math.ceil((limitResult.resetTime - Date.now()) / 1000);

      const error = new AppError('Too many requests', {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        errorContext: {
          resetInSeconds,
          limit: limiter.maxRequests,
          windowMs: limiter.windowMs
        }
      });

      return next(error);
    }

    // Record the request
    limiter.recordRequest(key);

    // Add rate limit info to request for logging
    req.rateLimit = limitResult;

    next();
  };
};

/**
 * AI-specific rate limiting (stricter limits for expensive operations)
 */
const aiKeyGenerator = (req) => `ai_${req.ip || req.connection?.remoteAddress || 'unknown'}`;
const aiRateLimitMiddleware = () => rateLimitMiddleware({
  limiter: aiRateLimiter,
  keyGenerator: aiKeyGenerator
});

/**
 * IP-based key generator
 */
const getIPKey = (req) => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

/**
 * User-based key generator (when authentication is added)
 */
const getUserKey = (req) => {
  return req.user?.id || getIPKey(req);
};

module.exports = {
  RateLimiter,
  rateLimitMiddleware,
  aiRateLimitMiddleware,
  apiRateLimiter,
  aiRateLimiter,
  getIPKey,
  getUserKey
};
