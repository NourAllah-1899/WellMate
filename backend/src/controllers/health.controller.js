import pool from '../config/db.js';
import { openaiGenerateJson } from '../services/openai.service.js';

/**
 * @desc    Get nutrition summary (calorie goal vs consumed today)
 * @route   GET /api/health/nutrition-summary
 * @access  Private
 */
export const getNutritionSummary = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // 1. Get user calorie goal and type
        const [[user]] = await pool.query(
            'SELECT calorie_goal, goal_type FROM users WHERE id = ?',
            [userId]
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const calorieGoal = user.calorie_goal || 0;
        const goalType = user.goal_type || null;

        // 2. Get calories consumed today
        const [[calorieRow]] = await pool.query(
            'SELECT COALESCE(SUM(estimated_calories), 0) AS total_calories FROM meals WHERE user_id = ? AND DATE(eaten_at) = CURDATE()',
            [userId]
        );
        const caloriesConsumedToday = Number(calorieRow?.total_calories) || 0;

        // 3. Calculate remaining and percentage
        const caloriesRemaining = calorieGoal > 0 ? Math.max(0, calorieGoal - caloriesConsumedToday) : 0;
        const progressPercentage = calorieGoal > 0 ? Math.min(100, Math.round((caloriesConsumedToday / calorieGoal) * 100)) : 0;

        res.json({
            success: true,
            summary: {
                calorieGoal,
                goalType,
                caloriesConsumedToday,
                caloriesRemaining,
                progressPercentage
            }
        });
    } catch (err) {
        console.error('[getNutritionSummary] error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch nutrition summary.' });
    }
};

/**
 * @desc    Log smoking activity
 * @route   POST /api/health/smoking
 * @access  Private
 */
export const logSmoking = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { cigarettesCount } = req.body;

        if (cigarettesCount === undefined) {
            return res.status(400).json({ success: false, message: 'Cigarettes count is required' });
        }

        const query = `
            INSERT INTO smoking_logs (user_id, cigarettes_count, log_date)
            VALUES (?, ?, CURDATE())
            ON DUPLICATE KEY UPDATE cigarettes_count = cigarettes_count + ?
        `;

        await pool.execute(query, [userId, cigarettesCount, cigarettesCount]);

        res.status(201).json({
            success: true,
            message: 'Smoking log recorded successfully',
            log: { cigarettesCount }
        });
    } catch (err) {
        console.error('[logSmoking] error:', err);
        res.status(500).json({ success: false, message: 'Failed to log smoking data.' });
    }
};

/**
 * @desc    Get smoking stats (daily, weekly, monthly)
 * @route   GET /api/health/smoking/stats
 * @access  Private
 */
export const getSmokingStats = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Today
        const [[todayRow]] = await pool.query(
            'SELECT cigarettes_count FROM smoking_logs WHERE user_id = ? AND log_date = CURDATE()',
            [userId]
        );
        const today = todayRow?.cigarettes_count || 0;

        // Yesterday (for comparison)
        const [[yesterdayRow]] = await pool.query(
            'SELECT cigarettes_count FROM smoking_logs WHERE user_id = ? AND log_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)',
            [userId]
        );
        const yesterday = yesterdayRow?.cigarettes_count || 0;

        // Weekly
        const [[weeklyRow]] = await pool.query(
            'SELECT SUM(cigarettes_count) as total FROM smoking_logs WHERE user_id = ? AND log_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)',
            [userId]
        );
        const weekly = weeklyRow?.total || 0;

        // Monthly
        const [[monthlyRow]] = await pool.query(
            'SELECT SUM(cigarettes_count) as total FROM smoking_logs WHERE user_id = ? AND log_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)',
            [userId]
        );
        const monthly = monthlyRow?.total || 0;

        res.json({
            success: true,
            stats: {
                today,
                yesterday,
                weekly,
                monthly,
                trend: (yesterday > 0 && today > yesterday) ? 'increase' : (today < yesterday) ? 'decrease' : 'stable'
            }
        });
    } catch (err) {
        console.error('[getSmokingStats] error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch smoking stats.' });
    }
};

/**
 * @desc    Log daily water intake
 * @route   POST /api/health/water
 * @access  Private
 */
