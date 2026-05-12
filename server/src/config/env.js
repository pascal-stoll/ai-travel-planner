const dotenv = require('dotenv');

dotenv.config();

const getNodeEnv = () => process.env.NODE_ENV || 'development';

const getPrimaryProvider = () => {
  const explicitProvider = process.env.LLM_PROVIDER || process.env.AI_PROVIDER;
  if (explicitProvider) return explicitProvider;

  if (process.env.OPENROUTER_API_KEY) {
    return 'openrouter';
  }

  return getNodeEnv() === 'development' ? 'mock' : 'deepseek';
};

const getConfig = () => ({
  port: Number(process.env.PORT) || 3001,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4173',
  nodeEnv: getNodeEnv(),
  llmProvider: getPrimaryProvider(),
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

  const provider = getPrimaryProvider().toLowerCase();
  const providerKeys = {
    deepseek: 'DEEPSEEK_API_KEY',
    mock: null,
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
