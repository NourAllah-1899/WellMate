const DEFAULT_MODELS = [
    process.env.GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-pro-latest"
].filter(Boolean);

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
        throw new Error('Gemini response was not valid JSON.');
    }
};

export const geminiGenerateJson = async ({ systemInstruction, userPrompt }) => {
    if (!process.env.GEMINI_API_KEY) {
        const err = new Error('GEMINI_API_KEY is missing in backend environment.');
        err.status = 500;
        throw err;
    }

    const body = {
        contents: [
            {
                role: 'user',
                parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }],
            },
        ],
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 512,
        },
    };

    let lastErr = null;

    for (const model of DEFAULT_MODELS) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!resp.ok) {
            const txt = await resp.text().catch(() => '');
            const msg = txt || resp.statusText;

            // Retry other models if this one mapping is invalid or not found
            if (resp.status === 404 || resp.status === 400) {
                lastErr = new Error(`Gemini model not supported (${model}). ${msg}`);
                continue;
            }

            const err = new Error(`Gemini API error (${resp.status}) using model ${model}: ${msg}`);
            err.status = 502;
            throw err;
        }

        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = extractJson(text);
        return parsed;
    }

    const err = lastErr || new Error('Gemini API error: no supported model worked.');
    err.status = 502;
    throw err;
};
