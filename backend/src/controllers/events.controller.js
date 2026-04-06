import pool from '../config/db.js';

// GET /api/events  — with optional filters
export const getEvents = async (req, res) => {
    try {
        const { category, location, date_from, date_to } = req.query;

        let sql = `
            SELECT 
                e.*,
                COUNT(DISTINCT ep.id) AS participant_count
            FROM events e
            LEFT JOIN event_participants ep ON e.id = ep.event_id
        `;
        const params = [];
        const conditions = [];

        if (category) {
            conditions.push('e.category = ?');
            params.push(category);
        }
        if (location) {
            conditions.push('e.location LIKE ?');
            params.push(`%${location}%`);
        }
        if (date_from) {
            conditions.push('e.event_date >= ?');
            params.push(date_from);
        }
        if (date_to) {
            conditions.push('e.event_date <= ?');
            params.push(date_to);
        }

        if (conditions.length) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' GROUP BY e.id ORDER BY e.event_date ASC, e.event_time ASC';

        const [events] = await pool.query(sql, params);

        // If user is logged in, figure out which events they joined
        let joinedEventIds = new Set();
        if (req.user) {
            const [joined] = await pool.query(
                'SELECT event_id FROM event_participants WHERE participant_name = ?',
                [req.user.username]
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

// POST /api/events  — requires auth
export const postEvent = async (req, res) => {
    const { title, category, event_date, event_time, location, latitude, longitude, description } = req.body;

    if (!title || !category || !event_date || !event_time || !location) {
        return res.status(400).json({ success: false, message: 'Title, category, date, time and location are required.' });
    }

    const poster_name = req.user.username;

    try {
        const [result] = await pool.query(
            `INSERT INTO events (title, category, event_date, event_time, location, latitude, longitude, poster_name, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, category, event_date, event_time, location, latitude || null, longitude || null, poster_name, description || null]
        );

        const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, message: 'Event posted!', event: { ...rows[0], participant_count: 0, hasJoined: false } });
    } catch (err) {
        console.error('PostEvent error:', err);
        res.status(500).json({ success: false, message: 'Failed to post event.' });
    }
};

// POST /api/events/:id/join  — requires auth
export const joinEvent = async (req, res) => {
    const eventId = parseInt(req.params.id);
    const participant_name = req.user.username;

    if (!eventId) {
        return res.status(400).json({ success: false, message: 'Invalid event ID.' });
    }

    try {
        // Check event exists
        const [evRows] = await pool.query('SELECT id, poster_name FROM events WHERE id = ?', [eventId]);
        if (evRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        // Prevent joining own event
        if (evRows[0].poster_name === participant_name) {
            return res.status(400).json({ success: false, message: 'You cannot join your own event.' });
        }

        // Check already joined
        const [existing] = await pool.query(
            'SELECT id FROM event_participants WHERE event_id = ? AND participant_name = ?',
            [eventId, participant_name]
        );
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'You have already joined this event.' });
        }

        await pool.query(
            'INSERT INTO event_participants (event_id, participant_name) VALUES (?, ?)',
            [eventId, participant_name]
        );

        // Return updated participant count
        const [[{ count }]] = await pool.query(
            'SELECT COUNT(*) as count FROM event_participants WHERE event_id = ?',
            [eventId]
        );

        res.json({ success: true, message: 'Successfully joined the event!', participant_count: count });
    } catch (err) {
        console.error('JoinEvent error:', err);
        res.status(500).json({ success: false, message: 'Failed to join event.' });
    }
};
