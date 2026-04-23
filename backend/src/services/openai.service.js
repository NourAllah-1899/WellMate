import OpenAI from 'openai';

// Initialize OpenAI client
let _openai = null;
const getOpenAIClient = () => {
    if (_openai) return _openai;
    
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is missing in .env');
    }

    _openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
        defaultHeaders: {
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "WellMate",
        }
    });
    return _openai;
};

const extractJson = (text) => {
    if (!text) return null;

    const trimmed = String(text).trim();

    // Remove markdown fences if present
    const noFences = trimmed
        .replace(/^```(?:json)?/i, '')
        .replace(/```$/i, '')
        .trim();

    // Try direct parse
    try {
        return JSON.parse(noFences);
    } catch {
        // Try to locate first JSON object substring
        const start = noFences.indexOf('{');
        const end = noFences.lastIndexOf('}');
        if (start >= 0 && end > start) {
            const candidate = noFences.slice(start, end + 1);
            return JSON.parse(candidate);
        }
        throw new Error('OpenAI response was not valid JSON.');
    }
};

/**
 * Generate JSON response from OpenAI API
 * @param {Object} params - Parameters
 * @param {string} params.systemInstruction - System instruction/prompt
 * @param {string} params.userPrompt - User prompt
 * @param {string} params.model - Model to use (default: gpt-4-turbo)
 * @returns {Promise<Object>} Parsed JSON response
 */
export const openaiGenerateJson = async ({ 
    systemInstruction, 
    userPrompt,
    model = process.env.OPENAI_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free',
    maxTokens = 512
}) => {
    console.log(`[AI Service] Using model: ${model}`);
    // Check API key before making request
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('replace-with-your-real')) {
        const err = new Error('OPENAI_API_KEY is not configured. Please set a valid API key in your .env file.');
        err.status = 500;
        throw err;
    }

    const openai = getOpenAIClient();

    try {
        console.log(`[OpenAI] Calling model: ${model}`);
        
        const response = await openai.chat.completions.create({
            model,
            messages: [
                {
                    role: 'system',
                    content: systemInstruction,
                },
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
            temperature: 0.2,
            max_tokens: maxTokens,
            // response_format: { type: 'json_object' }, // Disabled for OpenRouter compatibility with free models
        });

        const text = response.choices[0]?.message?.content;
        console.log(`[OpenAI] Response received: ${text?.substring(0, 100)}...`);
        
        if (!text) {
            throw new Error('OpenAI returned empty response');
        }
        const parsed = extractJson(text);
        return parsed;
    } catch (error) {
        console.error('OpenAI API error details:', {
            message: error.message,
            status: error.status,
            type: error.type,
            code: error.code,
        });
        
        // Handle specific error cases
        if (error.status === 401 || error.message?.includes('401') || error.message?.includes('invalid_api_key')) {
            const err = new Error('OpenAI API key is invalid or expired. Please check your key in .env');
            err.status = 401;
            throw err;
        }
        
        if (error.status === 429 || error.message?.includes('429') || error.message?.includes('rate_limit')) {
            const err = new Error('OpenAI API rate limit exceeded. Please try again later.');
            err.status = 429;
            throw err;
        }

        if (error.message?.includes('not configured') || error.message?.includes('missing')) {
            throw error; // Re-throw our custom error
        }

        if (error.message?.includes('model') || error.message?.includes('does not exist')) {
            const err = new Error(`OpenAI model ${model} is not available. Try 'gpt-4o-mini' or 'gpt-3.5-turbo'`);
            err.status = 400;
            throw err;
        }

        const err = new Error(`OpenAI API error: ${error.message}`);
        err.status = 502;
        throw err;
    }
};
