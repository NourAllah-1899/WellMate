import pool from '../config/db.js'

export const recordActivity = async (req, res) => {
  try {
    const userId = req.user.user_id
    const { activityType, description, durationMinutes, intensity, activityDate } = req.body

    if (!activityType || !durationMinutes || !intensity || !activityDate) {
      return res.status(400).json({
        message: 'Missing required fields: activityType, durationMinutes, intensity, activityDate',
      })
    }

    const caloriesBurned = calculateCalories(activityType, durationMinutes, intensity)

    const query = `
      INSERT INTO physical_activities (user_id, activity_type, description, duration_minutes, intensity, calories_burned, activity_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    const [result] = await pool.execute(query, [
      userId,
      activityType,
      description || null,
      durationMinutes,
      intensity,
      caloriesBurned,
      activityDate,
    ])

    res.status(201).json({
      message: 'Activity recorded successfully',
      activity: {
        id: result.insertId,
        activityType,
        durationMinutes,
        intensity,
        caloriesBurned,
        activityDate,
      },
    })
  } catch (err) {
    console.error('Error recording activity:', err)
    res.status(500).json({ message: 'Failed to record activity' })
  }
}

export const getActivitiesToday = async (req, res) => {
  try {
    const userId = req.user.user_id
    const today = new Date().toISOString().split('T')[0]

    const query = `
      SELECT id, activity_type, description, duration_minutes, intensity, calories_burned, activity_date
      FROM physical_activities
      WHERE user_id = ? AND activity_date = ?
      ORDER BY created_at DESC
    `

    const [activities] = await pool.execute(query, [userId, today])

    const totalCalories = activities.reduce((sum, a) => sum + (a.calories_burned || 0), 0)

    res.json({
      activities,
      totalCalories,
    })
  } catch (err) {
    console.error('Error fetching activities:', err)
    res.status(500).json({ message: 'Failed to fetch activities' })
  }
}

export const getActivitiesRange = async (req, res) => {
  try {
    const userId = req.user.user_id
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' })
    }

    const query = `
      SELECT DATE(activity_date) as date, activity_type, SUM(duration_minutes) as total_duration, SUM(calories_burned) as total_calories, COUNT(*) as count
      FROM physical_activities
      WHERE user_id = ? AND activity_date BETWEEN ? AND ?
      GROUP BY DATE(activity_date), activity_type
      ORDER BY activity_date DESC
    `

    const [stats] = await pool.execute(query, [userId, startDate, endDate])

    res.json({ stats })
  } catch (err) {
    console.error('Error fetching activity stats:', err)
    res.status(500).json({ message: 'Failed to fetch activity statistics' })
  }
}

export const deleteActivity = async (req, res) => {
  try {
    const userId = req.user.user_id
    const { activityId } = req.params

    const query = 'DELETE FROM physical_activities WHERE id = ? AND user_id = ?'
    const [result] = await pool.execute(query, [activityId, userId])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Activity not found' })
    }

    res.json({ message: 'Activity deleted successfully' })
  } catch (err) {
    console.error('Error deleting activity:', err)
    res.status(500).json({ message: 'Failed to delete activity' })
  }
}

// Utility function to calculate calories burned
function calculateCalories(activityType, durationMinutes, intensity) {
  const baseCaloriesByActivity = {
    'running': { low: 8, medium: 11, high: 15 },
    'walking': { low: 3, medium: 5, high: 7 },
    'cycling': { low: 6, medium: 9, high: 12 },
    'swimming': { low: 7, medium: 10, high: 14 },
    'gym': { low: 5, medium: 8, high: 11 },
    'yoga': { low: 3, medium: 4, high: 6 },
    'football': { low: 9, medium: 12, high: 15 },
    'basketball': { low: 8, medium: 11, high: 14 },
    'tennis': { low: 7, medium: 10, high: 13 },
    'boxing': { low: 10, medium: 13, high: 16 },
    'hiit': { low: 12, medium: 15, high: 18 },
    'pilates': { low: 4, medium: 6, high: 8 },
  }

  const caloriesPerMinute = baseCaloriesByActivity[activityType.toLowerCase()]?.[intensity] || 5
  return Math.round(caloriesPerMinute * durationMinutes)
}
