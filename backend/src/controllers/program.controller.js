import pool from '../config/db.js'
import { openaiGenerateJson } from '../services/openai.service.js'

const SPORT_PROGRAM_SYSTEM = `You are a professional fitness and personal training assistant.
Your goal is to generate a personalized weekly sport program for the user based on their profile, recent activities, and preferences.
Return ONLY valid JSON. No markdown.

JSON schema:
{
  "program_name": string (e.g., "Endurance Builder Pro"),
  "target_objective": string (e.g., "Build endurance and lose weight"),
  "weekly_sessions": number,
  "session_duration_minutes": number,
  "exercises": [
    { "day": string (e.g., "Monday"), "activities": [string, string] }
  ],
  "recommendations": [string, string, ...]
}

Rules:
- Be realistic and progressive.
- Provide days where they rest.
- Provide warmups and cooldowns in the activities list.
- Do NOT wrap JSON in code blocks (\`\`\`json). Return raw JSON.
`

export const generateSportProgram = async (req, res) => {
  try {
    const userId = req.user.user_id
    const { objective, level, sessionsPerWeek } = req.body

    // Get user profile and recent activities
    const userQuery = `
      SELECT age, weight_kg, height_cm, bmi FROM users WHERE id = ?
    `
    const [users] = await pool.execute(userQuery, [userId])
    const user = users[0] || {}

    if (!user.age || !user.weight_kg || !user.height_cm) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez compléter vos informations de profil (âge, poids, taille) dans votre profil avant de générer un programme personnalisé.' 
      });
    }

    const activitiesQuery = `
      SELECT activity_type, SUM(duration_minutes) as total_minutes, COUNT(*) as count
      FROM physical_activities
      WHERE user_id = ? AND activity_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY activity_type
      ORDER BY count DESC
    `
    const [activities] = await pool.execute(activitiesQuery, [userId])

    // Build the prompt
    let userContext = `User Profile:\n`
    if (user.age) userContext += `- Age: ${user.age}\n`
    if (user.weight_kg) userContext += `- Weight: ${user.weight_kg} kg\n`
    if (user.height_cm) userContext += `- Height: ${user.height_cm} cm\n`
    if (user.bmi) userContext += `- BMI: ${user.bmi}\n`

    userContext += `\nRecent physical activities in the last 30 days:\n`
    if (activities.length > 0) {
      activities.forEach(a => {
        userContext += `- ${a.activity_type}: ${a.count} sessions, ${a.total_minutes} total minutes\n`
      })
    } else {
      userContext += `- No recent activities recorded.\n`
    }

    userContext += `\nUser Request:\n`
    userContext += `- Objective: ${objective || 'General fitness'}\n`
    userContext += `- Difficulty Level: ${level || 'Beginner'}\n`
    userContext += `- Desired Sessions Per Week: ${sessionsPerWeek || 3}\n`
    
    userContext += `\nGenerate a weekly program that specifically perfectly fits these requirements.`

    console.log('[Generate Program] Calling OpenAI...')
    const rawProgram = await openaiGenerateJson({
      systemInstruction: SPORT_PROGRAM_SYSTEM,
      userPrompt: userContext,
      maxTokens: 2048,
    })

    // Return the generated program without saving it.
    // Frontend will call /save to actually confirm it.
    const program = {
      ...rawProgram,
      difficulty_level: level || 'beginner'
    }

    console.log('[Generate Program] Success')
    res.status(200).json({
      message: 'Sport program generated successfully',
      program: program,
    })
  } catch (err) {
    console.error('Error generating sport program:', err)
    res.status(err.status || 500).json({ message: err.message || 'Failed to generate sport program' })
  }
}

export const saveSportProgram = async (req, res) => {
  try {
    const userId = req.user.user_id
    const { program } = req.body

    if (!program) {
      return res.status(400).json({ message: 'Missing program in request body' })
    }

    const insertQuery = `
      INSERT INTO sport_programs (user_id, program_name, difficulty_level, target_objective, weekly_sessions, session_duration_minutes, exercises, recommendations, start_date, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), TRUE)
    `

    const [result] = await pool.execute(insertQuery, [
      userId,
      program.program_name || 'Fitness Program',
      program.difficulty_level || 'beginner',
      program.target_objective || '',
      program.weekly_sessions || 3,
      program.session_duration_minutes || 45,
      JSON.stringify(program.exercises || []),
      JSON.stringify(program.recommendations || []),
    ])

    res.status(201).json({
      message: 'Sport program saved successfully',
      program: {
        id: result.insertId,
        ...program
      }
    })
  } catch (err) {
    console.error('Error saving sport program:', err)
    res.status(500).json({ message: 'Failed to save sport program' })
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
