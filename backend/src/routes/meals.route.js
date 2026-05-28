import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { createMeal, estimateMeal, getTodayMeals, getMealsHistory, updateMeal, deleteMeal, generateMealPlan, saveMealPlan, getTodayMealPlan, unpinMealPlan } from '../controllers/meals.controller.js';

const router = Router();

router.get('/today', authenticate, getTodayMeals);
router.get('/history', authenticate, getMealsHistory);
router.get('/plan/today', authenticate, getTodayMealPlan);
router.delete('/plan/today', authenticate, unpinMealPlan);
router.post('/estimate', authenticate, estimateMeal);
router.post('/generate-plan', authenticate, generateMealPlan);
router.post('/save-plan', authenticate, saveMealPlan);
router.post('/', authenticate, createMeal);
router.put('/:id', authenticate, updateMeal);
router.delete('/:id', authenticate, deleteMeal);

export default router;

