/**
 * Gemini LLM Provider
 * Implementation for Google Gemini API integration.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const BaseLLMProvider = require('./base.provider');
const AppError = require('../../utils/AppError');
const { withRetry, retryConfigs } = require('../../utils/retry');
const logger = require('../../config/logger');

class GeminiProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-1.5-flash';
    this.apiVersion = config.apiVersion || 'v1beta';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 4000;
    this.fallbackProvider = config.fallbackProvider || null;
    this.genAI = null;
    this.generativeModel = null;
  }

  validateConfiguration() {
    if (!this.apiKey) {
      throw new AppError('GEMINI_API_KEY is not configured', {
        status: 500,
        code: 'CONFIGURATION_ERROR'
      });
    }
  }

  async generateCompletion(prompt) {
    this.validateConfiguration();
    const start = Date.now();
    console.log('[GEMINI] generateCompletion called, prompt length:', prompt.length);

    return withRetry(
      () => this._callGeminiAPI(prompt),
      retryConfigs.llm,
      { provider: 'gemini', operation: 'generateCompletion' }
    ).then(result => {
      console.log(`[GEMINI] generateCompletion completed in ${Date.now() - start}ms`);
      return result;
    }).catch(error => {
      console.error(`[GEMINI] generateCompletion failed after ${Date.now() - start}ms:`, error.message);
      const fallback = this._getFallbackCandidate(error);
      if (fallback && this.fallbackProvider) {
        console.warn('[GEMINI] Falling back to alternative provider:', this.fallbackProvider.constructor.name);
        return this.fallbackProvider.generateCompletion(prompt);
      }
      throw error;
    });
  }

  async _callGeminiAPI(prompt) {
    console.log('[GEMINI] Making API call to Gemini...');
    try {
      // Initialize the client if not already done
      if (!this.genAI) {
        console.log('[GEMINI] Initializing GoogleGenerativeAI client');
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.generativeModel = this.genAI.getGenerativeModel({ model: this.model });
      }

      const result = await Promise.race([
        this.generativeModel.generateContent(prompt, { apiVersion: this.apiVersion }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gemini API request timed out')), this.config.timeoutMs || 15000)
        )
      ]);
      console.log('[GEMINI] API call successful');
      const response = result.response;
      const text = response.text();
      console.log('[GEMINI] Response text length:', text.length);

      // Gemini returns plain text, but our system expects OpenAI-style response format
      // We need to wrap it in the expected structure
      return {
        choices: [{
          message: {
            content: text
          }
        }]
      };
    } catch (error) {
      console.error('[GEMINI] API call failed:', error);
      logger.error('Gemini API error:', error);

      const lowerMessage = String(error.message || '').toLowerCase();
      if (lowerMessage.includes('timed out')) {
        throw new AppError('Gemini API request timed out', {
          status: 504,
          code: 'GEMINI_TIMEOUT'
        });
      }

      if (lowerMessage.includes('user location is not supported')) {
        throw new AppError('Gemini is unavailable in the current location or project configuration. Please verify your Gemini API key, enabled services, and region restrictions.', {
          status: 502,
          code: 'GEMINI_LOCATION_UNSUPPORTED',
          errorContext: { apiStatus: error.status, apiMessage: error.message }
        });
      }

      if (lowerMessage.includes('not found for api version') || lowerMessage.includes('is not found')) {
        throw new AppError('Gemini model is unavailable for the configured API version or account. Check GEMINI_API_VERSION, GEMINI_MODEL, and GEMINI_API_KEY.', {
          status: 502,
          code: 'GEMINI_MODEL_UNAVAILABLE',
          errorContext: { apiStatus: error.status, apiMessage: error.message }
        });
      }

      if (error.status) {
        throw new AppError(`Gemini API error: ${error.status}`, {
          status: 502,
          code: 'GEMINI_API_ERROR',
          errorContext: { apiStatus: error.status, apiMessage: error.message }
        });
      }

      throw new AppError(error.message || 'Gemini request failed', {
        status: 502,
        code: 'GEMINI_REQUEST_FAILED',
        cause: error
      });
    }
  }

  _getFallbackCandidate(error) {
    const rootError = error.cause || error;
    const message = String(rootError.message || '').toLowerCase();
    const code = rootError.code || error.code || '';

    return [
      'GEMINI_LOCATION_UNSUPPORTED',
      'GEMINI_MODEL_UNAVAILABLE',
      'GEMINI_API_ERROR'
    ].includes(code) ||
      message.includes('user location is not supported') ||
      message.includes('is not found for api version');
  }
}

module.exports = GeminiProvider;