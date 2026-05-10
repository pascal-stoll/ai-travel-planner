/**
 * DeepSeek LLM Provider
 * Implementation for DeepSeek API integration with enhanced retry logic.
 */

const axios = require('axios');
const BaseLLMProvider = require('./base.provider');
const AppError = require('../../utils/AppError');
const { withRetry, retryConfigs } = require('../../utils/retry');
const logger = require('../../config/logger');

class DeepSeekProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseURL = 'https://api.deepseek.com/v1';
    this.model = config.model || 'deepseek-chat';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 4000;
  }

  validateConfiguration() {
    if (!this.apiKey) {
      throw new AppError('DEEPSEEK_API_KEY is not configured', {
        status: 500,
        code: 'CONFIGURATION_ERROR'
      });
    }
  }

  async generateCompletion(prompt) {
    this.validateConfiguration();

    return withRetry(
      () => this._callDeepSeekAPI(prompt),
      retryConfigs.llm,
      { provider: 'deepseek', operation: 'generateCompletion' }
    );
  }

  async _callDeepSeekAPI(prompt) {
    const response = await axios.post(
      `${this.baseURL}/chat/completions`,
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

    const content = response.data.choices?.[0]?.message?.content;

    // Check for malformed responses and attempt recovery
    if (this._isMalformedResponse(content)) {
      logger.warn('DeepSeek returned malformed response, attempting recovery');
      const extracted = this._extractJsonFromMalformed(content);

      if (extracted) {
        return {
          ...response.data,
          choices: [{
            ...response.data.choices[0],
            message: {
              ...response.data.choices[0].message,
              content: JSON.stringify(extracted)
            }
          }]
        };
      }

      throw new AppError('AI returned malformed JSON that could not be recovered', {
        status: 422,
        code: 'MALFORMED_RESPONSE_IRRECOVERABLE',
        errorContext: { originalContent: content }
      });
    }

    return response.data;
  }

  _isMalformedResponse(content) {
    if (typeof content !== 'string') {
      return true;
    }

    const patterns = [
      /```json[\s\S]*?```/,
      /```[\s\S]*?```/,
      /^['"].*['"]$/,
      /^\[.*\]$/,
      /^[^{]/,
      /[^}]$/
    ];

    return patterns.some((p) => p.test(content.trim()));
  }

  _extractJsonFromMalformed(text) {
    let cleaned = text.replace(/```json\s*\n?/, '').replace(/```\n?/, '');
    const match = cleaned.match(/\{[\s\S]*\}/);
    
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }

    try {
      return JSON.parse(cleaned.trim());
    } catch {
      return null;
    }
  }
}

module.exports = DeepSeekProvider;
