/**
 * Anthropic LLM Provider
 * Implementation for Anthropic Claude API integration.
 * Currently a template - ready for implementation.
 */

const axios = require('axios');
const BaseLLMProvider = require('./base.provider');
const AppError = require('../../utils/AppError');

class AnthropicProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseURL = 'https://api.anthropic.com/v1';
    this.model = config.model || 'claude-3-opus-20240229';
  }

  validateConfiguration() {
    if (!this.apiKey) {
      throw new AppError('ANTHROPIC_API_KEY is not configured', {
        status: 500,
        code: 'CONFIGURATION_ERROR'
      });
    }
  }

  async generateCompletion(prompt) {
    this.validateConfiguration();
    
    try {
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          model: this.model,
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          timeout: this.config.timeoutMs
        }
      );

      // Normalize Anthropic response to match OpenAI/DeepSeek format
      return {
        choices: [{
          message: {
            content: response.data.content?.[0]?.text || ''
          }
        }]
      };
    } catch (error) {
      if (error.response?.status) {
        throw new AppError(`Anthropic API error: ${error.response.status}`, {
          status: 502,
          code: 'LLM_API_ERROR',
          errorContext: { apiStatus: error.response.status }
        });
      }

      throw new AppError(error.message || 'Anthropic request failed', {
        status: 502,
        code: 'LLM_REQUEST_FAILED'
      });
    }
  }
}

module.exports = AnthropicProvider;
