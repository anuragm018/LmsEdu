import express from 'express';
import { 
  getAdminStats, 
  getAllUsers, 
  updateUserRole, 
  deleteUser, 
  getAllCoursesAdmin 
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/courses', getAllCoursesAdmin);

export default router;
