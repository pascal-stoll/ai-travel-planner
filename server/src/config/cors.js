const createCorsOptions = (frontendUrl) => ({
  origin: frontendUrl,
  credentials: true
});

module.exports = {
  createCorsOptions
};
