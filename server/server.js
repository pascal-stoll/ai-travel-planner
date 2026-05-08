const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// AI API proxy endpoint
app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!process.env.DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    res.json(response.data);
  } catch (error) {
    console.error('AI API Error:', error.message);
    res.status(500).json({
      error: 'Failed to generate itinerary',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`TravelMind backend server running on port ${PORT}`);
});