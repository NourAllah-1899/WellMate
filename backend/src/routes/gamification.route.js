import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getBadges, getStreak, refreshGamification } from '../controllers/gamification.controller.js';

const router = Router();

router.get('/badges', authenticate, getBadges);
router.get('/streak', authenticate, getStreak);
router.post('/refresh', authenticate, refreshGamification);

export default router;
