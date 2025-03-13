import { Router, Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { db } from '../config/firebase';
import { analyzeRiskProfile, getAnalysisForUser } from '../utils/gemini'; // Ensure this import is correct

const router = Router();

router.post('/questionnaire', asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { answers, userId } = req.body;
  console.log('Received questionnaire submission:', req.body);
  
  if (!answers || !userId) {
    console.error('Missing required fields: answers and userId');
    res.status(400).json({ 
      error: 'Bad Request', 
      message: 'Missing required fields: answers and userId' 
    });
    return;
  }
  
  try {
    console.log('Analyzing risk profile...');
    // Analyze risk profile and store the result in Firestore
    const analysis = await analyzeRiskProfile(answers, userId);
    console.log('Analysis result:', analysis);
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error processing questionnaire:', error);
    next(error); // Pass the error to the next middleware
  }
}));

router.get('/analysis', asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.query;
  console.log(`Received analysis request for userId: ${userId}`);
  
  if (!userId || typeof userId !== 'string') {
    console.error('Missing or invalid userId parameter');
    res.status(400).json({ error: 'Missing or invalid userId parameter' });
    return;
  }
  
  try {
    console.log('Fetching analysis...');
    
    // Use the new function that tries both Firestore and memory
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

router.get('/analysis-fallback', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'Missing or invalid userId parameter' });
      return;
    }
    
    console.log(`Received fallback analysis request for userId: ${userId}`);
    
    // Use the getAnalysisForUser function that tries both Firestore and memory
    const analysis = await getAnalysisForUser(userId);
    
    if (analysis) {
      res.json(analysis);
      return;
    }
    
    // Create default response if nothing found
    res.json({
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