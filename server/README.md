# TravelMind Backend

Node.js/Express server for TravelMind AI travel planner.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with your API keys:
   ```
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   PORT=3001
   ```

3. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /api/generate-itinerary` - Generate travel itinerary using AI
- `GET /api/health` - Health check endpoint