const dotenv = require('dotenv');

dotenv.config();

const getConfig = () => ({
  port: Number(process.env.PORT) || 3001,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4173',
  nodeEnv: process.env.NODE_ENV || 'development',
  llmProvider: process.env.AI_PROVIDER || 'deepseek',
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS) || 15000,
  deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiApiVersion: process.env.GEMINI_API_VERSION || 'v1beta',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  fallbackLlmProvider: process.env.FALLBACK_AI_PROVIDER || null,
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  openrouterModel: process.env.OPENROUTER_MODEL || 'gpt-4o-mini'
});

const validateEnv = () => {
  const required = [];

  const provider = (process.env.AI_PROVIDER || 'deepseek').toLowerCase();
  const providerKeys = {
    deepseek: 'DEEPSEEK_API_KEY',
    gemini: 'GEMINI_API_KEY',
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    openrouter: 'OPENROUTER_API_KEY'
  };

  const providerKey = providerKeys[provider];
  if (providerKey && !process.env[providerKey]) {
    required.push(providerKey);
  }

  const fallbackProvider = (process.env.FALLBACK_AI_PROVIDER || '').toLowerCase();
  if (fallbackProvider && providerKeys[fallbackProvider] && !process.env[providerKeys[fallbackProvider]]) {
    required.push(providerKeys[fallbackProvider]);
  }

  return required;
};

module.exports = {
  getConfig,
  validateEnv
};
