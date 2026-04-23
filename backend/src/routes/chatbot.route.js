import express from 'express';
import { openaiGenerateJson, getOpenAIClient } from '../services/openai.service.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /api/chatbot/message (Protected)
router.post('/message', authenticate, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const systemPrompt = `You are WellMate AI, a friendly but STRICT health assistant.
You respond in English or French.

CRITICAL RULES:
- ONLY answer questions related to: health, BMI, calories, nutrition, physical activity, daily habits, and WellMate app.
- If the user asks about ANYTHING else (sports stars like Messi, politics, etc.), you MUST politely refuse and say you only talk about health.
- NEVER break character.
- Keep responses EXTREMELY SHORT (max 2-3 sentences).
- DO NOT provide "Follow-up questions" or "Solutions" or long paragraphs. 
- Just give the answer directly and stop.

Always match the user's language.`;

  try {
    // Using Ollama
    console.log(`[Chatbot] Calling local Ollama with model: phi3:3.8b`);
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi3:3.8b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        stream: false,
        options: {
          num_predict: 100, // Strictly limit the length of the response
          temperature: 0.4, // Make it less creative and more direct
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ reply: data.message?.content || 'No response from Ollama' });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to get response from chatbot' });
  }
});

export default router;
