const createRateLimitOptions = () => ({
  windowMs: 15 * 60 * 1000,
  max: 100
});

module.exports = {
  createRateLimitOptions
};
