const dotenv = require('dotenv');

dotenv.config();

const getConfig = () => ({
  port: Number(process.env.PORT) || 3001,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4173',
  nodeEnv: process.env.NODE_ENV || 'development',
  llmProvider: process.env.LLM_PROVIDER || 'deepseek',
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS) || 15000,
  deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
});

const validateEnv = () => {
  const missing = [];

  if (!process.env.PORT) {
    missing.push('PORT');
  }

  if (!process.env.FRONTEND_URL) {
    missing.push('FRONTEND_URL');
  }

  return missing;
};

module.exports = {
  getConfig,
  validateEnv
};
