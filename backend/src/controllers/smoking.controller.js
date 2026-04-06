import pool from '../config/db.js'

export const logSmoking = async (req, res) => {
  try {
    const userId = req.user.user_id
    const { cigarettesCount, logDate } = req.body

    if (cigarettesCount === undefined || !logDate) {
      return res.status(400).json({
        message: 'Missing required fields: cigarettesCount, logDate',
      })
    }

    const query = `
      INSERT INTO smoking_logs (user_id, cigarettes_count, log_date)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE cigarettes_count = ?
    `

    await pool.execute(query, [userId, cigarettesCount, logDate, cigarettesCount])

    res.status(201).json({
      message: 'Smoking log recorded successfully',
      log: { cigarettesCount, logDate },
    })
  } catch (err) {
    console.error('Error logging smoking:', err)
    res.status(500).json({ message: 'Failed to log smoking data' })
  }
}

export const getSmokeToday = async (req, res) => {
  try {
    const userId = req.user.user_id
    const today = new Date().toISOString().split('T')[0]

    const query = `
      SELECT id, cigarettes_count, quit_target_date, days_without_smoking, log_date
      FROM smoking_logs
      WHERE user_id = ? AND log_date = ?
    `

    const [logs] = await pool.execute(query, [userId, today])
    const log = logs[0] || null

    res.json({ log })
  } catch (err) {
    console.error('Error fetching smoking log:', err)
    res.status(500).json({ message: 'Failed to fetch smoking data' })
  }
}

export const setSmokeQuitTarget = async (req, res) => {
  try {
    const userId = req.user.user_id
    const { quitTargetDate } = req.body

    if (!quitTargetDate) {
      return res.status(400).json({ message: 'quitTargetDate is required' })
    }

    // Update all smoking logs for this user with the quit target
    const query = `
      UPDATE smoking_logs
      SET quit_target_date = ?
      WHERE user_id = ?
    `

    await pool.execute(query, [quitTargetDate, userId])

    res.json({
      message: 'Quit target date set successfully',
      quitTargetDate,
    })
  } catch (err) {
    console.error('Error setting quit target:', err)
    res.status(500).json({ message: 'Failed to set quit target' })
  }
}

export const getSmokingStats = async (req, res) => {
  try {
    const userId = req.user.user_id
    const { range } = req.query // 'daily', 'weekly', 'monthly'

    let dateFilter = ''
    let groupBy = ''

    if (range === 'weekly') {
      dateFilter = 'AND log_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
      groupBy = 'WEEK(log_date)'
    } else if (range === 'monthly') {
      dateFilter = 'AND log_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)'
      groupBy = 'DATE(log_date)'
    } else {
      dateFilter = 'AND log_date >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)'
      groupBy = 'DATE(log_date)'
    }

    const query = `
      SELECT 
        ${groupBy} as period,
        AVG(cigarettes_count) as avg_cigarettes,
        MIN(cigarettes_count) as min_cigarettes,
        MAX(cigarettes_count) as max_cigarettes,
        SUM(cigarettes_count) as total_cigarettes,
        COUNT(*) as log_days
      FROM smoking_logs
      WHERE user_id = ?
      ${dateFilter}
      GROUP BY ${groupBy}
      ORDER BY log_date DESC
    `

    const [stats] = await pool.execute(query, [userId])

    res.json({ stats, range })
  } catch (err) {
    console.error('Error fetching smoking stats:', err)
    res.status(500).json({ message: 'Failed to fetch smoking statistics' })
  }
}
