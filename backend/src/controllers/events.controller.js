import pool from '../config/db.js';

// Helper to get status SQL snippet
const statusSql = `
    CASE 
        WHEN TIMESTAMP(e.date, e.time) < NOW() - INTERVAL 2 HOUR THEN 'Finished'
        WHEN TIMESTAMP(e.date, e.time) BETWEEN NOW() - INTERVAL 2 HOUR AND NOW() THEN 'Ongoing'
        ELSE 'Upcoming'
    END
`;

// GET /api/events
export const getEvents = async (req, res) => {
    try {
        const { activity_type } = req.query;

        let sql = `
            SELECT 
                e.*,
                COALESCE(u.full_name, u.username) as creator_name,
                ${statusSql} as status,
                COUNT(DISTINCT ep.id) AS participant_count
            FROM events e
            JOIN users u ON e.user_id = u.id
            LEFT JOIN event_participants ep ON e.id = ep.event_id
        `;
        const params = [];
        const conditions = [];

        if (activity_type) {
            conditions.push('e.activity_type = ?');
            params.push(activity_type);
        }

        // Filter out finished events by default if not specified? 
        // User said "Auto-expire Events: Past events are marked as finished or hidden"
        // I'll show them but marked as finished.

        if (conditions.length) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' GROUP BY e.id, u.full_name, u.username ORDER BY e.date ASC, e.time ASC';

        const [events] = await pool.query(sql, params);

        // If user is logged in, figure out which events they joined
        let joinedEventIds = new Set();
        if (req.user) {
            const [joined] = await pool.query(
                'SELECT event_id FROM event_participants WHERE user_id = ?',
                [req.user.user_id]
            );
            joinedEventIds = new Set(joined.map((r) => r.event_id));
        }

        const enriched = events.map((e) => ({
            ...e,
            hasJoined: joinedEventIds.has(e.id),
        }));

        res.json({ success: true, events: enriched });
    } catch (err) {
        console.error('GetEvents error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch events.' });
    }
};

// GET /api/events/:id
export const getEventDetails = async (req, res) => {
    const eventId = req.params.id;
    try {
        const [rows] = await pool.query(`
            SELECT 
                e.*,
                COALESCE(u.full_name, u.username) as creator_name,
                ${statusSql} as status,
                COUNT(DISTINCT ep.id) AS participant_count
            FROM events e
            JOIN users u ON e.user_id = u.id
            LEFT JOIN event_participants ep ON e.id = ep.event_id
            WHERE e.id = ?
            GROUP BY e.id, u.full_name, u.username
        `, [eventId]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        let hasJoined = false;
        if (req.user) {
            const [joined] = await pool.query(
                'SELECT id FROM event_participants WHERE event_id = ? AND user_id = ?',
                [eventId, req.user.user_id]
            );
            hasJoined = joined.length > 0;
        }

        res.json({ success: true, event: { ...rows[0], hasJoined } });
    } catch (err) {
        console.error('GetEventDetails error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch event details.' });
    }
};

// POST /api/events
export const postEvent = async (req, res) => {
    const { title, activity_type, date, time, latitude, longitude, description } = req.body;

    if (!title || !activity_type || !date || !time || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ success: false, message: 'Title, activity type, date, time, and location are required.' });
    }

    // Validation: Date must be in future
    const eventTimestamp = new Date(`${date}T${time}`);
    if (eventTimestamp < new Date()) {
        return res.status(400).json({ success: false, message: 'Event date and time must be in the future.' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO events (user_id, title, activity_type, description, date, time, latitude, longitude)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.user_id, title, activity_type, description || null, date, time, latitude, longitude]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Event created successfully!', 
            eventId: result.insertId 
        });
    } catch (err) {
        console.error('PostEvent error:', err);
        res.status(500).json({ success: false, message: 'Failed to create event.' });
    }
};

export const joinEvent = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.user_id;
    try {
        const [event] = await pool.query('SELECT user_id, date, time FROM events WHERE id = ?', [eventId]);
        if (event.length === 0) return res.status(404).json({ success: false, message: 'Event not found.' });
        const eventTimestamp = new Date(`${event[0].date}T${event[0].time}`);
        if (eventTimestamp < new Date()) return res.status(400).json({ success: false, message: 'Cannot join a past event.' });
        await pool.query('INSERT IGNORE INTO event_participants (event_id, user_id) VALUES (?, ?)', [eventId, userId]);
        res.json({ success: true, message: 'Joined event!' });
    } catch (err) {
        console.error('JoinEvent error:', err);
        res.status(500).json({ success: false, message: 'Failed to join event.' });
    }
};

// DELETE /api/events/:id/join
export const leaveEvent = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.user_id;

    try {
        await pool.query(
            'DELETE FROM event_participants WHERE event_id = ? AND user_id = ?',
            [eventId, userId]
        );
        res.json({ success: true, message: 'Successfully left the event.' });
    } catch (err) {
        console.error('LeaveEvent error:', err);
        res.status(500).json({ success: false, message: 'Failed to leave event.' });
    }
};

// GET /api/events/me/all
export const getMyEvents = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Created events
        const [created] = await pool.query(`
            SELECT e.*, ${statusSql} as status, COUNT(ep.id) as participant_count
            FROM events e
            LEFT JOIN event_participants ep ON e.id = ep.event_id
            WHERE e.user_id = ?
            GROUP BY e.id
            ORDER BY e.date DESC
        `, [userId]);

        // Joined events
        const [joined] = await pool.query(`
            SELECT e.*, ${statusSql} as status, COUNT(ep2.id) as participant_count
            FROM events e
            JOIN event_participants ep ON e.id = ep.event_id
            LEFT JOIN event_participants ep2 ON e.id = ep2.event_id
            WHERE ep.user_id = ? AND e.user_id != ?
            GROUP BY e.id
            ORDER BY e.date DESC
        `, [userId, userId]);

        res.json({ success: true, created, joined });
    } catch (err) {
        console.error('GetMyEvents error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch your events.' });
    }
};

