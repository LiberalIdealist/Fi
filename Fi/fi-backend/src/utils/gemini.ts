import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY not found in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey as string);

/**
 * Analyze financial questionnaire responses using Gemini AI.
 */
export async function analyzeRiskProfile(responses: Record<string, any>) {
  try {
    // Use gemini-1.5-flash for better JSON compliance
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Improved prompt that strongly enforces JSON format
    const prompt = `
      You are a financial expert API. Based on the user's answers to the financial questionnaire, 
      assess their risk profile and provide personalized financial recommendations.
      
      IMPORTANT: Your entire response must be valid JSON only, with no additional text, markdown, or explanations.
      
      Return text with exactly this structure:
      {
        "riskScore": <number between 1-10>,
        "riskProfile": <string describing risk tolerance>,
        "portfolioAllocation": {
          "stocks": <number percentage>,
          "bonds": <number percentage>,
          "cash": <number percentage>
        },
        "insights": [<string insight1>, <string insight2>, <string insight3>],
        "recommendations": [<string recommendation1>, <string recommendation2>, <string recommendation3>]
      }

      User's questionnaire responses:
      ${JSON.stringify(responses, null, 2)}
    `;

    console.log("Sending request to Gemini API...");
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    console.log("Raw Gemini response:", textResponse.substring(0, 100) + "...");

    try {
      // Try direct JSON parsing first
      return JSON.parse(textResponse);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON, trying to extract JSON from text");
      
      // Try to extract JSON from markdown code blocks
      const jsonMatch = textResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (extractError) {
          console.error("Failed to parse extracted JSON:", extractError);
        }
      }
      
      // Try to find any JSON-like structure
      const possibleJson = textResponse.match(/(\{[\s\S]*\})/);
      if (possibleJson && possibleJson[1]) {
        try {
          return JSON.parse(possibleJson[1]);
        } catch (secondExtractError) {
          console.error("Failed to parse possible JSON structure:", secondExtractError);
        }
      }
      
      // If all parsing attempts fail, return fallback response
      console.log("Using fallback response");
      return createFallbackResponse();
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return createFallbackResponse();
  }
}

function createFallbackResponse() {
  return {
    riskScore: 5,
    riskProfile: "Moderate (Default)",
    portfolioAllocation: { stocks: 60, bonds: 30, cash: 10 },
    insights: [
      "Based on the information provided, a balanced approach is recommended",
      "Consider building an emergency fund first before more aggressive investments",
      "Regular investment contributions are important for long-term growth"
    ],
    recommendations: [
      "Start with a 60/30/10 portfolio allocation (stocks/bonds/cash)",
      "Set up automatic monthly contributions to your investment accounts",
      "Review and rebalance your portfolio quarterly"
    ]
  };
}

// Function to list available models
export async function listAvailableModels() {
  try {
    console.log("Listing available models via Gemini API...");
    const result = await fetch("https://generativelanguage.googleapis.com/v1/models", {
      headers: { 
        "x-goog-api-key": apiKey as string 
      }
    });
    
    if (!result.ok) {
      throw new Error(`Failed to list models: ${result.status} ${result.statusText}`);
    }
    
    return await result.json();
  } catch (error) {
    console.error("Error listing models:", error);
    return { error: "Failed to retrieve models" };
  }
}