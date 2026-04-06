import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { validationResult } from 'express-validator';

const signToken = (user_id, username) =>
    jwt.sign({ user_id, username }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

// POST /api/auth/register
export const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed.', errors: errors.array() });
    }

    const { email, password, confirmPassword } = req.body;
    const username = req.body.username || String(email).split('@')[0];

    if (!email || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (!username) {
        return res.status(400).json({ success: false, message: 'Username could not be generated.' });
    }

    try {
        // Check for existing email
        const [existingEmail] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already exists.' });
        }

        // Check for existing username
        const [existingUsername] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsername.length > 0) {
            return res.status(409).json({ success: false, message: 'Username already exists.' });
        }

        const hashed = await bcrypt.hash(password, 12);
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashed]
        );

        const token = signToken(result.insertId, username);

        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            token,
            user: { id: result.insertId, username, email },
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};

// POST /api/auth/login
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const token = signToken(user.id, user.username);

        res.json({
            success: true,
            message: 'Logged in successfully.',
            token,
            user: { id: user.id, username: user.username, email: user.email },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

// GET /api/auth/me  (verify token & return current user)
export const getMe = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, username, email, full_name, age, height_cm, weight_kg, bmi, created_at, updated_at FROM users WHERE id = ?',
            [req.user.user_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.json({ success: true, user: rows[0] });
    } catch (err) {
        console.error('GetMe error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/auth/profile  (update health profile)
export const updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed.', errors: errors.array() });
    }

    const { full_name, age, height_cm, weight_kg } = req.body;

    const hasAny =
        full_name !== undefined ||
        age !== undefined ||
        height_cm !== undefined ||
        weight_kg !== undefined;

    if (!hasAny) {
        return res.status(400).json({ success: false, message: 'No profile fields provided.' });
    }

    const heightNum = height_cm !== undefined ? Number(height_cm) : undefined;
    const weightNum = weight_kg !== undefined ? Number(weight_kg) : undefined;

    let bmi = null;
    if (heightNum !== undefined && weightNum !== undefined) {
        const heightM = heightNum / 100;
        bmi = Number((weightNum / (heightM * heightM)).toFixed(2));
    }

    try {
        await pool.query(
            `UPDATE users
             SET full_name = COALESCE(?, full_name),
                 age = COALESCE(?, age),
                 height_cm = COALESCE(?, height_cm),
                 weight_kg = COALESCE(?, weight_kg),
                 bmi = COALESCE(?, bmi)
             WHERE id = ?`,
            [
                full_name ?? null,
                age ?? null,
                height_cm ?? null,
                weight_kg ?? null,
                bmi,
                req.user.user_id,
            ]
        );

        const [rows] = await pool.query(
            'SELECT id, username, email, full_name, age, height_cm, weight_kg, bmi, created_at, updated_at FROM users WHERE id = ?',
            [req.user.user_id]
        );
        res.json({ success: true, message: 'Profile updated.', user: rows[0] });
    } catch (err) {
        console.error('UpdateProfile error:', err);
        res.status(500).json({ success: false, message: 'Server error while updating profile.' });
    }
};
