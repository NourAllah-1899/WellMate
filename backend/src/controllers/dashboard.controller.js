import pool from '../config/db.js';
import { bmiCategory, computeBmi } from '../services/bmi.service.js';

// GET /api/dashboard (protected)
export const getDashboard = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Get user profile
        const [uRows] = await pool.query(
            'SELECT id, username, email, full_name, age, height_cm, weight_kg, bmi FROM users WHERE id = ?',
            [userId]
        );

        if (uRows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const user = uRows[0];
        const bmiValue = user.bmi ?? computeBmi(user.height_cm, user.weight_kg);
        const bmi_status = bmiCategory(bmiValue);

        // Get latest weight goal (safe query)
        let goal = null;
        try {
            const [gRows] = await pool.query(
                'SELECT id, direction, target_weight_kg, gemini_summary, created_at, updated_at FROM weight_goals WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
                [userId]
            );
            goal = gRows[0] || null;
        } catch (err) {
            console.warn('Weight goals query error:', err.message);
            goal = null;
        }

        // Today's calories (safe query)
        let total_calories = 0;
        try {
            const [[row]] = await pool.query(
                'SELECT COALESCE(SUM(estimated_calories), 0) AS total_calories FROM meals WHERE user_id = ? AND DATE(eaten_at) = CURDATE()',
                [userId]
            );
            total_calories = row?.total_calories || 0;
        } catch (err) {
            console.warn('Meals query error:', err.message);
            total_calories = 0;
        }

        // This week's average calories (safe query)
        let weekly_avg = 0;
        try {
            const [[row]] = await pool.query(
                'SELECT COALESCE(ROUND(AVG(daily_calories), 0), 0) AS weekly_avg FROM (SELECT DATE(eaten_at) as meal_date, SUM(estimated_calories) as daily_calories FROM meals WHERE user_id = ? AND eaten_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(eaten_at)) AS weekly',
                [userId]
            );
            weekly_avg = row?.weekly_avg || 0;
        } catch (err) {
            console.warn('Weekly average query error:', err.message);
            weekly_avg = 0;
        }

        // This week's meals count (safe query)
        let meals_this_week = 0;
        try {
            const [[row]] = await pool.query(
                'SELECT COUNT(*) AS meals_this_week FROM meals WHERE user_id = ? AND eaten_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)',
                [userId]
            );
            meals_this_week = row?.meals_this_week || 0;
        } catch (err) {
            console.warn('Meals count query error:', err.message);
            meals_this_week = 0;
        }

        // Weight progression (last 30 days) - safe query
        let weightProgress = [];
        try {
            const [rows] = await pool.query(
                'SELECT recorded_date, weight_kg FROM health_logs WHERE user_id = ? AND recorded_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) ORDER BY recorded_date ASC',
                [userId]
            );
            weightProgress = rows || [];
        } catch (err) {
            console.warn('Weight progression query error:', err.message);
            weightProgress = [];
        }

        // Health events this week - safe query
        let healthEvents = [];
        try {
            const [rows] = await pool.query(
                'SELECT id, event_type, description, recorded_at FROM health_events WHERE user_id = ? AND recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY recorded_at DESC LIMIT 5',
                [userId]
            );
            healthEvents = rows || [];
        } catch (err) {
            console.warn('Health events query error:', err.message);
            healthEvents = [];
        }



        res.json({
            success: true,
            dashboard: {
                user: {
                    id: user.id,
                    username: user.username,
                    full_name: user.full_name,
                    age: user.age,
                    height_cm: user.height_cm,
                    weight_kg: user.weight_kg,
                    bmi: bmiValue,
                    bmi_status,
                },
                goal,
                today: {
                    total_calories: Number(total_calories) || 0,
                },
                weekly: {
                    average_calories: Number(weekly_avg) || 0,
                    meals_count: Number(meals_this_week) || 0,
                },
                weightProgress,
                healthEvents,
            },
        });
    } catch (err) {
        console.error('GetDashboard error:', err);
        res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
    }
};
