const BaseLLMProvider = require('./base.provider');
const { buildMockResponse } = require('./mockData');

class MockProvider extends BaseLLMProvider {
  validateConfiguration() {
    return true;
  }

  async generateCompletion(prompt) {
    const response = buildMockResponse(prompt);

    return {
      choices: [
        {
          message: {
            content: JSON.stringify(response),
          },
        },
      ],
    };
  }
}

module.exports = MockProvider;
