import { Router } from 'express';
import { getSystemStats, getAuditLogs, getAllUsers, updateUserRole } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(requireAdmin);

router.get('/stats', getSystemStats);
router.get('/audit-logs', getAuditLogs);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

export default router;
