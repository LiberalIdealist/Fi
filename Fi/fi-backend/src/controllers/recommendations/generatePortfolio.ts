import { Request, Response } from "express";
import { generatePortfolio as generatePortfolioUtil } from "@/utils/chatGPT.js";

export async function generatePortfolioController(req: Request, res: Response) {
  try {
    const userProfile = req.body;

    if (!userProfile) {
      return res.status(400).json({ error: "User profile data is required" });
    }

    // Generate Portfolio using ChatGPT-4o
    const portfolioData = await generatePortfolioUtil(userProfile);

    return res.json({ 
      message: "Portfolio generated successfully", 
      portfolio: portfolioData 
    });
  } catch (error) {
    console.error("Error generating portfolio:", error);
    return res.status(500).json({ error: "Failed to generate portfolio" });
  }
}

export default generatePortfolioController;