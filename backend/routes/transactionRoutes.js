import express from 'express';
import { 
  processPurchase, 
  getMyTransactions, 
  getTutorEarnings, 
  getAllTransactions,
  getTotalRevenueSummary 
} from '../controllers/transactionController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/total-revenue', optionalProtect, getTotalRevenueSummary);
router.post('/', protect, processPurchase);
router.get('/my-transactions', protect, getMyTransactions);
router.get('/tutor/earnings', protect, authorize('instructor', 'admin'), getTutorEarnings);
router.get('/admin/all', protect, authorize('admin'), getAllTransactions);

export default router;
