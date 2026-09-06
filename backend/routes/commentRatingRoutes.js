import express from 'express';
import { 
  addComment, 
  getCourseComments, 
  getInstructorReviews, 
  replyToComment, 
  deleteCommentReply, 
  addRating, 
  getCourseRatings 
} from '../controllers/commentRatingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Comments & Reviews
router.post('/comments', protect, addComment);
router.get('/comments/course/:courseId', getCourseComments);
router.get('/comments/instructor/all', protect, getInstructorReviews);
router.put('/comments/:id/reply', protect, replyToComment);
router.delete('/comments/:id/reply', protect, deleteCommentReply);

// Ratings
router.post('/ratings', protect, addRating);
router.get('/ratings/course/:courseId', getCourseRatings);

export default router;
