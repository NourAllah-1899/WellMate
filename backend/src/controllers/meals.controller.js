import pool from '../config/db.js';
import { openaiGenerateJson } from '../services/openai.service.js';

const MEAL_ESTIMATE_SYSTEM = `You are a nutrition assistant.
Return ONLY valid JSON. No markdown.

JSON schema:
{
  "totalCalories": number,
  "items": [
    { "name": string, "quantity": string, "calories": number }
  ],
  "assumptions": string
}

Rules:
- totalCalories must be a positive number.
- If uncertain, make reasonable assumptions.
`;

const normalizeMealEstimate = (raw) => {
    const out = {
        totalCalories: 0,
        items: [],
        assumptions: '',
    };

    if (raw && typeof raw === 'object') {
        const total = Number(raw.totalCalories);
        if (Number.isFinite(total) && total > 0) out.totalCalories = Math.round(total);

        if (Array.isArray(raw.items)) {
            out.items = raw.items
                .filter((i) => i && typeof i === 'object')
                .slice(0, 20)
                .map((i) => ({
                    name: String(i.name || '').trim(),
                    quantity: String(i.quantity || '').trim(),
                    calories: Number.isFinite(Number(i.calories)) ? Math.round(Number(i.calories)) : 0,
                }))
                .filter((i) => i.name && i.calories > 0);
        }

        if (typeof raw.assumptions === 'string') out.assumptions = raw.assumptions.trim();
    }

    if (!out.totalCalories) {
        const sum = out.items.reduce((acc, it) => acc + (it.calories || 0), 0);
        out.totalCalories = sum || 0;
    }

    return out;
};

// GET /api/meals/today (protected)
export const getTodayMeals = async (req, res) => {
    try {
        const userId = req.user.user_id;

        let meals = [];
        let total_calories = 0;

        try {
            const [mealRows] = await pool.query(
                'SELECT id, description, estimated_calories, breakdown_json, eaten_at, created_at FROM meals WHERE user_id = ? AND DATE(eaten_at) = CURDATE() ORDER BY eaten_at DESC, id DESC',
                [userId]
            );
            meals = mealRows || [];

            const [[calorieRow]] = await pool.query(
                'SELECT COALESCE(SUM(estimated_calories), 0) AS total_calories FROM meals WHERE user_id = ? AND DATE(eaten_at) = CURDATE()',
                [userId]
            );
            total_calories = Number(calorieRow?.total_calories) || 0;
        } catch (dbErr) {
            console.warn('[getTodayMeals] Database query error:', dbErr.message);
            // Continue with empty results instead of crashing
            meals = [];
            total_calories = 0;
        }

        console.log(`[getTodayMeals] Found ${meals.length} meals for user ${userId}`);
        res.json({ success: true, meals, total_calories });
    } catch (err) {
        console.error('[getTodayMeals] error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch meals.' });
    }
};

// GET /api/meals/history (protected)
export const getMealsHistory = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [mealRows] = await pool.query(
            'SELECT id, description, estimated_calories, breakdown_json, eaten_at, created_at FROM meals WHERE user_id = ? AND eaten_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) ORDER BY eaten_at DESC, id DESC',
            [userId]
        );
        const meals = mealRows || [];

        res.json({ success: true, meals });
    } catch (err) {
        console.error('[getMealsHistory] error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch history.' });
    }
};

// POST /api/meals/estimate (protected) — OpenAI
export const estimateMeal = async (req, res) => {
    const { description } = req.body;

    if (!description || String(description).trim().length < 2) {
        return res.status(400).json({ success: false, message: 'description is required.' });
    }

    try {
        console.log(`[Meal Estimate] Processing: "${description.substring(0, 50)}..."`)
        
        const userPrompt = `Estimate calories for this meal. The user input is natural language.
Meal description: ${String(description).trim()}

Return JSON only following the schema.`;

        let raw;
        try {
            console.log('[Meal Estimate] Calling OpenAI API...');
            raw = await openaiGenerateJson({
                systemInstruction: MEAL_ESTIMATE_SYSTEM,
                userPrompt,
            });
            console.log('[Meal Estimate] OpenAI response received');
        } catch (apiErr) {
            console.error("[Meal Estimate] OpenAI API error:", {
                message: apiErr.message,
                status: apiErr.status,
            });
            return res.status(apiErr.status || 502).json({ 
                success: false, 
                message: `OpenAI service error: ${apiErr.message}. Please provide calories manually.` 
            });
        }

        const estimate = normalizeMealEstimate(raw);
        if (!estimate || !estimate.totalCalories) {
            console.warn('[Meal Estimate] Invalid estimation - no calories calculated');
            return res.status(400).json({ 
                success: false, 
                message: 'Could not estimate calories from your description. Please enter manually.' 
            });
        }

        console.log(`[Meal Estimate] Success: ${estimate.totalCalories} kcal`);
        res.json({ success: true, estimate });
    } catch (err) {
        console.error('[Meal Estimate] Unexpected error:', err);
        res.status(err.status || 500).json({ success: false, message: err.message || 'Failed to estimate meal.' });
    }
};

