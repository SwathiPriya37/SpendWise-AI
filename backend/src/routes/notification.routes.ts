import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, createDemoNotification } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.post('/demo', createDemoNotification);

export default router;
