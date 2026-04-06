import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import * as controller from '../controllers/program.controller.js'

const router = Router()

// Generate a personalized sport program
router.post('/generate', authenticate, controller.generateSportProgram)

// Get active sport program
router.get('/active', authenticate, controller.getActiveSportProgram)

// Get all sport programs
router.get('/', authenticate, controller.getAllSportPrograms)

// Deactivate a sport program
router.put('/:programId/deactivate', authenticate, controller.deactivateSportProgram)

export default router
