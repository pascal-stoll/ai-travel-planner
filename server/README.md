# TravelMind Backend

A robust Node.js/Express API server for TravelMind AI travel planner with enterprise-grade features including multi-LLM support, comprehensive validation, rate limiting, and circuit breaker patterns.

## 🚀 Features

- **Multi-LLM Support**: Seamless switching between DeepSeek, OpenRouter, OpenAI, Gemini, and Anthropic
- **Request Validation**: Joi-based validation with detailed error messages
- **Rate Limiting**: Token bucket algorithm with configurable limits
- **Circuit Breaker**: Automatic failure detection and recovery for external services
- **Retry Strategies**: Exponential backoff with jitter for resilient API calls
- **Schema Validation**: Enhanced validation with quality assessment
- **Error Handling**: Structured error responses with error codes and context

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- API keys for at least one LLM provider

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   npm start          # Production
   npm run dev        # Development with auto-reload
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `FRONTEND_URL` | `http://localhost:4173` | Frontend URL for CORS |
| `AI_PROVIDER` | `openrouter` | Active AI provider (deepseek/gemini/openai/anthropic/openrouter) |
| `REQUEST_TIMEOUT_MS` | `15000` | Request timeout in milliseconds |
| `DEEPSEEK_API_KEY` | - | DeepSeek API key |
| `GEMINI_API_KEY` | - | Google Gemini API key |
| `GEMINI_API_VERSION` | `v1beta` | Gemini API version override |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model name override |
| `FALLBACK_AI_PROVIDER` | `deepseek` | Optional fallback provider when primary LLM fails |
| `OPENAI_API_KEY` | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | - | Anthropic API key |
| `OPENROUTER_API_KEY` | - | OpenRouter API key |
| `OPENROUTER_MODEL` | `gpt-4o-mini` | OpenRouter model name override |

### LLM Provider Configuration

The system supports multiple LLM providers with automatic failover capabilities:

- **DeepSeek**: Cost-effective, fast responses
- **Gemini**: Google's AI model, fast and capable. Requires a valid Gemini API key and may be restricted by geographic or project settings.
- **OpenAI**: High-quality responses, GPT models
- **Anthropic**: Safety-focused, Claude models
- **OpenRouter**: Model router for OpenAI-compatible chat completions

Switch providers by changing `AI_PROVIDER` in your environment. If `AI_PROVIDER=gemini`, the server can optionally fall back to `FALLBACK_AI_PROVIDER=deepseek` for location-model compatibility issues. For OpenRouter, set `AI_PROVIDER=openrouter` and provide `OPENROUTER_API_KEY`.

## 📡 API Reference

### Base URL
```
http://localhost:3001/api
```

### Authentication
Currently no authentication required (for development). Add API key authentication for production use.

### Rate Limiting
- **General endpoints**: 100 requests per 15 minutes
- **AI endpoints**: 10 requests per minute
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Endpoints

