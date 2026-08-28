import express from 'express';
import { createQuiz, getCourseQuizzes, getQuizDetails, submitQuiz } from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('instructor', 'admin'), createQuiz);
router.get('/course/:courseId', protect, getCourseQuizzes);
router.get('/:id', protect, getQuizDetails);
router.post('/:id/submit', protect, submitQuiz);

export default router;
