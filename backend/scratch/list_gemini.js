import 'dotenv/config';

async function listGeminiModels() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        
        const data = await response.json();
        if (data.data) {
            const geminiModels = data.data.filter(m => m.id.toLowerCase().includes('gemini'));
            console.log('Gemini Models found:', geminiModels.map(m => m.id));
        } else {
            console.log('Error:', data);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listGeminiModels();
