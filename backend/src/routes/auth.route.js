import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { updateLanguage, getLanguage } from '../controllers/language.controller.js';
import { body } from 'express-validator';

const router = Router();

router.post(
    '/register',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid.')
            .normalizeEmail(),
        body('password')
            .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
            .withMessage('Password must be strong (8+ chars, upper, lower, number, symbol).'),
        body('confirmPassword')
            .custom((value, { req }) => value === req.body.password)
            .withMessage('Passwords do not match.'),
    ],
    register
);
router.post('/login', login);
router.get('/me', authenticate, getMe);

router.put(
    '/profile',
    authenticate,
    [
        body('full_name').optional().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.'),
        body('age').optional().isInt({ min: 5, max: 120 }).withMessage('Age must be between 5 and 120.'),
        body('height_cm').optional().isFloat({ min: 50, max: 250 }).withMessage('Height must be between 50 and 250 cm.'),
        body('weight_kg').optional().isFloat({ min: 10, max: 500 }).withMessage('Weight must be between 10 and 500 kg.'),
    ],
    updateProfile
);

router.put('/language', authenticate, updateLanguage);
router.get('/language', authenticate, getLanguage);

export default router;
