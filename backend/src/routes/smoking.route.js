import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import * as controller from '../controllers/smoking.controller.js'

const router = Router()

// Log smoking data for a day
router.post('/', authenticate, controller.logSmoking)

// Get today's smoking log
router.get('/today', authenticate, controller.getSmokeToday)

// Set smoking quit target
router.post('/target', authenticate, controller.setSmokeQuitTarget)

// Get smoking statistics
router.get('/stats', authenticate, controller.getSmokingStats)

export default router
