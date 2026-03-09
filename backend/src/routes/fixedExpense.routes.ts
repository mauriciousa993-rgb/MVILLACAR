import { Router } from 'express';
import {
  createFixedExpense,
  deleteFixedExpense,
  getFixedExpenses,
  updateFixedExpense,
} from '../controllers/fixedExpense.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getFixedExpenses);
router.post('/', authorize('admin', 'vendedor'), createFixedExpense);
router.put('/:id', authorize('admin', 'vendedor'), updateFixedExpense);
router.delete('/:id', authorize('admin', 'vendedor'), deleteFixedExpense);

export default router;
