#!/bin/sh

curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-120b:free",
    "messages": [
      {
        "role": "user",
        "content": "Say hello."
      }
    ]
  }'

echo -e "\n"
curl -X GET http://localhost:3001/api/health
echo -e "\n"

curl -X POST http://localhost:3001/api/generate-itinerary \
  -H "Content-Type: application/json" \
  -d '{
        "destination": {"name": "Tokyo", "country": "Japan"},
        "preferences": {
            "duration": "1 Day",
            "budget": "Budget",
            "interests": ["culture", "food"],
            "travelStyle": "cultural"
        }
    }'