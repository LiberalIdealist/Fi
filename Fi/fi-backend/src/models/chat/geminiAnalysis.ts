import { Request, Response } from 'express';
import { analyzeRiskProfile } from '../../utils/gemini.js';

// Add Promise<void> return type and don't return any values
export default async function geminiAnalysisController(req: Request, res: Response): Promise<void> {
  try {
    const questionnaireData = req.body;
    
    // Process and validate data
    const userId = req.user.id; // Assuming userId is available in req.user
    const analysisResult = await analyzeRiskProfile(questionnaireData, userId);
    
    // Don't return this - just send the response
    res.status(200).json({ 
      success: true,
      analysisResult
    });
    
    // No return statement here
  } catch (error) {
    console.error('Gemini analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze questionnaire data' });
    // No return statement here either
  }
}