import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { createGoal, getActiveGoal, getGoalRecommendation } from '../controllers/goals.controller.js';

const router = Router();

router.get('/active', authenticate, getActiveGoal);
router.post('/recommendation', authenticate, getGoalRecommendation);
router.post('/', authenticate, createGoal);

export default router;
