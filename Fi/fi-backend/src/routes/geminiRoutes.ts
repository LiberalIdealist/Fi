import { Router, Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { db } from '../config/firebase';
import { analyzeRiskProfile, getAnalysisForUser } from '../utils/gemini';
import { authMiddleware } from '../config/authMiddleware'; // Make sure this import exists

const router = Router();

// Add auth middleware to ensure we get userId from the token
router.post('/questionnaire', authMiddleware, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { answers } = req.body;
  // Get userId from authenticated token instead of request body
  const userId = req.user.uid;
  
  console.log(`Received questionnaire submission for authenticated user: ${userId.substring(0, 8)}...`);
  
  if (!answers) {
    console.error('Missing required field: answers');
    res.status(400).json({ 
      error: 'Bad Request', 
      message: 'Missing required field: answers' 
    });
    return;
  }
  
  try {
    console.log('Analyzing risk profile...');
    // Use the userId from authentication token
    const analysis = await analyzeRiskProfile(answers, userId);
    console.log('Analysis result:', analysis);
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error processing questionnaire:', error);
    next(error);
  }
}));

// Secure the analysis endpoint
router.get('/analysis', authMiddleware, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Get userId from the token
  const userId = req.user.uid;
  console.log(`Fetching analysis for authenticated user: ${userId.substring(0, 8)}...`);
  
  try {
    console.log('Fetching analysis...');
    
    // Use the authenticated userId
    const analysis = await getAnalysisForUser(userId);
    
    if (!analysis) {
      console.log('No analysis found, using fallback response');
      const fallbackAnalysis = {
        userId,
        riskScore: 5,
        riskProfile: "Moderate (Default)",
        psychologicalInsights: "Based on information provided, a balanced approach is recommended",
        financialInsights: "Consider building an emergency fund before more aggressive investments",
        recommendations: "Regular investment contributions are important for long-term growth",
        createdAt: new Date()
      };
      res.status(200).json(fallbackAnalysis);
      return;
    }
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error in analysis endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

// Secure the fallback endpoint
router.get('/analysis-fallback', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  try {
    // Get userId from authenticated token
    const userId = req.user.uid;
    
    console.log(`Received fallback analysis request for authenticated user: ${userId.substring(0, 8)}...`);
    
    // Use the authenticated userId
    const analysis = await getAnalysisForUser(userId);
    
    if (analysis) {
      res.json(analysis);
      return;
    }
    
    // Create default response if nothing found
    res.json({
      userId,
      riskScore: 5,
      riskProfile: "Moderate (Default)",
      psychologicalInsights: "Based on limited information, a balanced approach is recommended.",
      financialInsights: "Consider building emergency savings before more aggressive investments.",
      recommendations: "Regular investment contributions are important for long-term growth.",
      fromFallback: true
    });
  } catch (error) {
    console.error('Error in fallback analysis route:', error);
    res.status(500).json({
      error: 'Failed to retrieve analysis',
      fallbackData: {
        riskScore: 5,
        riskProfile: "Moderate (Default)",
        recommendations: "Regular investment contributions are important for long-term growth.",
        fromServerFallback: true
      }
    });
  }
}));

export default router;