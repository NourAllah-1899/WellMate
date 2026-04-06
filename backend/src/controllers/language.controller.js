import pool from '../config/db.js'

export const updateLanguage = async (req, res) => {
  try {
    const userId = req.user.user_id
    const { language } = req.body

    if (!language || !['en', 'fr', 'ar'].includes(language)) {
      return res.status(400).json({ message: 'Invalid language' })
    }

    const query = 'UPDATE users SET language = ? WHERE id = ?'
    await pool.execute(query, [language, userId])

    res.json({ message: 'Language updated successfully', language })
  } catch (err) {
    console.error('Error updating language:', err)
    res.status(500).json({ message: 'Failed to update language' })
  }
}

export const getLanguage = async (req, res) => {
  try {
    const userId = req.user.user_id

    const query = 'SELECT language FROM users WHERE id = ?'
    const [rows] = await pool.execute(query, [userId])
    const user = rows[0]

    res.json({ language: user?.language || 'en' })
  } catch (err) {
    console.error('Error fetching language:', err)
    res.status(500).json({ message: 'Failed to fetch language' })
  }
}
