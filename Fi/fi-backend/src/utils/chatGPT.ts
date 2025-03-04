import { OpenAI } from "openai";
import dotenv from "dotenv";
import { fetchGoogleSearchResults } from "@/utils/googleSearch";
import { fetchNewsArticles } from "@/utils/newsAPI";
import { fetchStockMarketData } from "@/utils/yfinance";
import { analyzeDocument } from "@/utils/googleNLP";
import { analyzeRiskProfile } from "@/utils/gemini";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generates a comprehensive financial profile analysis.
 * Integrates Gemini (financial behavior), Google NLP (document analysis),
 * and real-time market data for better recommendations.
 * @param {Object} userProfile - The user's financial profile
 * @returns {Promise<Object>} - Analysis results including risk profile, insights, and market conditions.
 */
export async function analyzeUserFinancialProfile(userProfile: any) {
  try {
    const { responses, documents, userId } = userProfile;

    if (!responses || !userId) {
      throw new Error("Missing user responses or user ID");
    }

    // Extract risk profile and behavioral insights using Gemini
    const behavioralInsights = await analyzeRiskProfile(responses);

    // Extract financial document insights using Google NLP
    const documentInsights = await analyzeDocument(documents);

    // Fetch real-time market data
    const marketData = await fetchStockMarketData();
    const newsArticles = await fetchNewsArticles("Indian Economy, Global Markets");
    const searchResults = await fetchGoogleSearchResults("Indian financial market trends 2025");

    // Format the prompt for ChatGPT
    const prompt = `
      You are a financial expert AI. Analyze the user's financial behavior, risk profile,
      and market conditions to generate a personalized investment portfolio.

      **User Profile**
      - Risk Score: ${behavioralInsights.riskScore}
      - Financial Behavior: ${JSON.stringify(behavioralInsights.insights)}
      - Document Insights: ${JSON.stringify(documentInsights)}

      **Market Overview**
      - Latest Market Data: ${JSON.stringify(marketData)}
      - Relevant News: ${JSON.stringify(newsArticles)}
      - Google Search Insights: ${JSON.stringify(searchResults)}

      **Task**
      Based on this information, generate a **diversified investment portfolio** with allocations
      to Fixed Deposits, Stocks, Mutual Funds, and Insurance. Include a **SWOT analysis** of the portfolio.

      **Output Format (JSON)**
      {
        "portfolio": {
          "fixedDeposits": { "percentage": <number>, "details": "<string>" },
          "stocks": { "percentage": <number>, "top_picks": ["<stock1>", "<stock2>"], "sectors": ["<sector1>", "<sector2>"] },
          "mutualFunds": { "percentage": <number>, "recommended": ["<fund1>", "<fund2>"] },
          "insurance": { "type": "<insurance_type>", "coverage": "<string>" }
        },
        "swotAnalysis": {
          "strengths": ["<text>", "<text>"],
          "weaknesses": ["<text>", "<text>"],
          "opportunities": ["<text>", "<text>"],
          "threats": ["<text>", "<text>"]
        }
      }
    `;

    // Call ChatGPT-4o to generate the portfolio
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
    });

    return response.choices[0].message.content
      ? JSON.parse(response.choices[0].message.content)
      : { error: "Failed to generate portfolio" };
  } catch (error) {
    console.error("Error generating financial profile analysis:", error);
    return { error: "Analysis failed" };
  }
}

/**
 * Performs SWOT analysis on a given investment portfolio using ChatGPT-4o.
 * @param {Object} portfolio - The generated investment portfolio
 * @returns {Promise<Object>} - SWOT analysis result
 */
export async function generateSWOTAnalysis(portfolio: any) {
  try {
    if (!portfolio) {
      throw new Error("Portfolio data is required");
    }

    const prompt = `
      Perform a **SWOT analysis** on the following investment portfolio.

      **Portfolio:**
      ${JSON.stringify(portfolio, null, 2)}

      **Output Format (JSON)**
      {
        "strengths": ["<text>", "<text>"],
        "weaknesses": ["<text>", "<text>"],
        "opportunities": ["<text>", "<text>"],
        "threats": ["<text>", "<text>"]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
    });

    return response.choices[0].message.content
      ? JSON.parse(response.choices[0].message.content)
      : { error: "Failed to generate SWOT analysis" };
  } catch (error) {
    console.error("Error generating SWOT analysis:", error);
    return { error: "SWOT analysis failed" };
  }
}