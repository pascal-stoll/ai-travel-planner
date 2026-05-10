const axios = require('axios');
const logger = require('../../config/logger');
const AppError = require('../../utils/AppError');

const validateApiKey = (apiKey) => {
  if (!apiKey) {
    throw new AppError('DEEPSEEK_API_KEY environment variable is not configured', {
      status: 500,
      code: 'CONFIGURATION_ERROR'
    });
  }
};

const handleDeepSeekError = (error) => {
  if (error.code === 'MALFORMED_RESPONSE_FINAL') {
    return error;
  }

  const status = error.response?.status || 502;
  return new AppError(error.message || 'DeepSeek request failed', {
    status,
    code: 'DEEPSEEK_API_ERROR',
    errorContext: { originalError: error.message }
  });
};

const extractJsonFromMalformed = (text) => {
  let cleaned = text.replace(/```json\s*\n?/, '').replace(/```\n?/, '');
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }

  try {
    return JSON.parse(cleaned.trim());
  } catch {
    return null;
  }
};

const isMalformedResponse = (jsonString) => {
  if (typeof jsonString !== 'string') {
    return true;
  }

  const malformedPatterns = [
    /```json[\s\S]*?```/,
    /```[\s\S]*?```/,
    /^['"].*['"]$/,
    /^\[.*\]$/,
    /^[^{]/,
    /[^}]$/
  ];

  return malformedPatterns.some((pattern) => pattern.test(jsonString.trim()));
};

const callDeepSeekAPI = async ({ prompt, apiKey, timeoutMs = 15000, maxRetries = 1, retryDelayMs = 1000 }) => {
  validateApiKey(apiKey);

  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: timeoutMs
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    if (isMalformedResponse(content)) {
      logger.warn('Malformed DeepSeek response detected');
      const extracted = extractJsonFromMalformed(content);
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

      if (maxRetries > 0) {
        logger.info('Retrying DeepSeek API after malformed response');
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        return callDeepSeekAPI({ prompt, apiKey, timeoutMs, maxRetries: maxRetries - 1, retryDelayMs });
      }

      throw new AppError('AI returned malformed JSON and could not recover', {
        status: 422,
        code: 'MALFORMED_RESPONSE_FINAL',
        errorContext: { originalContent: content }
      });
    }

    return response.data;
  } catch (error) {
    throw handleDeepSeekError(error);
  }
};

module.exports = {
  callDeepSeekAPI
};
