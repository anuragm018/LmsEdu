import express from 'express';
import { 
  getCourseSyllabus, 
  createSection, 
  createLesson, 
  deleteLesson 
} from '../controllers/sectionLessonController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/:courseId', getCourseSyllabus);
router.post('/section', protect, authorize('instructor', 'admin'), createSection);
router.post('/lesson', protect, authorize('instructor', 'admin'), createLesson);
router.delete('/lesson/:id', protect, authorize('instructor', 'admin'), deleteLesson);

export default router;
