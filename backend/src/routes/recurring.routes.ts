import { Router } from 'express';
import { getRecurringExpenses, createRecurringExpense, deleteRecurringExpense, processRecurringExpenses } from '../controllers/recurring.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getRecurringExpenses);
router.post('/', createRecurringExpense);
router.post('/process', processRecurringExpenses);
router.delete('/:id', deleteRecurringExpense);

export default router;
