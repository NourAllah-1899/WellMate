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
  const [badges] = await pool.query('SELECT * FROM badges');
  const earned = [];

  for (const badge of badges) {
    const [[already]] = await pool.query(
      'SELECT 1 FROM user_badges WHERE user_id = ? AND badge_id = ?',
      [userId, badge.id]
    );
    if (already) continue;

    let meet = false;

    switch (badge.criteria_type) {
      case 'smoke_free_days': {
        // Fetch all smoke-free log dates in the last daysNeeded days
        const daysNeeded = badge.criteria_value;
        const [rows] = await pool.query(
          'SELECT DISTINCT DATE(log_date) as d FROM smoking_logs WHERE user_id = ? AND cigarettes_count = 0 AND log_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)',
          [userId, daysNeeded]
        );
        const smokeFreeSet = new Set(rows.map(r => new Date(r.d).toISOString().split('T')[0]));
        // Count consecutive smoke-free days ending today
        let consecutive = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < daysNeeded; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          if (smokeFreeSet.has(key)) {
            consecutive++;
          } else {
            break;
          }
        }
        meet = consecutive >= daysNeeded;
        break;
      }
      case 'sport_sessions': {
        const required = badge.criteria_value;
        const [[row]] = await pool.query(
          'SELECT COUNT(*) as cnt FROM physical_activities WHERE user_id = ? AND activity_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)',
          [userId]
        );
        meet = row.cnt >= required;
        break;
      }
      case 'first_event': {
        const [[row]] = await pool.query(
          'SELECT COUNT(*) as cnt FROM event_participants WHERE user_id = ?',
          [userId]
        );
        meet = row.cnt >= 1;
        break;
      }
      case 'hydration_hero': {
        // Check if user has ever logged >= 8 glasses in a single day
        const [[row]] = await pool.query(
          'SELECT MAX(glasses_count) as max_glasses FROM water_logs WHERE user_id = ?',
          [userId]
        );
        meet = (row.max_glasses || 0) >= badge.criteria_value;
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
  return earned;
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
        UNION ALL SELECT log_date FROM water_logs WHERE user_id = ?
     ) AS all_dates ORDER BY log_date DESC`,
    [userId, userId, userId, userId, userId]
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
