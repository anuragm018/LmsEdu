import express from 'express';
import { toggleLessonProgress, getCourseProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/toggle', protect, toggleLessonProgress);
router.get('/course/:courseId', protect, getCourseProgress);

export default router;
