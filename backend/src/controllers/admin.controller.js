import pool from '../config/db.js';



// ═══════════════════════════════════════════════════════════════════════════════

// USER MANAGEMENT

// ═══════════════════════════════════════════════════════════════════════════════



/**

 * @desc    Get all users with pagination, search and filters

 * @route   GET /api/admin/users

 * @access  Admin

 */

export const getAllUsers = async (req, res) => {

    try {

        const { page = 1, limit = 10, search = '', role = '', sort = 'created_at', order = 'DESC' } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);



        // Build WHERE clause

        const conditions = [];

        const params = [];



        if (search) {

            conditions.push('(u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)');

            params.push(`%${search}%`, `%${search}%`, `%${search}%`);

        }



        if (role && ['user', 'admin'].includes(role)) {

            conditions.push('u.role = ?');

            params.push(role);

        }



        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';



        // Whitelist sortable columns

        const allowedSorts = ['created_at', 'username', 'email', 'role'];

        const sortCol = allowedSorts.includes(sort) ? sort : 'created_at';

        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';



        // Count total

        const [countResult] = await pool.query(

            `SELECT COUNT(*) as total FROM users u ${whereClause}`,

            params

        );

        const total = countResult[0].total;



        // Fetch users

        const [users] = await pool.query(

            `SELECT u.id, u.username, u.email, u.full_name, u.age, u.height_cm, u.weight_kg, u.bmi, u.role, u.created_at, u.updated_at

             FROM users u

             ${whereClause}

             ORDER BY u.${sortCol} ${sortOrder}

             LIMIT ? OFFSET ?`,

            [...params, parseInt(limit), offset]

        );



        res.json({

            success: true,

            users,

            pagination: {

                total,

                page: parseInt(page),

                limit: parseInt(limit),

                totalPages: Math.ceil(total / parseInt(limit))

            }

        });

    } catch (err) {

        console.error('[getAllUsers] error:', err);

        res.status(500).json({ success: false, message: 'Failed to fetch users.' });

    }

};



/**

 * @desc    Get a single user by ID with stats

 * @route   GET /api/admin/users/:id

 * @access  Admin

 */

export const getUserById = async (req, res) => {

    try {

        const { id } = req.params;



        const [users] = await pool.query(

            `SELECT id, username, email, full_name, age, height_cm, weight_kg, bmi, role, calorie_goal, goal_type, created_at, updated_at

             FROM users WHERE id = ?`,

            [id]

        );



        if (users.length === 0) {

            return res.status(404).json({ success: false, message: 'User not found.' });

        }



        const user = users[0];



        // Get activity stats

        const [[mealCount]] = await pool.query('SELECT COUNT(*) as count FROM meals WHERE user_id = ?', [id]);

        const [[activityCount]] = await pool.query('SELECT COUNT(*) as count FROM physical_activities WHERE user_id = ?', [id]);

        const [[eventCount]] = await pool.query('SELECT COUNT(*) as count FROM events WHERE user_id = ?', [id]);

        const [[smokingTotal]] = await pool.query('SELECT COALESCE(SUM(cigarettes_count), 0) as total FROM smoking_logs WHERE user_id = ?', [id]);



        res.json({

            success: true,

            user,

            stats: {

                totalMeals: mealCount.count,

                totalActivities: activityCount.count,

                totalEvents: eventCount.count,

                totalCigarettes: smokingTotal.total

            }

        });

    } catch (err) {

        console.error('[getUserById] error:', err);

        res.status(500).json({ success: false, message: 'Failed to fetch user.' });

    }

};



/**

 * @desc    Update a user (admin can change role, profile info)

 * @route   PUT /api/admin/users/:id

 * @access  Admin

 */

