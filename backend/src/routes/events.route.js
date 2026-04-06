import { Router } from 'express';
import { getEvents, postEvent, joinEvent } from '../controllers/events.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public — but optionally enriched with hasJoined if authenticated
router.get('/', (req, res, next) => {
    // Try to decode token if present, but don't block if missing
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        import('jsonwebtoken').then(({ default: jwt }) => {
            try {
                req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
            } catch { /* ignore */ }
            next();
        });
    } else {
        next();
    }
}, getEvents);

// Protected
router.post('/', authenticate, postEvent);
router.post('/:id/join', authenticate, joinEvent);

export default router;