#### GET /health
Health check endpoint for monitoring.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "server": "TravelMind Backend",
    "version": "1.0.0",
    "uptime": 123.456
  }
}
```

#### POST /itinerary/generate-itinerary
Generate a complete travel itinerary using AI.

**Request Body:**
```json
{
  "destination": {
    "name": "string",           // 2-100 characters
    "country": "string",        // 1-100 characters
    "coordinates": {            // optional
      "lat": "number",          // -90 to 90
      "lng": "number"           // -180 to 180
    }
  },
  "preferences": {
    "mood": ["Culture", "Food"],
    "duration": "2-3 Days",      // "A few hours" | "1 Day" | "2-3 Days" | "1 Week+"
    "budget": "Mid-Range",      // "Budget" | "Mid-Range" | "Luxury"
    "transport": ["public"],
    "radius": "10km",
    "location": { "label": "Paris", "coords": [48.8566, 2.3522] },
    "accommodation": "hotel",
    "transportation": "public",
    "dietaryRestrictions": ["Vegetarian"],
    "accessibility": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "destination": {
      "name": "Paris",
      "country": "France",
      "coordinates": [48.8566, 2.3522]
    },
    "days": [
      {
        "day": 1,
        "stops": [
          {
            "id": "stop_1",
            "name": "Eiffel Tower",
            "category": "landmark",
            "arrivalTime": "09:00",
            "durationMinutes": 120,
            "description": "Iconic iron lattice tower...",
            "coordinates": [48.8584, 2.2945]
          }
        ]
      }
    ]
  }
}
```

#### POST /ai/suggest-destinations
Get destination suggestions based on preferences.

**Request Body:**
```json
{
  "preferences": {
    "duration": "number",       // 1-30 days
    "budget": "string",         // "budget" | "moderate" | "luxury"
    "interests": ["string"],    // 1-10 items
    "travelStyle": "string"     // "relaxed" | "active" | "cultural" | "adventure"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "destinations": [
      {
        "name": "Barcelona",
        "country": "Spain",
        "rationale": "Vibrant culture with Gaudí architecture...",
        "distance": "1,200 km"
      }
    ]
  }
}
```

#### POST /ai/regen-stop
Regenerate a specific stop in an existing itinerary.

**Request Body:**
```json
{
  "destination": {
    "name": "string",
    "country": "string"
  },
  "dayIndex": "number",        // >= 0
  "stopIndex": "number",       // >= 0
  "existingStops": [           // Array of existing stops
    {
      "name": "string",
      "type": "string",
      "duration": "number",     // 0.5-8 hours
      "description": "string"
    }
  ],
  "preferences": { /* same as generate-itinerary */ }
}
```

### Error Handling

All errors follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { /* error context */ }
  },
  "timestamp": "2026-05-10T14:00:00.000Z",
  "requestId": "uuid"
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Request validation failed
- `SCHEMA_VALIDATION_FAILED` - AI response doesn't match schema
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `CIRCUIT_BREAKER_OPEN` - Service temporarily unavailable
- `LLM_API_ERROR` - External LLM API error

## 🏗️ Architecture

### Project Structure
```
server/
├── src/
│   ├── config/           # Environment and CORS configuration
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Express middleware (validation, rate limiting, etc.)
│   ├── providers/        # LLM provider implementations
│   │   └── llm/         # Base provider and concrete implementations
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   ├── utils/           # Utility functions and error classes
│   ├── validators/      # Request and response validation
│   └── app.js           # Express application setup
├── server.js            # Server entry point
└── package.json
```

### Key Components

#### LLM Provider Abstraction
- `BaseLLMProvider`: Abstract base class defining the interface
- `DeepSeekProvider`: DeepSeek API implementation
- `OpenAIProvider`: OpenAI API implementation (template)
- `AnthropicProvider`: Anthropic API implementation (template)
- `LLMProviderFactory`: Factory for creating provider instances

#### Validation System
- **Request Validation**: Joi schemas for all endpoints
- **Response Validation**: JSON schema validation with quality assessment
- **Error Handling**: Structured errors with context

#### Reliability Features
- **Rate Limiting**: Token bucket algorithm
- **Circuit Breaker**: Failure detection and recovery
- **Retry Logic**: Exponential backoff with jitter

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Generate Test Itinerary
```bash
curl -X POST http://localhost:3001/api/itinerary/generate-itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "destination": {"name": "Tokyo", "country": "Japan"},
    "preferences": {
      "duration": 3,
      "budget": "moderate",
      "interests": ["culture", "food"],
      "travelStyle": "cultural"
    }
  }'
```

### Validation Testing
Try sending invalid requests to test validation:
```bash
# Invalid duration
curl -X POST http://localhost:3001/api/itinerary/generate-itinerary \
  -H "Content-Type: application/json" \
  -d '{"destination":{"name":"Test"},"preferences":{"duration":100}}'
```

## 📊 Monitoring

### Health Checks
- Use `/api/health` for load balancer health checks
- Returns server status, uptime, and version

### Error Monitoring
- All errors include structured context
- Error codes help with categorization
- Request IDs enable tracing

### Performance Monitoring
- Rate limiting headers provide real-time usage info
- Circuit breaker status indicates service health
- Response times are tracked internally

## 🚢 Deployment

### Docker Support
```bash
# Build the image
docker build -t travelmind-backend .

# Run with environment variables
docker run -p 3001:3001 --env-file .env travelmind-backend

# Or use docker-compose
docker-compose up -d
```

### Production Deployment Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure all required environment variables
- [ ] Use a process manager like PM2: `pm2 start server.js --name travelmind-backend`
- [ ] Set up reverse proxy (nginx/Caddy) with SSL
- [ ] Configure log aggregation (Winston, fluentd)
- [ ] Set up monitoring (health checks, error tracking)
- [ ] Configure rate limiting based on your needs
- [ ] Set up backup strategies for logs and configuration

## 🔒 Security Considerations

- **Input Validation**: All inputs are validated before processing
- **Rate Limiting**: Prevents abuse and DoS attacks
- **Error Handling**: No sensitive data exposed in error messages
- **CORS**: Properly configured for frontend communication
- **Timeout Protection**: All external calls have timeouts

## 🤝 Development

### Code Style
- ESLint configuration (if added)
- Consistent error handling patterns
- Comprehensive JSDoc comments
- Modular architecture with dependency injection

### Adding New Features
1. Create feature branch
2. Add validation schemas for new endpoints
3. Implement business logic in services
4. Add route handlers
5. Update documentation
6. Test thoroughly

## 📝 Changelog

### v1.0.0
- Initial release with multi-LLM support
- Comprehensive validation and error handling
- Rate limiting and circuit breaker patterns
- Enterprise-grade reliability features

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review error codes and common issues
3. Check the main project README
4. Create an issue on GitHub

## 📄 License

MIT License - see LICENSE file for details.
