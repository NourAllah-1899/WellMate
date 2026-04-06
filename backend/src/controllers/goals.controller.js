import pool from '../config/db.js';
import { bmiCategory, computeBmi } from '../services/bmi.service.js';
import { openaiGenerateJson } from '../services/openai.service.js';

const BMI_RECOMMENDATION_SYSTEM = `You are a health assistant.
Return ONLY valid JSON. No markdown. No explanations outside JSON.

JSON schema:
{
  "bmi": number,
  "bmiCategory": "Underweight|Normal weight|Overweight|Obesity Class I|Obesity Class II|Obesity Class III",
  "explanation": string,
  "direction": "lose|gain|maintain",
  "suggestedTargetWeightKg": number,
  "suggestedTimeframeWeeks": number,
  "notes": string
}

Rules:
- Keep explanation short (1-3 sentences).
- suggestedTargetWeightKg must be realistic for a human adult.
- suggestedTimeframeWeeks should be between 4 and 52.
`;

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const validateRecommendation = (rec, fallback) => {
    if (!rec || typeof rec !== 'object') return fallback;

    const allowedCategories = new Set([
        'Underweight',
        'Normal weight',
        'Overweight',
        'Obesity Class I',
        'Obesity Class II',
        'Obesity Class III',
    ]);
    const allowedDirections = new Set(['lose', 'gain', 'maintain']);

    const out = { ...fallback };

    if (Number.isFinite(Number(rec.bmi))) out.bmi = Number(rec.bmi);
    if (allowedCategories.has(rec.bmiCategory)) out.bmiCategory = rec.bmiCategory;
    if (typeof rec.explanation === 'string' && rec.explanation.trim()) out.explanation = rec.explanation.trim();
    if (allowedDirections.has(rec.direction)) out.direction = rec.direction;

    const target = Number(rec.suggestedTargetWeightKg);
    if (Number.isFinite(target)) out.suggestedTargetWeightKg = clamp(target, 30, 250);

    const weeks = Number(rec.suggestedTimeframeWeeks);
    if (Number.isFinite(weeks)) out.suggestedTimeframeWeeks = Math.round(clamp(weeks, 4, 52));

    if (typeof rec.notes === 'string') out.notes = rec.notes.trim();
    return out;
};

// GET /api/goals/active (protected)
export const getActiveGoal = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const [rows] = await pool.query(
            'SELECT id, direction, target_weight_kg, gemini_summary, created_at, updated_at FROM weight_goals WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
        );
        res.json({ success: true, goal: rows[0] || null });
    } catch (err) {
        console.error('GetActiveGoal error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch goal.' });
    }
};

// POST /api/goals/recommendation (protected) — Gemini
export const getGoalRecommendation = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [rows] = await pool.query(
            'SELECT id, full_name, age, height_cm, weight_kg, bmi FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const u = rows[0];
        const bmi = u.bmi ?? computeBmi(u.height_cm, u.weight_kg);
        const category = bmiCategory(bmi);

        if (!bmi || !category) {
            return res.status(400).json({
                success: false,
                message: 'Profile data incomplete. Please set height and weight in your profile first.',
            });
        }

        const userPrompt = `User profile:
- name: ${u.full_name || 'N/A'}
- age: ${u.age || 'N/A'}
- height_cm: ${u.height_cm || 'N/A'}
- weight_kg: ${u.weight_kg || 'N/A'}
- bmi: ${bmi}
- bmi_category_by_system: ${category}

Task:
1) Explain the BMI category.
2) Recommend direction (lose/gain/maintain).
3) Suggest a target weight objective and timeframe.

Return JSON only following the schema.`;

        const fallback = {
            bmi,
            bmiCategory: category,
            explanation: '',
            direction: category === 'Underweight' ? 'gain' : (category === 'Normal weight' ? 'maintain' : 'lose'),
            suggestedTargetWeightKg: Number(u.weight_kg) || 0,
            suggestedTimeframeWeeks: 12,
            notes: '',
        };

        const recRaw = await openaiGenerateJson({
            systemInstruction: BMI_RECOMMENDATION_SYSTEM,
            userPrompt,
        }).catch((err) => {
            console.error("OpenAI API threw an error, using fallback. Error:", err.message);
            return null;
        });

        const recommendation = validateRecommendation(recRaw, fallback);

        res.json({ success: true, recommendation });
    } catch (err) {
        console.error('GoalRecommendation error:', err);
        res.status(err.status || 500).json({ success: false, message: err.message || 'Failed to get recommendation.' });
    }
};

// POST /api/goals (protected)
export const createGoal = async (req, res) => {
    const { direction, targetWeightKg, geminiSummary } = req.body;

    if (!direction || !['lose', 'gain', 'maintain'].includes(direction)) {
        return res.status(400).json({ success: false, message: 'direction must be lose, gain, or maintain.' });
    }

    const target = Number(targetWeightKg);
    if (!Number.isFinite(target) || target <= 0 || target > 500) {
        return res.status(400).json({ success: false, message: 'targetWeightKg must be a valid number.' });
    }

    try {
        const userId = req.user.user_id;
        const [result] = await pool.query(
            'INSERT INTO weight_goals (user_id, direction, target_weight_kg, gemini_summary) VALUES (?, ?, ?, ?)',
            [userId, direction, target, geminiSummary || null]
        );

        const [rows] = await pool.query(
            'SELECT id, direction, target_weight_kg, gemini_summary, created_at, updated_at FROM weight_goals WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({ success: true, message: 'Goal saved.', goal: rows[0] });
    } catch (err) {
        console.error('CreateGoal error:', err);
        res.status(500).json({ success: false, message: 'Failed to save goal.' });
    }
};
