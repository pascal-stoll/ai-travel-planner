/**
 * OpenAI LLM Provider
 * Implementation for OpenAI API integration.
 * Currently a template - ready for implementation.
 */

const axios = require('axios');
const BaseLLMProvider = require('./base.provider');
const AppError = require('../../utils/AppError');

class OpenAIProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseURL = 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-4';
  }

  validateConfiguration() {
    if (!this.apiKey) {
      throw new AppError('OPENAI_API_KEY is not configured', {
        status: 500,
        code: 'CONFIGURATION_ERROR'
      });
    }
  }

  async generateCompletion(prompt) {
    this.validateConfiguration();
    
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.config.timeoutMs
        }
      );

      return response.data;
    } catch (error) {
      if (error.response?.status) {
        throw new AppError(`OpenAI API error: ${error.response.status}`, {
          status: 502,
          code: 'LLM_API_ERROR',
          errorContext: { apiStatus: error.response.status }
        });
      }

      throw new AppError(error.message || 'OpenAI request failed', {
        status: 502,
        code: 'LLM_REQUEST_FAILED'
      });
    }
  }
}

module.exports = OpenAIProvider;