// POST /api/meals (protected)
export const createMeal = async (req, res) => {
    const { description, estimatedCalories, eatenAt } = req.body;

    if (!description || String(description).trim().length < 2) {
        return res.status(400).json({ success: false, message: 'description is required.' });
    }

    let cals = Number(estimatedCalories);
    let breakdown = null;

    const hasProvidedCalories = Number.isFinite(cals) && cals > 0;

    if (!hasProvidedCalories) {
        // OpenAI estimation path
        try {
            console.log(`[Create Meal] No calories provided, estimating via OpenAI...`);
            
            const userPrompt = `Estimate calories for this meal. The user input is natural language.
Meal description: ${String(description).trim()}

Return JSON only following the schema.`;

            const raw = await openaiGenerateJson({
                systemInstruction: MEAL_ESTIMATE_SYSTEM,
                userPrompt,
            });

            const estimate = normalizeMealEstimate(raw);
            cals = Number(estimate.totalCalories);
            breakdown = estimate;
            
            console.log(`[Create Meal] OpenAI estimated: ${cals} kcal`);
        } catch (apiErr) {
            console.error("[Create Meal] OpenAI API error:", {
                message: apiErr.message,
                status: apiErr.status,
            });
            return res.status(apiErr.status || 502).json({ 
                success: false, 
                message: `Could not estimate calories: ${apiErr.message}. Please provide estimatedCalories in request.` 
            });
        }
    }

    if (!Number.isFinite(cals) || cals <= 0 || cals > 50000) {
        return res.status(400).json({ success: false, message: 'estimated calories must be a valid number between 1 and 50000.' });
    }

    try {
        const userId = req.user.user_id;
        const [result] = await pool.query(
            'INSERT INTO meals (user_id, description, estimated_calories, breakdown_json, eaten_at) VALUES (?, ?, ?, ?, ?)',
            [userId, description.trim(), Math.round(cals), breakdown ? JSON.stringify(breakdown) : null, eatenAt ? new Date(eatenAt) : new Date()]
        );

        const [rows] = await pool.query(
            'SELECT id, description, estimated_calories, breakdown_json, eaten_at, created_at FROM meals WHERE id = ?',
            [result.insertId]
        );

        console.log(`[Create Meal] Meal saved: ID ${result.insertId}`);
        res.status(201).json({ success: true, message: 'Meal saved.', meal: rows[0] });
    } catch (err) {
        console.error('[Create Meal] Database error:', err);
        res.status(500).json({ success: false, message: 'Failed to save meal.' });
    }
};

// PUT /api/meals/:id (protected)
export const updateMeal = async (req, res) => {
    const mealId = req.params.id;
    const { description, estimatedCalories } = req.body;

    if (!description || String(description).trim().length < 2) {
        return res.status(400).json({ success: false, message: 'description is required.' });
    }

    try {
        const userId = req.user.user_id;

        const [existing] = await pool.query('SELECT id, estimated_calories, breakdown_json FROM meals WHERE id = ? AND user_id = ?', [mealId, userId]);
        
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Meal not found or not authorized.' });
        }

        let cals = Number(estimatedCalories);
        let breakdown = existing[0].breakdown_json;

        const hasProvidedCalories = Number.isFinite(cals) && cals > 0;

        if (!hasProvidedCalories) {
            const userPrompt = `Estimate calories for this meal. The user input is natural language.
Meal description: ${String(description).trim()}

Return JSON only following the schema.`;
            try {
                const raw = await openaiGenerateJson({
                    systemInstruction: MEAL_ESTIMATE_SYSTEM,
                    userPrompt,
                });
                const estimate = normalizeMealEstimate(raw);
                cals = Number(estimate.totalCalories);
                breakdown = estimate;
            } catch (err) {
                 console.error("[Update Meal] OpenAI API error:", err);
                 cals = existing[0].estimated_calories;
            }
        } else {
             breakdown = null; 
        }

        await pool.query(
            'UPDATE meals SET description = ?, estimated_calories = ?, breakdown_json = ? WHERE id = ?',
            [description.trim(), Math.round(cals), breakdown ? (typeof breakdown === 'string' ? breakdown : JSON.stringify(breakdown)) : null, mealId]
        );

        const [rows] = await pool.query('SELECT id, description, estimated_calories, breakdown_json, eaten_at, created_at FROM meals WHERE id = ?', [mealId]);

        res.json({ success: true, message: 'Meal updated.', meal: rows[0] });

    } catch (err) {
        console.error('[Update Meal] Database error:', err);
        res.status(500).json({ success: false, message: 'Failed to update meal.' });
    }
};

// DELETE /api/meals/:id (protected)
export const deleteMeal = async (req, res) => {
    const mealId = req.params.id;
    try {
        const userId = req.user.user_id;
        const [result] = await pool.query('DELETE FROM meals WHERE id = ? AND user_id = ?', [mealId, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Meal not found or not authorized.' });
        }
        res.json({ success: true, message: 'Meal deleted.' });
    } catch (err) {
        console.error('[Delete Meal] error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete meal.' });
    }
};
