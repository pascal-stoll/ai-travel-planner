/**
 * Base LLM Provider
 * Abstract interface that all LLM providers must implement.
 * Ensures consistent API across different vendors.
 */

class BaseLLMProvider {
  constructor(config = {}) {
    this.config = {
      timeoutMs: 15000,
      maxRetries: 1,
      retryDelayMs: 1000,
      ...config
    };
  }

  /**
   * Generate a completion from the LLM.
   * @param {string} prompt - The input prompt
   * @returns {Promise<object>} - Standardized response with choices[0].message.content
   */
  async generateCompletion(prompt) {
    throw new Error('generateCompletion() must be implemented by subclass');
  }

  /**
   * Validate that the provider is properly configured.
   * Should throw an error if required config is missing.
   */
  validateConfiguration() {
    throw new Error('validateConfiguration() must be implemented by subclass');
  }
}

module.exports = BaseLLMProvider;
