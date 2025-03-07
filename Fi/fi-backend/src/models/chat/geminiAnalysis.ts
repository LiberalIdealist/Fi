import { Request, Response } from "express"; 
import { analyzeRiskProfile } from "../../utils/gemini.js"; // Fixed import path with .js extension

/**
 * Controller for Gemini AI analysis
 */
export async function geminiAnalysisController(req: Request, res: Response) {
  try {
    const requestData = req.body; // In Express, use req.body instead of req.json()

    if (!requestData || Object.keys(requestData).length === 0) {
      return res.status(400).json({ error: "No data provided for analysis" });
    }

    // Call Gemini AI to analyze the provided data
    const analysisResult = await analyzeRiskProfile(requestData);

    return res.json({ message: "Analysis completed", analysisResult });
  } catch (error) {
    console.error("Error processing Gemini analysis:", error);
    return res.status(500).json({ error: "Failed to analyze data with Gemini" });
  }
}

export default geminiAnalysisController;