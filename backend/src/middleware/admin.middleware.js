import pool from '../config/db.js';

/**
 * Middleware to check if the authenticated user has admin role.
 * Must be used AFTER the authenticate middleware.
 */
export const isAdmin = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (rows[0].role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
        }

        next();
    } catch (err) {
        console.error('[isAdmin] error:', err);
        return res.status(500).json({ success: false, message: 'Server error checking admin privileges.' });
    }
};
