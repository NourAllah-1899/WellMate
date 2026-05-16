import { getUserBadges, calculateStreak } from '../services/gamification.service.js';

/**
 * GET /api/gamification/badges
 * Returns all badge definitions with earned status for the authenticated user.
 */
export const getBadges = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const badges = await getUserBadges(userId);
    res.json({ success: true, badges });
  } catch (err) {
    console.error('[gamification.getBadges] error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch badges.' });
  }
};

/**
 * GET /api/gamification/streak
 * Returns the current and best streak of consecutive days the user logged any health activity.
 */
export const getStreak = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const streak = await calculateStreak(userId);
    res.json({ success: true, streak });
  } catch (err) {
    console.error('[gamification.getStreak] error:', err);
    res.status(500).json({ success: false, message: 'Failed to calculate streak.' });
  }
};

/**
 * POST /api/gamification/refresh
 * Triggers a badge and streak check manually.
 */
export const refreshGamification = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { activityData } = req.body;
    
    // Call the service function, though it might need importing checkAndAwardBadges
    // Let's import it above in a separate replacement, or just do it here.
    const { checkAndAwardBadges } = await import('../services/gamification.service.js');
    const newlyEarned = await checkAndAwardBadges(userId, activityData || {});
    const streak = await calculateStreak(userId);
    const badges = await getUserBadges(userId);
    
    res.json({ success: true, newlyEarned, streak, badges });
  } catch (err) {
    console.error('[gamification.refreshGamification] error:', err);
    res.status(500).json({ success: false, message: 'Failed to refresh gamification.' });
  }
};
