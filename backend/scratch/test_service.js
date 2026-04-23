import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "WellMate",
    }
});

async function test() {
    try {
        console.log("Testing OpenRouter with exact service config...");
        const model = process.env.OPENAI_MODEL;
        console.log("Model:", model);
        
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: 'Return ONLY JSON. {"test": "ok"}' },
                { role: 'user', content: 'Hello' }
            ],
            temperature: 0.2,
            max_tokens: 512,
        });
        
        console.log("Full Response:", JSON.stringify(response, null, 2));
        const content = response.choices[0]?.message?.content;
        console.log("Content:", content);
        
    } catch (err) {
        console.error("Error Status:", err.status);
        console.error("Error Message:", err.message);
    }
}

test();
