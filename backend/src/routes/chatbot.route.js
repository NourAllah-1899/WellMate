import express from 'express';
import { openaiGenerateJson } from '../services/openai.service.js';
import OpenAI from 'openai';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Helper to get raw text instead of JSON if needed, 
// but we'll use a modified call to our existing service or the client directly.
import { getOpenAIClient } from '../services/openai.service.js';

// POST /api/chatbot/message (Protected)
router.post('/message', authenticate, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const systemPrompt = `You are a health assistant integrated into the WellMate application.
You can respond in English or French depending on the user's language.

You ONLY answer questions about:
- health (santé)
- BMI (IMC)
- calories
- nutrition (alimentation)
- physical activity (activité physique)
- daily habits (habitudes quotidiennes)
- app usage (utilisation de l'application)

If the question is outside this scope, politely refuse in the same language as the user.

Always respond in the same language as the user's question. If the question is in French, respond in French. If in English, respond in English.`;

  try {
    // Option 1: Using the OpenRouter we just set up (Recommended)
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const reply = completion.choices[0]?.message?.content || 'No response from assistant';
    res.json({ reply });

    /* 
    // Option 2: Using Ollama (Original request)
    // Uncomment this and comment the OpenRouter part if you prefer local Ollama
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi3:3.8b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        stream: false
      })
    });
    const data = await response.json();
    res.json({ reply: data.message?.content });
    */

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to get response from chatbot' });
  }
});

export default router;
