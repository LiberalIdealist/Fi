import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

/**
 * Analyze financial questionnaire responses using Gemini AI.
 */
export async function analyzeRiskProfile(responses: Record<string, string>) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are a financial expert. Based on the user's answers, assess their risk profile.
      Assign a risk score from 1 to 10 (1 = Very Conservative, 10 = Very Aggressive).
      Also provide 3 key insights about their financial behavior.

      Responses:
      ${JSON.stringify(responses, null, 2)}
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();

    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { riskScore: 5, insights: ["Default risk assessment due to error"] };
  }
}