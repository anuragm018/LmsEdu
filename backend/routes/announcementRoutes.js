import express from 'express';
import { 
  createAnnouncement, 
  getCourseAnnouncements, 
  getInstructorAnnouncements, 
  deleteAnnouncement, 
  getStudentAnnouncementsFeed 
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createAnnouncement);
router.get('/instructor/all', protect, getInstructorAnnouncements);
router.get('/student/feed', protect, getStudentAnnouncementsFeed);
router.get('/course/:courseId', getCourseAnnouncements);
router.delete('/:id', protect, deleteAnnouncement);

export default router;
