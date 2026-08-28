import express from 'express';
import { enrollCourse, getMyEnrollments, checkEnrollment } from '../controllers/enrollmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, enrollCourse);
router.get('/my-courses', protect, getMyEnrollments);
router.get('/check/:courseId', protect, checkEnrollment);

export default router;
