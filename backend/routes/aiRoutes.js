import express from 'express';
import { askAIChatbot } from '../controllers/aiController.js';

const router = express.Router();


router.post('/chat', askAIChatbot);

export default router;
