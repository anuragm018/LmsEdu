import express from 'express';
import { askAIChatbot } from '../controllers/aiController.js';

const router = express.Router();

// Allow AI Assistant chat endpoint for seamless doubt resolution
router.post('/chat', askAIChatbot);

export default router;
