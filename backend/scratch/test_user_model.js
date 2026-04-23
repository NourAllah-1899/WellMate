import 'dotenv/config';
import { getOpenAIClient } from '../src/services/openai.service.js';

async function test() {
    const model = 'google/gemini-2.0-flash-lite-preview-02-05:free';
    const client = getOpenAIClient();
    
    try {
        console.log(`Testing user model: ${model}...`);
        const response = await client.chat.completions.create({
            model,
            messages: [{ role: 'user', content: 'Say hello' }],
            max_tokens: 10
        });
        console.log(`SUCCESS! Response:`, response.choices[0].message.content);
    } catch (error) {
        console.error(`FAILURE:`, error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

test();
