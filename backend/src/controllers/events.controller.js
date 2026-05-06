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
    const { title, activity_type, date, time, latitude, longitude, description, max_participants } = req.body;

    if (!title || !activity_type || !date || !time || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ success: false, message: 'Title, activity type, date, time, and location are required.' });
    }

    // Validation: Date must be in future
    const eventTimestamp = new Date(`${date}T${time}`);
    if (eventTimestamp < new Date()) {
        return res.status(400).json({ success: false, message: 'Event date and time must be in the future.' });
    }

    // Validation: max_participants must be a positive number if provided
    if (max_participants !== undefined && max_participants !== null && (isNaN(max_participants) || max_participants < 1)) {
        return res.status(400).json({ success: false, message: 'Maximum participants must be a positive number.' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO events (user_id, title, activity_type, description, date, time, latitude, longitude, max_participants)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.user_id, title, activity_type, description || null, date, time, latitude, longitude, max_participants || null]
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
        const [event] = await pool.query('SELECT user_id, date, time, max_participants FROM events WHERE id = ?', [eventId]);
        if (event.length === 0) return res.status(404).json({ success: false, message: 'Event not found.' });
        const eventTimestamp = new Date(`${event[0].date}T${event[0].time}`);
        if (eventTimestamp < new Date()) return res.status(400).json({ success: false, message: 'Cannot join a past event.' });
        
        // Check if event has a capacity limit
        if (event[0].max_participants) {
            const [participants] = await pool.query(
                'SELECT COUNT(*) as count FROM event_participants WHERE event_id = ?',
                [eventId]
            );
            if (participants[0].count >= event[0].max_participants) {
                return res.status(400).json({ success: false, message: 'Event is full. Maximum capacity reached.' });
            }
        }
        
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

        // Joined events (including events created by user if they joined)
        const [joined] = await pool.query(`
            SELECT e.*, ${statusSql} as status, COUNT(ep2.id) as participant_count
            FROM events e
            JOIN event_participants ep ON e.id = ep.event_id
            LEFT JOIN event_participants ep2 ON e.id = ep2.event_id
            WHERE ep.user_id = ?
            GROUP BY e.id
            ORDER BY e.date DESC
        `, [userId]);

        res.json({ success: true, created, joined });
    } catch (err) {
        console.error('GetMyEvents error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch your events.' });
    }
};

// DELETE /api/events/:id
export const deleteEvent = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.user_id;

    try {
        // Check if event exists and user is the creator
        const [event] = await pool.query('SELECT user_id FROM events WHERE id = ?', [eventId]);
        
        if (event.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        if (event[0].user_id !== userId) {
            return res.status(403).json({ success: false, message: 'You can only delete events you created.' });
        }

        // Delete the event (cascades to event_participants)
        await pool.query('DELETE FROM events WHERE id = ?', [eventId]);

        res.json({ success: true, message: 'Event deleted successfully.' });
    } catch (err) {
        console.error('DeleteEvent error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete event.' });
    }
};

// PUT /api/events/:id
export const updateEvent = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.user_id;

    const { title, activity_type, date, time, description, max_participants } = req.body;

    const hasAny =
        title !== undefined ||
        activity_type !== undefined ||
        date !== undefined ||
        time !== undefined ||
        description !== undefined ||
        max_participants !== undefined;

    if (!hasAny) {
        return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    // Validation: max_participants must be a positive number if provided
    if (max_participants !== undefined && max_participants !== null && (isNaN(max_participants) || max_participants < 1)) {
        return res.status(400).json({ success: false, message: 'Maximum participants must be a positive number.' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id, user_id, date, time FROM events WHERE id = ?',
            [eventId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        if (rows[0].user_id !== userId) {
            return res.status(403).json({ success: false, message: 'You can only edit events you created.' });
        }

        const nextDate = date !== undefined ? date : rows[0].date;
        const nextTime = time !== undefined ? time : rows[0].time;

        if (nextDate && nextTime) {
            const eventTimestamp = new Date(`${nextDate}T${String(nextTime).substring(0, 5)}`);
            if (eventTimestamp < new Date()) {
                return res.status(400).json({ success: false, message: 'Event date and time must be in the future.' });
            }
        }

        await pool.query(
            `UPDATE events
             SET title = COALESCE(?, title),
                 activity_type = COALESCE(?, activity_type),
                 date = COALESCE(?, date),
                 time = COALESCE(?, time),
                 description = COALESCE(?, description),
                 max_participants = COALESCE(?, max_participants)
             WHERE id = ?`,
            [
                title ?? null,
                activity_type ?? null,
                date ?? null,
                time ?? null,
                description ?? null,
                max_participants ?? null,
                eventId,
            ]
        );

        const [updated] = await pool.query(
            'SELECT * FROM events WHERE id = ?',
            [eventId]
        );

        res.json({ success: true, message: 'Event updated successfully.', event: updated[0] });
    } catch (err) {
        console.error('UpdateEvent error:', err);
        res.status(500).json({ success: false, message: 'Failed to update event.' });
    }
};

