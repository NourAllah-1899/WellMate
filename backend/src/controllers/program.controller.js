import pool from '../config/db.js'

export const generateSportProgram = async (req, res) => {
  try {
    const userId = req.user.user_id

    // Get user profile and recent activities
    const userQuery = `
      SELECT age, weight_kg, height_cm, bmi FROM users WHERE id = ?
    `
    const [users] = await pool.execute(userQuery, [userId])
    const user = users[0]

    const activitiesQuery = `
      SELECT activity_type, SUM(duration_minutes) as total_minutes, COUNT(*) as count
      FROM physical_activities
      WHERE user_id = ? AND activity_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY activity_type
      ORDER BY count DESC
    `
    const [activities] = await pool.execute(activitiesQuery, [userId])

    // Determine difficulty level based on user activity
    let difficultyLevel = 'beginner'
    const totalActivities = activities.reduce((sum, a) => sum + a.count, 0)

    if (totalActivities > 15) {
      difficultyLevel = 'advanced'
    } else if (totalActivities > 8) {
      difficultyLevel = 'intermediate'
    }

    // Generate program based on profile
    const program = generateProgramContent(user, difficultyLevel, activities)

    // Save program to database
    const insertQuery = `
      INSERT INTO sport_programs (user_id, program_name, difficulty_level, target_objective, weekly_sessions, session_duration_minutes, exercises, recommendations, start_date, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), TRUE)
    `

    const [result] = await pool.execute(insertQuery, [
      userId,
      program.name,
      difficultyLevel,
      program.objective,
      program.weeklySessions,
      program.sessionDuration,
      JSON.stringify(program.exercises),
      JSON.stringify(program.recommendations),
    ])

    res.status(201).json({
      message: 'Sport program generated successfully',
      program: {
        id: result.insertId,
        ...program,
        difficultyLevel,
      },
    })
  } catch (err) {
    console.error('Error generating sport program:', err)
    res.status(500).json({ message: 'Failed to generate sport program' })
  }
}

export const getActiveSportProgram = async (req, res) => {
  try {
    const userId = req.user.user_id

    const query = `
      SELECT id, program_name, difficulty_level, target_objective, weekly_sessions, session_duration_minutes, exercises, recommendations, start_date
      FROM sport_programs
      WHERE user_id = ? AND is_active = TRUE
      ORDER BY start_date DESC
      LIMIT 1
    `

    const [programs] = await pool.execute(query, [userId])
    const program = programs[0]

    if (!program) {
      return res.status(404).json({ message: 'No active sport program found' })
    }

    // Parse JSON fields
    program.exercises = JSON.parse(program.exercises || '[]')
    program.recommendations = JSON.parse(program.recommendations || '[]')

    res.json({ program })
  } catch (err) {
    console.error('Error fetching sport program:', err)
    res.status(500).json({ message: 'Failed to fetch sport program' })
  }
}

export const getAllSportPrograms = async (req, res) => {
  try {
    const userId = req.user.user_id

    const query = `
      SELECT id, program_name, difficulty_level, target_objective, weekly_sessions, start_date, is_active
      FROM sport_programs
      WHERE user_id = ?
      ORDER BY start_date DESC
    `

    const [programs] = await pool.execute(query, [userId])

    res.json({ programs })
  } catch (err) {
    console.error('Error fetching sport programs:', err)
    res.status(500).json({ message: 'Failed to fetch sport programs' })
  }
}

export const deactivateSportProgram = async (req, res) => {
  try {
    const userId = req.user.user_id
    const { programId } = req.params

    const query = `
      UPDATE sport_programs
      SET is_active = FALSE
      WHERE id = ? AND user_id = ?
    `

    const [result] = await pool.execute(query, [programId, userId])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Program not found' })
    }

    res.json({ message: 'Sport program deactivated' })
  } catch (err) {
    console.error('Error deactivating program:', err)
    res.status(500).json({ message: 'Failed to deactivate program' })
  }
}

// Helper function to generate program content
function generateProgramContent(user, difficulty, activities) {
  const programs = {
    beginner: {
      name: 'Fitness Basics - Beginner',
      objective: 'Build a solid fitness foundation',
      weeklySessions: 3,
      sessionDuration: 30,
      exercises: [
        { day: 'Monday', activities: ['Warm-up (5min)', 'Walking (20min)', 'Stretching (5min)'] },
        { day: 'Wednesday', activities: ['Warm-up (5min)', 'Light cardio (20min)', 'Stretching (5min)'] },
        { day: 'Friday', activities: ['Warm-up (5min)', 'Yoga/Pilates (20min)', 'Stretching (5min)'] },
      ],
      recommendations: [
        'Start with low-intensity exercises',
        'Focus on consistency rather than intensity',
        'Increase intensity gradually',
        'Stay hydrated and take rest days',
        'Consider working with a trainer',
      ],
    },
    intermediate: {
      name: 'Fitness Plus - Intermediate',
      objective: 'Improve endurance and strength',
      weeklySessions: 4,
      sessionDuration: 45,
      exercises: [
        { day: 'Monday', activities: ['Warm-up (5min)', 'Running (25min)', 'Strength (10min)', 'Cool down (5min)'] },
        { day: 'Tuesday', activities: ['Yoga/Flexibility (30min)'] },
        { day: 'Thursday', activities: ['Warm-up (5min)', 'Cycling (25min)', 'Core work (10min)', 'Cool down (5min)'] },
        { day: 'Saturday', activities: ['Cross-training (45min)', 'Stretching (10min)'] },
      ],
      recommendations: [
        'Mix cardio and strength training',
        'Build to 150 minutes moderate cardio weekly',
        'Include 2 days of strength training',
        'Monitor progress weekly',
        'Adjust intensity based on performance',
      ],
    },
    advanced: {
      name: 'Pro Athlete Program - Advanced',
      objective: 'Maximize performance and endurance',
      weeklySessions: 6,
      sessionDuration: 60,
      exercises: [
        { day: 'Monday', activities: ['Warm-up (5min)', 'HIIT Training (30min)', 'Strength (20min)', 'Recovery (5min)'] },
        { day: 'Tuesday', activities: ['Long run (45min)', 'Stretching (15min)'] },
        { day: 'Wednesday', activities: ['Strength training (45min)', 'Core work (15min)'] },
        { day: 'Thursday', activities: ['Speed work (30min)', 'Agility drills (20min)', 'Recovery (10min)'] },
        { day: 'Friday', activities: ['Cross-training (45min)', 'Flexibility (15min)'] },
        { day: 'Saturday', activities: ['Long training session (60min)'] },
      ],
      recommendations: [
        'Monitor heart rate zones during training',
        'Plan deload weeks every 4 weeks',
        'Work on sport-specific skills',
        'Track performance metrics',
        'Consider professional coaching',
        'Prioritize recovery and nutrition',
      ],
    },
  }

  return programs[difficulty] || programs.beginner
}
