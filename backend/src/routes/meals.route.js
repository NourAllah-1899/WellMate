import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { createMeal, estimateMeal, getTodayMeals, getMealsHistory, updateMeal, deleteMeal, generateMealPlan } from '../controllers/meals.controller.js';

const router = Router();

router.get('/today', authenticate, getTodayMeals);
router.get('/history', authenticate, getMealsHistory);
router.post('/estimate', authenticate, estimateMeal);
router.post('/generate-plan', authenticate, generateMealPlan);
router.post('/', authenticate, createMeal);
router.put('/:id', authenticate, updateMeal);
router.delete('/:id', authenticate, deleteMeal);

export default router;

