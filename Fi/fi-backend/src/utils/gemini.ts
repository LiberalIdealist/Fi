import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-pro-1.5" });

/**
 * Analyze financial questionnaire responses using Gemini AI.
 * @param {Record<string, string>} responses - User's questionnaire answers
 * @returns {Promise<{ riskScore: number; insights: string[] }>} - Risk score and insights
 */
export async function analyzeRiskProfile(responses: Record<string, string>) {
  try {
    const prompt = `
      You are a financial expert. Based on the user's answers, assess their risk profile.
      Assign a risk score from 1 to 10 (1 = Very Conservative, 10 = Very Aggressive).
      Also provide 3 key insights about their financial behavior.

      Responses:
      ${JSON.stringify(responses, null, 2)}

      Provide output as JSON:
      {
        "riskScore": <number>,
        "insights": [<string>, <string>, <string>]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const analysis = JSON.parse(text);

    return {
      riskScore: analysis.riskScore || 5,
      insights: analysis.insights || [],
    };
  } catch (error) {
    console.error("Gemini Risk Profile Analysis Error:", error);
    return { riskScore: 5, insights: ["Default risk assessment due to error"] };
  }
}

/**
 * Generate financial insights and investment behavior trends.
 * @param {Record<string, string>} responses - User's financial data
 * @returns {Promise<string[]>} - List of personalized insights
 */
export async function generateInvestmentInsights(responses: Record<string, string>) {
  try {
    const prompt = `
      Analyze the following user's financial behavior and provide 3 investment insights.

      Responses:
      ${JSON.stringify(responses, null, 2)}

      Provide insights in an array format:
      ["Insight 1", "Insight 2", "Insight 3"]
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return JSON.parse(text) || [];
  } catch (error) {
    console.error("Gemini Investment Insights Error:", error);
    return ["Default investment insights due to error"];
  }
}