export const updateUser = async (req, res) => {

    try {

        const { id } = req.params;

        const { full_name, age, height_cm, weight_kg, role, email } = req.body;



        // Check user exists

        const [existing] = await pool.query('SELECT id, role FROM users WHERE id = ?', [id]);

        if (existing.length === 0) {

            return res.status(404).json({ success: false, message: 'User not found.' });

        }



        // Prevent admin from demoting themselves

        if (parseInt(id) === req.user.user_id && role && role !== 'admin') {

            return res.status(400).json({ success: false, message: 'You cannot remove your own admin role.' });

        }



        // Calculate BMI if height and weight provided

        let bmi = null;

        const heightNum = height_cm !== undefined ? Number(height_cm) : undefined;

        const weightNum = weight_kg !== undefined ? Number(weight_kg) : undefined;

        if (heightNum && weightNum) {

            const heightM = heightNum / 100;

            bmi = Number((weightNum / (heightM * heightM)).toFixed(2));

        }



        await pool.query(

            `UPDATE users SET

                full_name = COALESCE(?, full_name),

                email = COALESCE(?, email),

                age = COALESCE(?, age),

                height_cm = COALESCE(?, height_cm),

                weight_kg = COALESCE(?, weight_kg),

                bmi = COALESCE(?, bmi),

                role = COALESCE(?, role)

             WHERE id = ?`,

            [

                full_name ?? null,

                email ?? null,

                age ?? null,

                height_cm ?? null,

                weight_kg ?? null,

                bmi,

                role ?? null,

                id

            ]

        );



        const [updated] = await pool.query(

            'SELECT id, username, email, full_name, age, height_cm, weight_kg, bmi, role, created_at, updated_at FROM users WHERE id = ?',

            [id]

        );



        res.json({ success: true, message: 'User updated successfully.', user: updated[0] });

    } catch (err) {

        console.error('[updateUser] error:', err);

        res.status(500).json({ success: false, message: 'Failed to update user.' });

    }

};



/**

 * @desc    Delete a user account

 * @route   DELETE /api/admin/users/:id

 * @access  Admin

 */

export const deleteUser = async (req, res) => {

    try {

        const { id } = req.params;



        // Prevent self-deletion

        if (parseInt(id) === req.user.user_id) {

            return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });

        }



        const [existing] = await pool.query('SELECT id, username FROM users WHERE id = ?', [id]);

        if (existing.length === 0) {

            return res.status(404).json({ success: false, message: 'User not found.' });

        }



        await pool.query('DELETE FROM users WHERE id = ?', [id]);



        res.json({ success: true, message: `User "${existing[0].username}" deleted successfully.` });

    } catch (err) {

        console.error('[deleteUser] error:', err);

        res.status(500).json({ success: false, message: 'Failed to delete user.' });

    }

};



/**

 * @desc    Get admin dashboard stats

 * @route   GET /api/admin/stats

 * @access  Admin

 */

export const getAdminStats = async (req, res) => {

    try {

        const [[userCount]] = await pool.query('SELECT COUNT(*) as count FROM users');

        const [[eventCount]] = await pool.query('SELECT COUNT(*) as count FROM events');

        const [[mealCount]] = await pool.query('SELECT COUNT(*) as count FROM meals');

        const [[activityCount]] = await pool.query('SELECT COUNT(*) as count FROM physical_activities');



        // New users this week

        const [[newUsersWeek]] = await pool.query(

            'SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'

        );



        // New events this week

        const [[newEventsWeek]] = await pool.query(

            'SELECT COUNT(*) as count FROM events WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'

        );



        res.json({

            success: true,

            stats: {

                totalUsers: userCount.count,

                totalEvents: eventCount.count,

                totalMeals: mealCount.count,

                totalActivities: activityCount.count,

                newUsersThisWeek: newUsersWeek.count,

                newEventsThisWeek: newEventsWeek.count

            }

        });

    } catch (err) {

        console.error('[getAdminStats] error:', err);

        res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });

    }

};



// ═══════════════════════════════════════════════════════════════════════════════

// EVENT MANAGEMENT

// ═══════════════════════════════════════════════════════════════════════════════



/**

 * @desc    Get all events with pagination, search and filters (admin view)

 * @route   GET /api/admin/events

 * @access  Admin

 */

