import express from 'express';
import { addComment, getCourseComments, addRating, getCourseRatings } from '../controllers/commentRatingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/comments', protect, addComment);
router.get('/comments/course/:courseId', getCourseComments);

router.post('/ratings', protect, addRating);
router.get('/ratings/course/:courseId', getCourseRatings);

export default router;
