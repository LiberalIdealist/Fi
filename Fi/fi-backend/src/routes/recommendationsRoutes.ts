import { Router, Request, Response, NextFunction } from 'express';
import { generatePortfolio, generateSWOTAnalysis } from '../utils/chatGPT.js';
import { analyzeRiskProfile } from '../utils/gemini.js';

// Helper function for async route handlers
const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

const router = Router();

// Generate portfolio route
router.post('/generate-portfolio', asyncHandler(async (req: Request, res: Response) => {
  const userProfile = req.body;

  if (!userProfile) {
    res.status(400).json({ error: "User profile data is required" });
    return;
  }

  const portfolioData = await generatePortfolio(userProfile);
  res.json({ message: "Portfolio generated successfully", portfolio: portfolioData });
}));

// Risk assessment route
router.post('/risk-assessment', asyncHandler(async (req: Request, res: Response) => {
  const userProfile = req.body;

  if (!userProfile) {
    res.status(400).json({ error: "User responses are required" });
    return;
  }

  const profileAnalysis = await analyzeRiskProfile(userProfile);
  res.json({ message: "Risk assessment completed", riskProfile: profileAnalysis });
}));

// SWOT analysis route
router.post('/swot-analysis', asyncHandler(async (req: Request, res: Response) => {
  const { portfolio } = req.body;

  if (!portfolio) {
    res.status(400).json({ error: "Portfolio data is required" });
    return;
  }

  const swotResult = await generateSWOTAnalysis(portfolio);
  res.json({ message: "SWOT analysis completed", swot: swotResult });
}));

export default router;