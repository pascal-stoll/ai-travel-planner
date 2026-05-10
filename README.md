# TravelMind AI Travel Planner

A modern, AI-powered travel planning application with a clean React frontend and robust Node.js backend. TravelMind uses multiple LLM providers (DeepSeek, OpenAI, Anthropic) to generate personalized travel itineraries based on user preferences.

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Modular Architecture**: Clean separation of concerns with routes, controllers, services, and providers
- **Multi-LLM Support**: Seamless switching between DeepSeek, OpenAI, and Anthropic
- **Enterprise Features**:
  - Request validation with Joi schemas
  - Rate limiting and circuit breaker patterns
  - Comprehensive error handling
  - Enhanced retry strategies with exponential backoff
  - Schema validation with quality assessment

### Frontend (React/Vite)
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Interactive Features**: Map integration, itinerary visualization, PDF export
- **State Management**: React hooks with local storage persistence

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- API keys for LLM providers (DeepSeek recommended for development)

### Backend Setup

1. **Clone and navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start the backend:**
   ```bash
   npm start          # Production mode
   npm run dev        # Development mode with auto-reload
   ```

### Frontend Setup

1. **Navigate to app directory:**
   ```bash
   cd app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev        # Development mode
   npm run build      # Production build
   npm run preview    # Preview production build
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:4173

# LLM Provider Configuration
LLM_PROVIDER=deepseek  # Options: deepseek, openai, anthropic
REQUEST_TIMEOUT_MS=15000

# API Keys (configure at least one)
DEEPSEEK_API_KEY=your_deepseek_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### LLM Provider Switching

TravelMind supports multiple LLM providers. Switch providers by changing the `LLM_PROVIDER` environment variable:

- `deepseek` - DeepSeek API (recommended for development)
- `openai` - OpenAI GPT models
- `anthropic` - Anthropic Claude models

## 📡 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Health Check
```http
GET /api/health
```

Response:
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

#### Generate Itinerary
```http
POST /api/itinerary/generate-itinerary
```

Request Body:
```json
{
  "destination": {
    "name": "Paris",
    "country": "France"
  },
  "preferences": {
    "duration": 5,
    "budget": "moderate",
    "interests": ["culture", "food", "history"],
    "travelStyle": "cultural",
    "accommodation": "hotel"
  }
}
```

#### Suggest Destinations
```http
POST /api/ai/suggest-destinations
```

Request Body:
```json
{
  "preferences": {
    "duration": 7,
    "budget": "luxury",
    "interests": ["adventure", "nature"],
    "travelStyle": "active"
  }
}
```

#### Regenerate Stop
```http
POST /api/ai/regen-stop
```

Request Body:
```json
{
  "destination": {
    "name": "Tokyo",
    "country": "Japan"
  },
  "dayIndex": 0,
  "stopIndex": 2,
  "existingStops": [...],
  "preferences": {...}
}
```

### Rate Limiting

- **General API**: 100 requests per 15 minutes
- **AI Operations**: 10 requests per minute
- Rate limit headers are included in all responses

### Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {...}
  }
}
```

## 🧪 Testing

### Manual Testing

1. **Health Check:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Generate Itinerary:**
   ```bash
   curl -X POST http://localhost:3001/api/itinerary/generate-itinerary \
     -H "Content-Type: application/json" \
     -d '{"destination":{"name":"Rome","country":"Italy"},"preferences":{"duration":3,"budget":"moderate","interests":["history","food"],"travelStyle":"cultural"}}'
   ```

### Validation Testing

The API includes comprehensive validation:

- **Request Validation**: Joi schemas validate all incoming requests
- **Response Validation**: AI responses are validated against JSON schemas
- **Quality Assessment**: Responses are scored for quality (0-100)

## 🚢 Deployment

### Backend Deployment

1. **Build for production:**
   ```bash
   npm run build  # If you add a build script
   ```

2. **Environment setup:**
   - Set `NODE_ENV=production`
   - Configure all required environment variables
   - Use a process manager like PM2

3. **Start production server:**
   ```bash
   npm start
   ```

### Frontend Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Serve static files:**
   ```bash
   npm run preview  # Or deploy dist/ to a static host
   ```

## 🔒 Security

- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Input Validation**: All requests are validated before processing
- **Error Handling**: Sensitive information is not exposed in errors
- **CORS**: Configured for frontend-backend communication

## 📊 Monitoring

The application includes several monitoring features:

- **Health Checks**: `/api/health` endpoint for load balancer monitoring
- **Error Logging**: Structured error responses with error codes
- **Rate Limit Headers**: Real-time rate limiting information
- **Circuit Breaker Status**: Automatic failure detection and recovery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern JavaScript and AI technology
- Uses multiple LLM providers for robust operation
- Designed for scalability and maintainability