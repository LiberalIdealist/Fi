import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { db } from '../config/firebase'; // Ensure this import is correct

dotenv.config();

// In-memory storage as fallback
const inMemoryStore: Record<string, any> = {};

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY not found in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey as string);

/**
 * Analyze financial questionnaire responses using Gemini AI and store the result in Firestore.
 */
export async function analyzeRiskProfile(responses: Record<string, any>, userId: string) {
  try {
    // Use gemini-1.5-flash for better JSON compliance
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Improved prompt that strongly enforces plain text format
    const prompt = `
      You are a financial expert API. Based on the user's answers to the financial questionnaire, 
      assess their risk profile and provide personalized financial recommendations.
      
      IMPORTANT: Your entire response must be in plain text format, with no additional text, markdown, or explanations.
      
      Return text with exactly this structure:
      Risk Score: <number between 1-10>
      Risk Profile: <string describing risk tolerance>
      Psychological Insights: <string describing psychological insights>
      Financial Insights: <string describing financial insights>
      Recommendations: <string describing recommendations>

      User's questionnaire responses:
      ${JSON.stringify(responses, null, 2)}
    `;

    console.log("Sending request to Gemini API...");
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    console.log("Raw Gemini response:", textResponse.substring(0, 100) + "...");

    // Extract the relevant parts from the plain text response
    const analysis = extractAnalysisFromText(textResponse);
    console.log("Analysis result:", analysis);

    // Store the analysis result in Firestore with fallback to in-memory storage
    let savedToFirestore = false;
    let documentId = 'geminiAnalyses';
    
    try {
      console.log('Attempting to save analysis to Firestore...');
      
      // Create a direct document reference with auto-generated ID
      const docRef = db.collection('userId').doc();
      documentId = docRef.id;
      
      console.log(`Creating document with ID: ${docRef.id}`);
      
      // Prepare the data
      const analysisData = {
        userId,
        riskScore: analysis.riskScore,
        riskProfile: analysis.riskProfile,
        psychologicalInsights: analysis.psychologicalInsights,
        financialInsights: analysis.financialInsights,
        recommendations: analysis.recommendations,
        createdAt: new Date(),
        id: docRef.id
      };
      
      // Use set() instead of add()
      await docRef.set(analysisData);
      
      console.log(`Analysis saved successfully to Firestore with ID: ${docRef.id}`);
      savedToFirestore = true;
    } catch (dbError) {
      if (dbError instanceof Error) {
        console.error("Firestore Error:", dbError.message);
        console.error("Error details:", dbError);
      } else {
        console.error("Unknown Firestore Error:", dbError);
      }
      console.log('Continuing without saving to Firestore, using in-memory storage');
      
      // Save to in-memory storage as fallback
      const fallbackId = `memory_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      inMemoryStore[fallbackId] = {
        userId,
        ...analysis,
        createdAt: new Date(),
        id: fallbackId,
        storedLocally: true
      };
      
      documentId = fallbackId;
    }

    // Add storage location to the returned analysis
    return {
      ...analysis,
      id: documentId,
      savedToFirestore
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return createFallbackResponse();
  }
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

// Add a function to retrieve analysis from memory or Firestore
export async function getAnalysisForUser(userId: string) {
  try {
    console.log(`Getting analysis for user ${userId}`);
    
    // Try Firestore first
    try {
      const snapshot = await db.collection('userId')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        console.log('Found analysis in Firestore');
        return snapshot.docs[0].data();
      }
      console.log('No analysis found in Firestore');
    } catch (firestoreErr) {
      console.log('Error accessing Firestore:', firestoreErr);
      // Continue to memory lookup
    }
    
    // Check in-memory store as fallback
    const memoryEntries = Object.values(inMemoryStore)
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
    
    if (memoryEntries.length > 0) {
      console.log('Found analysis in memory store');
      return memoryEntries[0];
    }
    
    console.log('No analysis found for user');
    return null;
  } catch (err) {
    console.error('Error getting analysis:', err);
    return null;
  }
}
/**
 * Extracts structured analysis data from the Gemini AI text response
 * @param textResponse Plain text response from Gemini API
 * @returns Structured analysis object with risk assessment and recommendations
 */
function extractAnalysisFromText(textResponse: string) {
  try {
    // Initialize with default values
    const analysis = {
      riskScore: 5,
      riskProfile: "Moderate",
      psychologicalInsights: "",
      financialInsights: "",
      recommendations: ""
    };

    // Extract risk score (number between 1-10)
    const riskScoreMatch = textResponse.match(/Risk Score:\s*(\d+)/i);
    if (riskScoreMatch && riskScoreMatch[1]) {
      const score = parseInt(riskScoreMatch[1], 10);
      if (score >= 1 && score <= 10) {
        analysis.riskScore = score;
      }
    }

    // Extract risk profile
    const riskProfileMatch = textResponse.match(/Risk Profile:\s*(.*?)(?:\n|$)/i);
    if (riskProfileMatch && riskProfileMatch[1]) {
      analysis.riskProfile = riskProfileMatch[1].trim();
    }

    // Extract psychological insights
    const psychInsightsMatch = textResponse.match(/Psychological Insights:\s*(.*?)(?=\n\w|$)/is);
    if (psychInsightsMatch && psychInsightsMatch[1]) {
      analysis.psychologicalInsights = psychInsightsMatch[1].trim();
    }

    // Extract financial insights
    const finInsightsMatch = textResponse.match(/Financial Insights:\s*(.*?)(?=\n\w|$)/is);
    if (finInsightsMatch && finInsightsMatch[1]) {
      analysis.financialInsights = finInsightsMatch[1].trim();
    }

    // Extract recommendations
    const recommendationsMatch = textResponse.match(/Recommendations:\s*(.*?)(?=\n\w|$)/is);
    if (recommendationsMatch && recommendationsMatch[1]) {
      analysis.recommendations = recommendationsMatch[1].trim();
    }

    return analysis;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return createFallbackResponse();
  }
}

/**
 * Creates a fallback response when analysis fails
 */
function createFallbackResponse() {
  return {
    riskScore: 5,
    riskProfile: "Moderate",
    psychologicalInsights: "Unable to generate psychological insights at this time.",
    financialInsights: "Unable to generate financial insights at this time.",
    recommendations: "Please consult with a financial advisor for personalized recommendations."
  };
}
