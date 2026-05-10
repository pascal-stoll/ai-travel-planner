/**
 * LLM Provider Factory
 * Creates and configures LLM providers based on environment settings.
 * Enables seamless switching between different LLM vendors.
 */

const DeepSeekProvider = require('./llm/deepseek.provider');
const OpenAIProvider = require('./llm/openai.provider');
const AnthropicProvider = require('./llm/anthropic.provider');
const AppError = require('../utils/AppError');

class LLMProviderFactory {
  static createProvider(providerName, config = {}) {
    const providers = {
      deepseek: DeepSeekProvider,
      openai: OpenAIProvider,
      anthropic: AnthropicProvider
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

    return this.createProvider(providerName, providerConfig);
  }

  static _getApiKeyForProvider(providerName, envConfig) {
    const keyMap = {
      deepseek: envConfig.deepseekApiKey,
      openai: envConfig.openaiApiKey,
      anthropic: envConfig.anthropicApiKey
    };

    return keyMap[providerName.toLowerCase()];
  }
}

module.exports = LLMProviderFactory;