import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { 
  getStudentThreads, 
  getTutorThreads, 
  getThreadMessages, 
  sendMessage 
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure chat uploads directory exists
const chatUploadDir = path.join(__dirname, '../uploads/chat');
if (!fs.existsSync(chatUploadDir)) {
  fs.mkdirSync(chatUploadDir, { recursive: true });
}

// Multer storage for chat attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, chatUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${Date.now()}_${cleanName}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// @desc    Upload chat attachment (image or document)
// @route   POST /api/chat/upload
// @access  Private
router.post('/upload', protect, upload.single('attachment'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a valid image or document file.' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/chat/${req.file.filename}`;

    res.json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      fileType: isImage ? 'image' : 'document',
      fileSize: req.file.size
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Chat Endpoints
router.get('/student/threads', protect, getStudentThreads);
router.get('/tutor/threads', protect, authorize('instructor', 'admin'), getTutorThreads);
router.get('/messages/:courseId/:studentId', protect, getThreadMessages);
router.post('/send', protect, sendMessage);

export default router;
