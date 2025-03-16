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
    if (!userId) {
      throw new Error("Missing required userId parameter");
    }
    
    console.log(`Analyzing risk profile for user: ${userId.substring(0, 8)}...`);
    
    // Check if analysis already exists for this user to prevent duplicates
    console.log("Checking if analysis already exists for this user...");
    const existingAnalysis = await getAnalysisForUser(userId);
    
    if (existingAnalysis) {
      console.log(`Analysis already exists for user ${userId.substring(0, 8)}, returning existing data`);
      return {
        ...existingAnalysis,
        fromExisting: true
      };
    }
    
    console.log("No existing analysis found, generating new analysis...");
    
    // Use gemini-1.5-flash for better JSON compliance
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
    let documentId = '';
    
    try {
      console.log('Attempting to save analysis to Firestore...');
      
      // Changed collection name from 'userId' to 'geminiAnalyses'
      const docRef = db.collection('geminiAnalyses').doc();
      documentId = docRef.id;
      
      console.log(`Creating document with ID: ${docRef.id}`);
      
      // Prepare the data with userId from the token
      const analysisData = {
        userId, // The Google-provided UID
        riskScore: analysis.riskScore,
        riskProfile: analysis.riskProfile,
        psychologicalInsights: analysis.psychologicalInsights,
        financialInsights: analysis.financialInsights,
        recommendations: analysis.recommendations,
        createdAt: new Date(),
        id: docRef.id
      };
      
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
        userId, // The Google-provided UID
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

// Updated function to retrieve analysis from memory or Firestore
export async function getAnalysisForUser(userId: string) {
  if (!userId) {
    console.error("Missing userId parameter");
    return null;
  }
  
  try {
    console.log(`Getting analysis for user ${userId.substring(0, 8)}...`);
    console.log('Database and collection: wealthme-fi/geminiAnalyses');
    
    // Try Firestore with improved error logging
    try {
      console.log(`Querying Firestore collection 'geminiAnalyses' where userId == '${userId}'`);
      
      const snapshot = await db.collection('geminiAnalyses')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      console.log(`Query executed, got ${snapshot.size} results`);
      
      if (!snapshot.empty) {
        console.log(`✅ Found analysis in Firestore with ID: ${snapshot.docs[0].id}`);
        // Return the document data with ID included
        return {
          ...snapshot.docs[0].data(),
          id: snapshot.docs[0].id
        };
      }
      
      console.log('⚠️ No analysis found in Firestore for this user');
    } catch (firestoreErr) {
      console.error('❌ Error accessing Firestore:', firestoreErr);
      if (firestoreErr instanceof Error) {
        console.error('Error details:', firestoreErr.message);
        // Check for specific Firestore errors
        if (firestoreErr.message.includes('Missing or insufficient permissions')) {
          console.error('This appears to be a permissions issue - check Firestore rules');
        } else if (firestoreErr.message.includes('Failed to get document')) {
          console.error('The document or collection may not exist');
        } else if (firestoreErr.message.includes('order by requires an index')) {
          console.error('Index missing for the query - create a composite index for userId and createdAt');
        } else if (firestoreErr.message.includes('host')) {
          console.error('Firestore host configuration issue - check region settings');
        }
      }
      // Continue to memory lookup as fallback
    }
    
    // Check in-memory store as fallback (keep this part)
    const memoryEntries = Object.values(inMemoryStore)
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
    
    if (memoryEntries.length > 0) {
      console.log('Found analysis in memory store as fallback');
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
