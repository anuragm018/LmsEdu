import express from 'express';
import { processPurchase, getMyTransactions, getAllTransactions } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, processPurchase);
router.get('/my-transactions', protect, getMyTransactions);
router.get('/admin/all', protect, authorize('admin'), getAllTransactions);

export default router;
