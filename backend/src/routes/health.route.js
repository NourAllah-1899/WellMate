import { Router } from 'express';
import { 
    getNutritionSummary, 
    logSmoking, 
    getSmokingStats, 
    generateAIReport, 
    getHealthReports,
    updateHealthGoal,
    logWater,
    getWaterStats
} from '../controllers/health.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/nutrition-summary', authenticate, getNutritionSummary);
router.post('/smoking', authenticate, logSmoking);
router.get('/smoking/stats', authenticate, getSmokingStats);
router.post('/water', authenticate, logWater);
router.get('/water/stats', authenticate, getWaterStats);
router.post('/generate-report', authenticate, generateAIReport);
router.get('/reports', authenticate, getHealthReports);
router.post('/update-goal', authenticate, updateHealthGoal);

export default router;
