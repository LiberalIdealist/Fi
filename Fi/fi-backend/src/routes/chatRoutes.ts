import { Router, Request, Response, NextFunction } from 'express';
import { analyzeRiskProfile } from '../utils/gemini.js';
import { analyzeUserFinancialProfile } from '../utils/chatGPT.js';

const router = Router();

// Helper function to handle async routes
const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Gemini Analysis route
router.post('/gemini-analysis', asyncHandler(async (req: Request, res: Response) => {
  const requestData = req.body;

  if (!requestData || Object.keys(requestData).length === 0) {
    res.status(400).json({ error: "No data provided for analysis" });
    return;
  }

  const analysisResult = await analyzeRiskProfile(requestData);
  res.json({ message: "Analysis completed", analysisResult });
}));

// ChatGPT Profiling route
router.post('/chatgpt-profiling', asyncHandler(async (req: Request, res: Response) => {
  const result = await analyzeUserFinancialProfile(req.body);
  res.json(result);
}));

export default router;