export const logWater = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { glassesCount } = req.body;

        if (glassesCount === undefined || glassesCount < 0) {
            return res.status(400).json({ success: false, message: 'Invalid glasses count' });
        }

        await pool.query(
            `INSERT INTO water_logs (user_id, glasses_count, log_date) 
             VALUES (?, ?, CURDATE())
             ON DUPLICATE KEY UPDATE glasses_count = ?`,
            [userId, glassesCount, glassesCount]
        );

        res.json({ success: true, message: 'Water intake logged' });
    } catch (err) {
        console.error('[logWater] error:', err);
        res.status(500).json({ success: false, message: 'Failed to log water intake.' });
    }
};

/**
 * @desc    Get water intake stats
 * @route   GET /api/health/water/stats
 * @access  Private
 */
export const getWaterStats = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const [[today]] = await pool.query(
            'SELECT glasses_count FROM water_logs WHERE user_id = ? AND log_date = CURDATE()',
            [userId]
        );

        res.json({
            success: true,
            stats: {
                today: today?.glasses_count || 0
            }
        });
    } catch (err) {
        console.error('[getWaterStats] error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch water stats.' });
    }
};

/**
 * @desc    Generate Intelligent Health Report using AI
 * @route   POST /api/health/generate-report
 * @access  Private
 */
export const generateAIReport = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { type = 'daily', language = 'fr' } = req.body; // daily, weekly, monthly

        // 1. Fetch Basic User Data
        const [[user]] = await pool.query('SELECT username, full_name, age, weight_kg, height_cm, bmi, calorie_goal, goal_type FROM users WHERE id = ?', [userId]);
        const userName = user.full_name || user.username || 'Utilisateur';

        let userData = {
            name: userName,
            goal: user.goal_type,
            calorieGoal: user.calorie_goal,
        };

        if (type === 'weekly') {
            // --- WEEKLY ANALYSIS LOGIC ---
            // Current Week (since last Monday)
            const [currentWeekMeals] = await pool.query(
                'SELECT COALESCE(SUM(estimated_calories), 0) as total, COUNT(DISTINCT DATE(eaten_at)) as days FROM meals WHERE user_id = ? AND eaten_at >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)',
                [userId]
            );
            const [currentWeekSmoking] = await pool.query(
                'SELECT COALESCE(SUM(cigarettes_count), 0) as total FROM smoking_logs WHERE user_id = ? AND log_date >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)',
                [userId]
            );
            const [currentWeekActivity] = await pool.query(
                'SELECT COUNT(*) as count, SUM(duration_minutes) as mins FROM physical_activities WHERE user_id = ? AND activity_date >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)',
                [userId]
            );

            // Previous Week (Full 7 days before last Monday)
            const [prevWeekMeals] = await pool.query(
                'SELECT COALESCE(SUM(estimated_calories), 0) as total FROM meals WHERE user_id = ? AND eaten_at >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY) AND eaten_at < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)',
                [userId]
            );
            const [prevWeekSmoking] = await pool.query(
                'SELECT COALESCE(SUM(cigarettes_count), 0) as total FROM smoking_logs WHERE user_id = ? AND log_date >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY) AND log_date < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)',
                [userId]
            );

            const activeDays = currentWeekMeals[0]?.days || 0;
            
            userData = {
                ...userData,
                currentWeek: {
                    totalCalories: currentWeekMeals[0]?.total || 0,
                    avgCalories: activeDays > 0 ? (currentWeekMeals[0]?.total / activeDays).toFixed(0) : 0,
                    totalSmoking: currentWeekSmoking[0]?.total || 0,
                    avgSmoking: activeDays > 0 ? (currentWeekSmoking[0]?.total / activeDays).toFixed(1) : 0,
                    activityCount: currentWeekActivity[0]?.count || 0,
                    activityMins: currentWeekActivity[0]?.mins || 0,
                },
                previousWeek: {
                    totalCalories: prevWeekMeals[0]?.total || 0,
                    totalSmoking: prevWeekSmoking[0]?.total || 0,
                },
                daysTrackedThisWeek: activeDays
            };
        } else {
            // --- DAILY ANALYSIS LOGIC ---
            const [[calToday]] = await pool.query('SELECT COALESCE(SUM(estimated_calories), 0) as total FROM meals WHERE user_id = ? AND DATE(eaten_at) = CURDATE()', [userId]);
            const [recentMeals] = await pool.query('SELECT description FROM meals WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) LIMIT 5', [userId]);
            const [[activityToday]] = await pool.query('SELECT COUNT(*) as count, SUM(duration_minutes) as mins FROM physical_activities WHERE user_id = ? AND activity_date = CURDATE()', [userId]);
            const [[smokingToday]] = await pool.query('SELECT cigarettes_count FROM smoking_logs WHERE user_id = ? AND log_date = CURDATE()', [userId]);
            const [[smokingYesterday]] = await pool.query('SELECT cigarettes_count FROM smoking_logs WHERE user_id = ? AND log_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)', [userId]);

            userData = {
                ...userData,
                caloriesConsumed: calToday.total,
                meals: recentMeals.map(m => m.description),
                activityCount: activityToday.count,
                activityMinutes: activityToday.mins || 0,
                smokingToday: smokingToday?.cigarettes_count || 0,
                smokingYesterday: smokingYesterday?.cigarettes_count || 0
            };
        }

        const langName = language === 'fr' ? 'French' : 'English';
        const systemPrompt = `You are a Health Assistant. Generate a ${type} report in ${langName}.
Tone should vary: supportive, strict/angry (if habits are bad), funny, or motivational.
CRITICAL: Include real health facts. Keep it short but impactful.
${type === 'weekly' ? 'Compare CURRENT week stats vs PREVIOUS week. Mention if averages are going up or down.' : 'Analyze: Calories (goal vs actual), Meals, Activity, Smoking.'}
Format your response with Markdown using emojis. Include these sections (translated to ${langName}):
- **📊 ${type === 'weekly' ? 'Weekly Summary' : 'Summary of the Day'}**
- **💡 My Tips** (Actionable tips in bullet points)
- **🎯 Conclusion** (Final motivational or strict thought)
Return ONLY valid JSON with a "report" string field containing the formatted markdown.`;

        const userPrompt = `Analyze this data for ${userName} in ${langName}: ${JSON.stringify(userData)}. 
        Goal is ${user.goal_type}. 
        ${type === 'weekly' ? 'Highlight the difference between current week and previous week totals and averages. If they smoked less this week, celebrate it! If more, be strict.' : 'If smoking > 0, be strict about it. If calories > goal, be motivational or strict depending on gap.'}`;

        // 3. Call AI
        const aiResponse = await openaiGenerateJson({
            systemInstruction: systemPrompt,
            userPrompt: userPrompt
        });

        const reportContent = aiResponse.report || (language === 'fr' ? "Impossible de générer le bilan pour le moment." : "Unable to generate the report at this time.");

        // 4. Cleanup old reports for same period (one daily per day, one weekly per week)
        if (type === 'daily') {
            await pool.query(
                'DELETE FROM health_reports WHERE user_id = ? AND report_type = "daily" AND DATE(generated_at) = CURDATE()',
                [userId]
            );
        } else if (type === 'weekly') {
            await pool.query(
                'DELETE FROM health_reports WHERE user_id = ? AND report_type = "weekly" AND generated_at >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)',
                [userId]
            );
        }

        // 5. Save report to DB
        await pool.query(
            'INSERT INTO health_reports (user_id, report_type, content) VALUES (?, ?, ?)',
            [userId, type, reportContent]
        );

        res.json({
            success: true,
            report: reportContent,
            type
        });

    } catch (err) {
        console.error('[generateAIReport] error:', err);
        res.status(500).json({ success: false, message: 'Failed to generate AI report.' });
    }
};

