/**
 * OpenRouter LLM Provider
 * Implementation for OpenRouter API integration.
 * Uses OpenRouter's chat completions endpoint to generate responses.
 */

const axios = require('axios');
const BaseLLMProvider = require('./base.provider');
const AppError = require('../../utils/AppError');

class OpenRouterProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://openrouter.ai';
    this.model = config.model || 'openrouter/free';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 4000;
  }

  validateConfiguration() {
    if (!this.apiKey) {
      throw new AppError('OPENROUTER_API_KEY is not configured', {
        status: 500,
        code: 'CONFIGURATION_ERROR'
      });
    }
  }

  async generateCompletion(prompt) {
    this.validateConfiguration();

    try {
      const response = await axios.post(
        `${this.baseURL}/v1/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: this.temperature,
          max_tokens: this.maxTokens
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.config.timeoutMs
        }
      );

      const message = response.data?.choices?.[0]?.message;
      const content = typeof message === 'string'
        ? message
        : message?.content || response.data?.generated_text || '';

      return {
        ...response.data,
        choices: [{
          message: {
            content: content || ''
          }
        }]
      };
    } catch (error) {
      if (error.response?.status) {
        throw new AppError(`OpenRouter API error: ${error.response.status}`, {
          status: 502,
          code: 'LLM_API_ERROR',
          errorContext: { apiStatus: error.response.status, apiMessage: error.response?.data }
        });
      }

      throw new AppError(error.message || 'OpenRouter request failed', {
        status: 502,
        code: 'LLM_REQUEST_FAILED'
      });
    }
  }
}

module.exports = OpenRouterProvider;
