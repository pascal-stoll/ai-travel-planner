/**
 * LLM Provider Factory
 * Creates and configures LLM providers based on environment settings.
 * Enables seamless switching between different LLM vendors.
 */

const DeepSeekProvider = require('./llm/deepseek.provider');
const GeminiProvider = require('./llm/gemini.provider');
const OpenAIProvider = require('./llm/openai.provider');
const AnthropicProvider = require('./llm/anthropic.provider');
const OpenRouterProvider = require('./llm/openrouter.provider');
const MockProvider = require('./llm/mock.provider');
const AppError = require('../utils/AppError');

class LLMProviderFactory {
  static createProvider(providerName, config = {}) {
    const providers = {
      deepseek: DeepSeekProvider,
      gemini: GeminiProvider,
      openai: OpenAIProvider,
      anthropic: AnthropicProvider,
      openrouter: OpenRouterProvider,
      mock: MockProvider
    };

    const ProviderClass = providers[providerName.toLowerCase()];
    if (!ProviderClass) {
      throw new AppError(`Unknown LLM provider: ${providerName}`, {
        status: 500,
        code: 'INVALID_PROVIDER',
        errorContext: { availableProviders: Object.keys(providers) }
      });
    }

    return new ProviderClass(config);
  }

  static createFromEnvironment(envConfig) {
    const providerName = envConfig.llmProvider || 'deepseek';

    const providerConfig = {
      apiKey: this._getApiKeyForProvider(providerName, envConfig),
      timeoutMs: envConfig.requestTimeoutMs,
      maxRetries: 1,
      retryDelayMs: 1000
    };

    if (providerName === 'mock') {
      return this.createProvider(providerName, providerConfig);
    }

    if (providerName === 'gemini') {
      providerConfig.apiVersion = envConfig.geminiApiVersion;
      providerConfig.model = envConfig.geminiModel;
      providerConfig.fallbackProvider = this._createFallbackProvider(envConfig, providerName);
    }

    if (providerName === 'openrouter') {
      providerConfig.model = envConfig.openrouterModel;
    }

    return this.createProvider(providerName, providerConfig);
  }

  static _createFallbackProvider(envConfig, primaryProviderName) {
    const fallbackProviderName = (envConfig.fallbackLlmProvider || (primaryProviderName === 'gemini' ? 'deepseek' : null))?.toLowerCase();
    if (!fallbackProviderName || fallbackProviderName === primaryProviderName) {
      return null;
    }

    const fallbackApiKey = this._getApiKeyForProvider(fallbackProviderName, envConfig);
    if (!fallbackApiKey) {
      return null;
    }

    return this.createProvider(fallbackProviderName, {
      apiKey: fallbackApiKey,
      timeoutMs: envConfig.requestTimeoutMs,
      maxRetries: 1,
      retryDelayMs: 1000
    });
  }

  static _getApiKeyForProvider(providerName, envConfig) {
    const keyMap = {
      deepseek: envConfig.deepseekApiKey,
      gemini: envConfig.geminiApiKey,
      openai: envConfig.openaiApiKey,
      anthropic: envConfig.anthropicApiKey,
      openrouter: envConfig.openrouterApiKey,
      mock: null
    };

    return keyMap[providerName.toLowerCase()];
  }
}

module.exports = LLMProviderFactory;
