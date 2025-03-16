import { Request, Response } from 'express';
import { analyzeRiskProfile } from '../../utils/gemini.js';

// Fixed to use uid instead of id
export default async function geminiAnalysisController(req: Request, res: Response): Promise<void> {
  try {
    const questionnaireData = req.body;
    
    // Get userId from authenticated token (uid, not id)
    const userId = req.user.uid; 
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    console.log(`Processing analysis for authenticated user: ${userId.substring(0, 8)}...`);
    
    const analysisResult = await analyzeRiskProfile(questionnaireData, userId);
    
    res.status(200).json({ 
      success: true,
      analysisResult
    });
  } catch (error) {
    console.error('Gemini analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze questionnaire data' });
  }
}