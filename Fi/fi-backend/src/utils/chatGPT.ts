import { OpenAI } from "openai";
import dotenv from "dotenv";
import { analyzeRiskProfile } from "./gemini";
import { analyzeText } from "./googleNLP";
import { getMarketNews } from "./newsAPI";
import { fetchStockMarketData } from "./yfinance";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * **Generate a Personalized Investment Portfolio**
 * Uses:
 * - **User risk profile**
 * - **Market trends (via News API & yFinance)**
 * - **Financial document analysis (via Google NLP)**
 */
export async function generatePortfolio(userData: any) {
  try {
    // **Extract relevant data**
    const riskProfile = await analyzeRiskProfile(userData.responses);
    const documentInsights = await analyzeText(userData.documents);
    const marketNews = await getMarketNews("global and Indian financial markets");
    const stockData = await fetchStockMarketData();

    // **Construct prompt for ChatGPT**
    const prompt = `
      User Risk Profile: ${JSON.stringify(riskProfile)}
      Financial Document Analysis: ${JSON.stringify(documentInsights)}
      Recent Market News: ${JSON.stringify(marketNews)}
      Stock Market Data: ${JSON.stringify(stockData)}

      Based on this information, generate an **optimized investment portfolio**.
      The response format should be structured as follows:
      {
        "portfolio": {
          "fixedDeposits": { "allocation": "...%", "recommendations": ["...", "..."] },
          "stocks": { "allocation": "...%", "recommendations": [{ "name": "...", "sector": "...", "rationale": "..." }] },
          "mutualFunds": { "allocation": "...%", "types": [{ "type": "...", "recommendations": ["...", "..."] }] },
          "insurance": { "health": "...%", "life": "...%", "term": "...%" }
        },
        "summary": "Provide an investment summary here"
      }
    `;

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      response_format: { type: "json_object" }, // ✅ Explicitly define response format
    });

    return JSON.parse(chatResponse.choices[0].message?.content || "{}");
  } catch (error) {
    console.error("Error generating portfolio:", error);
    return { portfolio: {}, summary: "Portfolio generation failed." };
  }
}

/**
 * **Generate a SWOT Analysis**
 * Uses:
 * - **Portfolio data**
 * - **Market conditions**
 * - **User risk profile**
 */
export async function generateSWOTAnalysis(portfolioData: string) {
  try {
    const prompt = `
      Perform a SWOT analysis on the following portfolio.

      Portfolio Data:
      ${portfolioData}

      Respond in JSON format:
      {
        "strengths": ["...", "..."],
        "weaknesses": ["...", "..."],
        "opportunities": ["...", "..."],
        "threats": ["...", "..."]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message?.content || "{}");
  } catch (error) {
    console.error("SWOT Analysis Error:", error);
    return { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  }
}

/**
 * **Analyze User's Financial Profile**
 * Uses:
 * - **Questionnaire responses**
 * - **Financial document analysis**
 * - **Spending habits**
 */
export async function analyzeUserFinancialProfile(userProfileData: Record<string, any>) {
  try {
    const prompt = `
      Analyze the following user's financial profile and provide:
      1. **Risk Profile Classification** (Conservative, Moderate, Aggressive)
      2. **Three Key Financial Insights** about their investment behavior
      3. **Three Recommended Actions** to optimize their financial strategy

      User Financial Data:
      ${JSON.stringify(userProfileData, null, 2)}

      Provide output in JSON format:
      {
        "riskProfile": "<Conservative | Moderate | Aggressive>",
        "financialInsights": ["...", "...", "..."],
        "recommendedActions": ["...", "...", "..."]
      }
    `;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }, // ✅ Ensure correct response format
    });

    return JSON.parse(chatCompletion.choices[0].message?.content || "{}");
  } catch (error) {
    console.error("ChatGPT Financial Profile Analysis Error:", error);
    return { riskProfile: "Moderate", financialInsights: [], recommendedActions: [] };
  }
}