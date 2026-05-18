import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';
import * as adminCtrl from '../controllers/admin.controller.js';

const router = Router();

// All routes require authentication + admin role
router.use(authenticate, isAdmin);

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
router.get('/stats', adminCtrl.getAdminStats);

// ─── User Management ──────────────────────────────────────────────────────────
router.get('/users', adminCtrl.getAllUsers);
router.get('/users/:id', adminCtrl.getUserById);
router.put('/users/:id', adminCtrl.updateUser);
router.delete('/users/:id', adminCtrl.deleteUser);

// ─── Event Management ─────────────────────────────────────────────────────────
router.get('/events', adminCtrl.getAllEvents);
router.get('/events/:id', adminCtrl.getEventById);
router.put('/events/:id', adminCtrl.updateEvent);
router.delete('/events/:id', adminCtrl.deleteEvent);

export default router;