export const getAllEvents = async (req, res) => {

    try {

        const { page = 1, limit = 10, search = '', sort = 'created_at', order = 'DESC' } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);



        const conditions = [];

        const params = [];



        if (search) {

            conditions.push('(e.title LIKE ? OR e.description LIKE ? OR u.username LIKE ?)');

            params.push(`%${search}%`, `%${search}%`, `%${search}%`);

        }



        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';



        const allowedSorts = ['created_at', 'title', 'date'];

        const sortCol = allowedSorts.includes(sort) ? `e.${sort}` : 'e.created_at';

        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';



        // Count

        const [countResult] = await pool.query(

            `SELECT COUNT(*) as total FROM events e LEFT JOIN users u ON e.user_id = u.id ${whereClause}`,

            params

        );

        const total = countResult[0].total;



        // Fetch events with creator info and participant count

        const [events] = await pool.query(

            `SELECT e.*, u.username as creator_username, u.email as creator_email,

                    (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count

             FROM events e

             LEFT JOIN users u ON e.user_id = u.id

             ${whereClause}

             ORDER BY ${sortCol} ${sortOrder}

             LIMIT ? OFFSET ?`,

            [...params, parseInt(limit), offset]

        );



        res.json({

            success: true,

            events,

            pagination: {

                total,

                page: parseInt(page),

                limit: parseInt(limit),

                totalPages: Math.ceil(total / parseInt(limit))

            }

        });

    } catch (err) {

        console.error('[getAllEvents] error:', err);

        res.status(500).json({ success: false, message: 'Failed to fetch events.' });

    }

};



/**

 * @desc    Get single event details (admin view)

 * @route   GET /api/admin/events/:id

 * @access  Admin

 */

export const getEventById = async (req, res) => {

    try {

        const { id } = req.params;



        const [events] = await pool.query(

            `SELECT e.*, u.username as creator_username, u.email as creator_email

             FROM events e

             LEFT JOIN users u ON e.user_id = u.id

             WHERE e.id = ?`,

            [id]

        );



        if (events.length === 0) {

            return res.status(404).json({ success: false, message: 'Event not found.' });

        }



        // Get participants

        const [participants] = await pool.query(

            `SELECT u.id, u.username, u.email, ep.joined_at

             FROM event_participants ep

             JOIN users u ON ep.user_id = u.id

             WHERE ep.event_id = ?

             ORDER BY ep.joined_at DESC`,

            [id]

        );



        res.json({

            success: true,

            event: events[0],

            participants

        });

    } catch (err) {

        console.error('[getEventById] error:', err);

        res.status(500).json({ success: false, message: 'Failed to fetch event.' });

    }

};



/**

 * @desc    Update an event (admin)

 * @route   PUT /api/admin/events/:id

 * @access  Admin

 */

export const updateEvent = async (req, res) => {

    try {

        const { id } = req.params;

        const { title, description, date, time, location, max_participants } = req.body;



        const [existing] = await pool.query('SELECT id FROM events WHERE id = ?', [id]);

        if (existing.length === 0) {

            return res.status(404).json({ success: false, message: 'Event not found.' });

        }



        await pool.query(

            `UPDATE events SET

                title = COALESCE(?, title),

                description = COALESCE(?, description),

                date = COALESCE(?, date),

                time = COALESCE(?, time),

                location = COALESCE(?, location),

                max_participants = COALESCE(?, max_participants)

             WHERE id = ?`,

            [title ?? null, description ?? null, date ?? null, time ?? null, location ?? null, max_participants ?? null, id]

        );



        const [updated] = await pool.query(

            `SELECT e.*, u.username as creator_username

             FROM events e LEFT JOIN users u ON e.user_id = u.id

             WHERE e.id = ?`,

            [id]

        );



        res.json({ success: true, message: 'Event updated successfully.', event: updated[0] });

    } catch (err) {

        console.error('[updateEvent] error:', err);

        res.status(500).json({ success: false, message: 'Failed to update event.' });

    }

};



/**

 * @desc    Delete an event (admin)

 * @route   DELETE /api/admin/events/:id

 * @access  Admin

 */

export const deleteEvent = async (req, res) => {

    try {

        const { id } = req.params;



        const [existing] = await pool.query('SELECT id, title FROM events WHERE id = ?', [id]);

        if (existing.length === 0) {

            return res.status(404).json({ success: false, message: 'Event not found.' });

        }



        await pool.query('DELETE FROM events WHERE id = ?', [id]);



        res.json({ success: true, message: `Event "${existing[0].title}" deleted successfully.` });

    } catch (err) {

        console.error('[deleteEvent] error:', err);

        res.status(500).json({ success: false, message: 'Failed to delete event.' });

    }

};

