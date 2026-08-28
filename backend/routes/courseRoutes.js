import express from 'express';
import { 
  getCourses, 
  getCourseById, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  getInstructorCourses,
  getCategories,
  createCategory
} from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/categories', getCategories);
router.post('/categories', protect, authorize('admin'), createCategory);

router.get('/instructor/my-courses', protect, authorize('instructor', 'admin'), getInstructorCourses);

router.post('/', protect, authorize('instructor', 'admin'), createCourse);
router.get('/:id', getCourseById);
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

export default router;
