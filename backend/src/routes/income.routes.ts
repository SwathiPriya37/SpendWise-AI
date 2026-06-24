import { Router } from 'express';
import { getIncomes, createIncome, updateIncome, deleteIncome } from '../controllers/income.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getIncomes);
router.post('/', createIncome);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);

export default router;
