import { Request, Response } from "express";
import { generateSWOTAnalysis } from "@/utils/chatGPT.js";

export async function swotAnalysisController(req: Request, res: Response) {
  try {
    const { portfolio } = req.body;

    if (!portfolio) {
      return res.status(400).json({ error: "Portfolio data is required" });
    }

    // Generate SWOT Analysis using ChatGPT-4o
    const swotResult = await generateSWOTAnalysis(portfolio);

    return res.json({ 
      message: "SWOT analysis completed", 
      swot: swotResult 
    });
  } catch (error) {
    console.error("Error generating SWOT analysis:", error);
    return res.status(500).json({ error: "Failed to generate SWOT analysis" });
  }
}

export default swotAnalysisController;