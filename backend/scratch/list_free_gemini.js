import 'dotenv/config';

async function listFreeGemini() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        
        const data = await response.json();
        if (data.data) {
            const freeGemini = data.data.filter(m => m.id.toLowerCase().includes('gemini') && (m.id.includes(':free') || m.pricing.prompt === "0"));
            console.log('Free Gemini Models found:', freeGemini.map(m => ({ id: m.id, price: m.pricing })));
        } else {
            console.log('Error:', data);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listFreeGemini();
