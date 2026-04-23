import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
});

async function test() {
    try {
        console.log("Testing OpenRouter...");
        console.log("Model:", process.env.OPENAI_MODEL);
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [{ role: 'user', content: 'Hello, respond with {"status": "ok"}' }],
            // response_format: { type: 'json_object' } // Test without this first
        });
        console.log("Response:", JSON.stringify(response, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

test();
