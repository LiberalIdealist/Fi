import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize Gemini only on the server
let genAI: any = null;
if (typeof window === 'undefined') {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found, server functionality will be limited');
  } else {
    genAI = new GoogleGenerativeAI(apiKey);
  }
}

// Safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  // other safety settings...
];

/**
 * Complete financial profile analysis based on documents and questionnaire responses
 * This is the core function for analyzing user financial data
 */
async function analyzeFinancialProfile(
  userAnswers: Record<string, any>,
  documents: Array<{
    content: string,
    type: 'bank' | 'credit' | 'demat' | 'tax' | 'other'
  }> = []
) {
  // Server-side implementation
  if (typeof window === 'undefined' && genAI) {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro", // Use latest model
      safetySettings
    });
    
    const userInfoPrompt = `
      I need a comprehensive financial analysis for an Indian investor based on the following information:
      
      ## User Financial Information
      Monthly Income: ₹${userAnswers.monthlyIncome || 0}
      Monthly Savings: ₹${userAnswers.monthlySavings || 0}
      Monthly Expenses: ₹${userAnswers.monthlyExpenses || 0}
      
      // Additional information...
    `;
    
    try {
      const result = await model.generateContent(userInfoPrompt);
      const response = await result.response;
      const text = response.text();
      return parseJsonFromResponse(text);
    } catch (error) {
      console.error("Error analyzing financial profile with Gemini:", error);
      throw new Error("Failed to analyze financial profile");
    }
  } 
  // Client-side implementation - call API endpoint
  else {
    try {
      const response = await fetch('/api/financial-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAnswers, documents })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze financial profile');
      }
      
      const result = await response.json();
      return result.analysis;
    } catch (error) {
      console.error("Error calling financial analysis API:", error);
      throw error;
    }
  }
}

/**
 * Generate additional questions based on initial responses
 */
async function generateFollowUpQuestions(userAnswers: Record<string, any>) {
  // Server-side implementation
  if (typeof window === 'undefined' && genAI) {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings
    });
    
    const prompt = `
      Based on the following financial questionnaire responses, generate 3-5 follow-up questions 
      that would help provide a more comprehensive financial analysis:
      
      ${JSON.stringify(userAnswers, null, 2)}
      
      Format the response as a JSON array of questions.
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const parsedResponse = parseJsonFromResponse(text);
      return Array.isArray(parsedResponse) ? parsedResponse : [];
    } catch (error) {
      console.error("Error generating follow-up questions:", error);
      throw new Error("Failed to generate follow-up questions");
    }
  } 
  // Client-side implementation
  else {
    try {
      const response = await fetch('/api/follow-up-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAnswers })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate follow-up questions');
      }
      
      const result = await response.json();
      return result.questions;
    } catch (error) {
      console.error("Error generating follow-up questions:", error);
      throw error;
    }
  }
}

/**
 * Save analyzed profile data for further processing
 */
async function saveFinancialAnalysis(userId: string, analysisData: any) {
  try {
    const response = await fetch('/api/financial-profile/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, analysisData })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save financial analysis');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error saving financial analysis:', error);
    throw new Error('Failed to save financial analysis');
  }
}

/**
 * Generate comprehensive financial report with visualizations
 */
async function generateFinancialReport(profileData: any) {
  if (typeof window === 'undefined' && genAI) {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings
    });
    
    const prompt = `
      Generate a comprehensive financial report based on the following data:
      
      ${JSON.stringify(profileData, null, 2)}
      
      Include sections for:
      1. Executive Summary
      2. Current Financial Position
      3. Risk Analysis
      4. Investment Recommendations
      5. Tax Planning Opportunities
      6. Insurance Gaps (if any)
      7. Action Steps
      
      Format the response as a structured JSON object.
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return parseJsonFromResponse(text);
    } catch (error) {
      console.error("Error generating financial report:", error);
      throw new Error("Failed to generate financial report");
    }
  }
  // Client-side implementation
  else {
    try {
      const response = await fetch('/api/financial-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileData })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate financial report');
      }
      
      const result = await response.json();
      return result.report;
    } catch (error) {
      console.error("Error generating financial report:", error);
      throw error;
    }
  }
}

/**
 * Helper function to parse JSON from AI response
 */
function parseJsonFromResponse(responseText: string) {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }
    const jsonStr = jsonMatch[0];
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to parse analysis response");
  }
}

// Export the financial profile related functions
export {
  analyzeFinancialProfile,
  generateFollowUpQuestions,
  saveFinancialAnalysis,
  generateFinancialReport
};