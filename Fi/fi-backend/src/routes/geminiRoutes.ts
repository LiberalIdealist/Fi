import express from 'express';
import geminiAnalysisController from '../models/chat/geminiAnalysis.js';

const router = express.Router();

// Simply pass the controller function directly
router.post('/questionnaire', geminiAnalysisController);
router.get('/analysis', geminiAnalysisController); // Optional alias

export default router;