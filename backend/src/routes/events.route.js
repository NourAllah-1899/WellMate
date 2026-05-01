import { Router } from 'express';
import { getEvents, postEvent, joinEvent, leaveEvent, getEventDetails, getMyEvents } from '../controllers/events.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import jwt from 'jsonwebtoken';

const router = Router();

// Middleware to optionally attach user for public routes
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch { /* ignore */ }
    }
    next();
};

// Public/Optional routes
router.get('/', optionalAuth, getEvents);
router.get('/my-events', authenticate, getMyEvents); // Changed from me/all to my-events for simplicity or as requested
router.get('/:id', optionalAuth, getEventDetails);

// Protected
router.post('/', authenticate, postEvent);
router.post('/:id/join', authenticate, joinEvent);
router.delete('/:id/join', authenticate, leaveEvent);

export default router;

