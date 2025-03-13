import { Request, Response } from "express";
import { analyzeRiskProfile } from "@/utils/gemini.js";

export async function riskAssessmentController(req: Request, res: Response) {
  try {
    const userProfile = req.body;

    if (!userProfile) {
      return res.status(400).json({ error: "User responses are required" });
    }

    // Extract risk profile & insights using Gemini
    const userId = req.body.userId; // Assuming userId is part of the request body
    const profileAnalysis = await analyzeRiskProfile(userProfile, userId);

    return res.json({ 
      message: "Risk assessment completed", 
      riskProfile: profileAnalysis 
    });
  } catch (error) {
    console.error("Error assessing risk:", error);
    return res.status(500).json({ error: "Failed to analyze risk profile" });
  }
}

export default riskAssessmentController;