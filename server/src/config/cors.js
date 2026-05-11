const createCorsOptions = (frontendUrl) => ({
  origin: [
    frontendUrl,
    'http://localhost:3000',  // React dev server
    'http://localhost:5173',  // Vite dev server
    'http://localhost:4173',  // Vite preview
    /^https:\/\/.*\.vercel\.app$/,  // Vercel deployments
  ],
  credentials: true
});

module.exports = {
  createCorsOptions
};