/**
 * @desc    Get latest health reports
 * @route   GET /api/health/reports
 * @access  Private
 */
export const getHealthReports = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // 1. Cleanup reports older than 2 weeks (14 days)
        await pool.query(
            'DELETE FROM health_reports WHERE user_id = ? AND generated_at < DATE_SUB(CURDATE(), INTERVAL 14 DAY)',
            [userId]
        );

        // 2. Fetch latest reports
        const [reports] = await pool.query(
            'SELECT id, report_type, content, generated_at FROM health_reports WHERE user_id = ? ORDER BY generated_at DESC LIMIT 10',
            [userId]
        );
        res.json({ success: true, reports });
    } catch (err) {
        console.error('[getHealthReports] error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch reports.' });
    }
};

/**
 * @desc    Update health goals (calorie goal and type)
 * @route   POST /api/health/update-goal
 * @access  Private
 */
export const updateHealthGoal = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { calorieGoal, goalType } = req.body;

        if (!calorieGoal || !goalType) {
            return res.status(400).json({ success: false, message: 'Calorie goal and type are required' });
        }

        await pool.query(
            'UPDATE users SET calorie_goal = ?, goal_type = ? WHERE id = ?',
            [calorieGoal, goalType, userId]
        );

        res.json({ success: true, message: 'Objectifs mis à jour avec succès.' });
    } catch (err) {
        console.error('[updateHealthGoal] error:', err);
        res.status(500).json({ success: false, message: 'Failed to update health goals.' });
    }
};
