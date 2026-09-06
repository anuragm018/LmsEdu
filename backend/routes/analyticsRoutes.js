import express from 'express';
import { getCourseAnalytics, getInstructorOverview } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/instructor/overview', protect, getInstructorOverview);
router.get('/course/:courseId', protect, getCourseAnalytics);

export default router;
