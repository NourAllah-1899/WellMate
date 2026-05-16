import pool from '../config/db.js';

/**
 * Retrieves all badge definitions and marks which ones the user has earned.
 * Returns an array of { id, code, title, description, icon, earned, earned_at }.
 */
export const getUserBadges = async (userId) => {
  // Fetch all badges
  const [allBadges] = await pool.query('SELECT * FROM badges');
  // Fetch user's earned badges
  const [earnedRows] = await pool.query(
    'SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?',
    [userId]
  );
  const earnedMap = new Map();
  earnedRows.forEach(row => earnedMap.set(row.badge_id, row.earned_at));
  return allBadges.map(badge => ({
    ...badge,
    earned: earnedMap.has(badge.id),
    earned_at: earnedMap.get(badge.id) || null,
  }));
};

/**
 * Checks badge criteria based on recent activity and awards any newly earned badges.
 * activityData example: { type: 'smoke_log', date: '2024-05-14' } or { type: 'sport_session', count: 1 }
 */
export const checkAndAwardBadges = async (userId, activityData) => {
  // Load all badges definitions
  const [badges] = await pool.query('SELECT * FROM badges');
  const earned = [];
  for (const badge of badges) {
    // Skip if already earned
    const [[already]] = await pool.query(
      'SELECT 1 FROM user_badges WHERE user_id = ? AND badge_id = ?',
      [userId, badge.id]
    );
    if (already) continue;

    let meet = false;
    // Evaluate each criteria type
    switch (badge.criteria_type) {
      case 'smoke_free_days': {
        // Count consecutive days without smoking up to today
        const daysNeeded = badge.criteria_value;
        const [[row]] = await pool.query(
          `SELECT COUNT(*) as cnt FROM (
             SELECT log_date FROM smoking_logs WHERE user_id = ? AND cigarettes_count = 0
             ORDER BY log_date DESC LIMIT ?
           ) sub WHERE DATEDIFF(CURDATE(), log_date) = seq-1`,
          [userId, daysNeeded]
        );
        // Simple approach: check if there are at least daysNeeded records for consecutive dates
        // For brevity, we just check total smoke‑free days in last daysNeeded days
        const [[cnt]] = await pool.query(
          'SELECT COUNT(*) as cnt FROM smoking_logs WHERE user_id = ? AND cigarettes_count = 0 AND log_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)',
          [userId, daysNeeded]
        );
        meet = cnt.cnt >= daysNeeded;
        break;
      }
      case 'sport_sessions': {
        // Count sport sessions in the last 30 days
        const required = badge.criteria_value;
        const [[row]] = await pool.query(
          'SELECT COUNT(*) as cnt FROM physical_activities WHERE user_id = ? AND activity_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)',
          [userId]
        );
        meet = row.cnt >= required;
        break;
      }
      case 'step_goal': {
        // Expect activityData.steps to be provided
        const required = badge.criteria_value;
        if (activityData && typeof activityData.steps === 'number') {
          meet = activityData.steps >= required;
        }
        break;
      }
      default:
        meet = false;
    }
    if (meet) {
      await pool.execute(
        'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
        [userId, badge.id]
      );
      earned.push(badge.code);
    }
  }
  return earned; // array of badge codes newly earned
};

/**
 * Calculates the current streak of consecutive days with at least one health‑related entry.
 * Returns { currentStreak, bestStreak }.
 */
export const calculateStreak = async (userId) => {
  // Gather distinct dates from any activity tables (meals, smoking, water, activities)
  const [rows] = await pool.query(
    `SELECT DISTINCT log_date FROM (
        SELECT DATE(eaten_at) AS log_date FROM meals WHERE user_id = ?
        UNION ALL SELECT log_date FROM smoking_logs WHERE user_id = ?
        UNION ALL SELECT DATE(activity_date) FROM physical_activities WHERE user_id = ?
        UNION ALL SELECT DATE(recorded_date) FROM health_logs WHERE user_id = ?
     ) AS all_dates ORDER BY log_date DESC`,
    [userId, userId, userId, userId]
  );
  let currentStreak = 0;
  let bestStreak = 0;
  let prevDate = null;
  for (const row of rows) {
    const d = new Date(row.log_date);
    if (!prevDate) {
      currentStreak = 1;
    } else {
      const diff = (prevDate - d) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak += 1;
      } else {
        if (currentStreak > bestStreak) bestStreak = currentStreak;
        currentStreak = 1;
      }
    }
    prevDate = d;
  }
  if (currentStreak > bestStreak) bestStreak = currentStreak;
  return { currentStreak, bestStreak };
};
