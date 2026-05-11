const BaseLLMProvider = require('./base.provider');
const { buildMockResponse } = require('./mockData');

class MockProvider extends BaseLLMProvider {
  validateConfiguration() {
    return true;
  }

  async generateCompletion(prompt) {
    const payload = buildMockResponse(prompt);
    return {
      choices: [
        {
          message: {
            content: JSON.stringify(payload),
          },
        },
      ],
    };
  }
}

module.exports = MockProvider;
