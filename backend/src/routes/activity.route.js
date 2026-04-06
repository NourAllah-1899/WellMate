import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import * as controller from '../controllers/activity.controller.js'

const router = Router()

// Record a physical activity
router.post('/', authenticate, controller.recordActivity)

// Get activities for today
router.get('/today', authenticate, controller.getActivitiesToday)

// Get activity statistics for a date range
router.get('/stats', authenticate, controller.getActivitiesRange)

// Delete an activity
router.delete('/:activityId', authenticate, controller.deleteActivity)

export default router
