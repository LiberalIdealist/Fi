import axios from 'axios';
import { FinancialAnalysis, QuestionnaireAnswers, Insight } from '@/types/shared';

// Configuration for Vertex AI
const VERTEX_AI_PROJECT_ID = process.env.NEXT_PUBLIC_VERTEX_AI_PROJECT_ID;
const VERTEX_AI_LOCATION = process.env.NEXT_PUBLIC_VERTEX_AI_LOCATION || 'us-central1';
const VERTEX_AI_MODEL = 'gemini-1.5-pro';
const VERTEX_AI_BASE_URL = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_AI_PROJECT_ID}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/${VERTEX_AI_MODEL}:predict`;

// This is a placeholder for the actual Vertex AI integration
// In production, you would use proper API keys and authentication
export interface VertexAIRequest {
  questionnaireAnswers: Record<string, string>;
  documentAnalysis?: Record<string, any>;
  userInfo?: {
    name?: string | null;  // <-- Updated to accept null
    email?: string | null; // <-- Updated to accept null
  };
}

export interface VertexAIResponse extends FinancialAnalysis {
  suggestedFollowUps?: string[];
}

// Function to get access token
async function getAccessToken(): Promise<string> {
  try {
    // In production, you would implement proper authentication
    // For Google Cloud, you might use the Google Auth Library
    // This is a placeholder for the actual implementation
    const response = await fetch('/api/auth/vertex-ai-token');
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Failed to get access token for Vertex AI:', error);
    throw new Error('Authentication failed');
  }
}

// Main function to analyze financial profile with Vertex AI
export async function analyzeFinancialProfile(data: VertexAIRequest): Promise<VertexAIResponse> {
  try {
    // Get access token for Vertex AI
    const accessToken = await getAccessToken();

    // Initial analysis based on questionnaire answers
    const initialAnalysis = await performInitialAnalysis(data, accessToken);
    
    // Check if we need follow-up questions
    if (initialAnalysis.confidenceScore < 0.85) {
      // Generate and ask follow-up questions until we have sufficient data
      const enhancedData = await askFollowUpQuestions(data, initialAnalysis, accessToken);
      
      // Perform final analysis with all collected data
      return await performFinalAnalysis(enhancedData, accessToken);
    }
    
    // If initial analysis is sufficient, return it
    return initialAnalysis.analysis;
  } catch (error) {
    console.error('Error in Vertex AI analysis:', error);
    throw new Error('Failed to analyze financial profile');
  }
}

// Perform initial analysis with questionnaire data
async function performInitialAnalysis(data: VertexAIRequest, accessToken: string): Promise<{
  analysis: FinancialAnalysis;
  confidenceScore: number;
  suggestedFollowUps: string[];
}> {
  const payload = {
    instances: [{
      content: generateInitialPrompt(data),
    }],
    parameters: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      topP: 0.8,
      topK: 40
    }
  };

  const response = await fetch(VERTEX_AI_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vertex AI API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  
  try {
    // Extract the financial analysis JSON from the response
    const analysisText = result.predictions[0].content;
    const analysisJson = JSON.parse(
      analysisText.substring(
        analysisText.indexOf('{'),
        analysisText.lastIndexOf('}') + 1
      )
    );
    
    return {
      analysis: {
        id: `analysis-${Date.now()}`,
        userId: data.userInfo?.email || 'anonymous',
        riskScore: analysisJson.riskScore,
        summary: analysisJson.summary,
        insights: analysisJson.insights,
        psychologicalProfile: analysisJson.psychologicalProfile,
        recommendedActions: analysisJson.recommendedActions,
        timestamp: new Date().toISOString()
      },
      confidenceScore: analysisJson.confidenceScore || 0,
      suggestedFollowUps: analysisJson.suggestedFollowUps || []
    };
  } catch (error) {
    console.error('Error parsing Vertex AI response:', error);
    throw new Error('Failed to parse financial analysis from AI response');
  }
}

// Ask follow-up questions to gather more data
async function askFollowUpQuestions(
  data: VertexAIRequest,
  initialAnalysis: { 
    analysis: FinancialAnalysis; 
    confidenceScore: number;
    suggestedFollowUps: string[];
  },
  accessToken: string
): Promise<VertexAIRequest> {
  const enhancedData = { ...data };
  const additionalAnswers: Record<string, string> = {};
  let currentConfidence = initialAnalysis.confidenceScore;
  
  // Use the Vertex AI conversation API for follow-up questions
  let followUpQuestions = initialAnalysis.suggestedFollowUps;
  let questionIndex = 0;
  
  // Ask up to 5 follow-up questions or until confidence is high enough
  while (questionIndex < followUpQuestions.length && currentConfidence < 0.9 && questionIndex < 5) {
    const question = followUpQuestions[questionIndex];
    
    // In a real application, you would present this question to the user in your UI
    // and collect their response. Here, we're simulating that interaction.
    
    // This would be replaced with actual user input:
    const userResponse = await simulateUserResponse(question);
    
    // Add this answer to our enhanced data
    additionalAnswers[`followUp${questionIndex + 1}`] = userResponse;
    
    // Get updated confidence and additional questions
    const updatePayload = {
      instances: [{
        content: generateFollowUpAnalysisPrompt(data, additionalAnswers, question, userResponse),
      }],
      parameters: {
        temperature: 0.2,
        maxOutputTokens: 1024,
        topP: 0.8,
        topK: 40
      }
    };
    
    const response = await fetch(VERTEX_AI_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });
    
    if (!response.ok) {
      console.error('Error with follow-up analysis');
      break;
    }
    
    const updateResult = await response.json();
    
    try {
      const updateJson = JSON.parse(
        updateResult.predictions[0].content.substring(
          updateResult.predictions[0].content.indexOf('{'),
          updateResult.predictions[0].content.lastIndexOf('}') + 1
        )
      );
      
      currentConfidence = updateJson.confidenceScore || currentConfidence;
      
      // If AI suggests new questions, add them to our list
      if (updateJson.additionalQuestions && updateJson.additionalQuestions.length > 0) {
        followUpQuestions = [
          ...followUpQuestions, 
          ...updateJson.additionalQuestions
        ];
      }
      
    } catch (error) {
      console.error('Error parsing follow-up response:', error);
    }
    
    questionIndex++;
  }
  
  // Add all additional answers to the enhanced data
  enhancedData.questionnaireAnswers = {
    ...enhancedData.questionnaireAnswers,
    ...additionalAnswers
  };
  
  return enhancedData;
}

// In production, this would be replaced with actual UI interaction
async function simulateUserResponse(question: string): Promise<string> {
  // This is a placeholder. In a real application, you would:
  // 1. Display the question to the user in your UI
  // 2. Wait for their response
  // 3. Return their answer
  
  console.log('AI is asking:', question);
  
  // Simulate user thinking time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For testing only - generate random responses
  const possibleResponses = [
    "I'm somewhat comfortable with that approach.",
    "I prefer to be more conservative with my investments.",
    "I'm willing to take calculated risks for better returns.",
    "I haven't really thought about that before.",
    "That's something I'm very interested in exploring.",
    "I'm not sure, I would need to research more."
  ];
  
  return possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
}

// Generate final analysis with all collected data
async function performFinalAnalysis(enhancedData: VertexAIRequest, accessToken: string): Promise<FinancialAnalysis> {
  const payload = {
    instances: [{
      content: generateFinalAnalysisPrompt(enhancedData),
    }],
    parameters: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      topP: 0.8,
      topK: 40
    }
  };

  const response = await fetch(VERTEX_AI_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vertex AI API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  
  try {
    // Extract the financial analysis JSON
    const analysisText = result.predictions[0].content;
    const analysisJson = JSON.parse(
      analysisText.substring(
        analysisText.indexOf('{'),
        analysisText.lastIndexOf('}') + 1
      )
    );
    
    return {
      id: `analysis-${Date.now()}`,
      userId: enhancedData.userInfo?.email || 'anonymous',
      riskScore: analysisJson.riskScore,
      summary: analysisJson.summary,
      insights: analysisJson.insights,
      psychologicalProfile: analysisJson.psychologicalProfile,
      recommendedActions: analysisJson.recommendedActions,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing final analysis:', error);
    throw new Error('Failed to parse financial analysis from AI response');
  }
}

// Generate the initial prompt for Vertex AI
function generateInitialPrompt(data: VertexAIRequest): string {
  const { questionnaireAnswers, documentAnalysis, userInfo } = data;
  
  // Convert questionnaire answers to a readable format
  const formattedAnswers = Object.entries(questionnaireAnswers)
    .map(([id, answer]) => `${id}: ${answer}`)
    .join('\n');
  
  return `
You are an expert financial advisor and psychological profiler specialized in Indian markets. You need to analyze a user's investment psychology and risk appetite based on their questionnaire responses.

USER INFORMATION:
${userInfo?.name ? `Name: ${userInfo.name}` : 'Name: Not provided'}
${userInfo?.email ? `Email: ${userInfo.email}` : 'Email: Not provided'}

QUESTIONNAIRE RESPONSES:
${formattedAnswers}

DOCUMENT ANALYSIS:
${documentAnalysis ? 'User has uploaded financial documents for analysis.' : 'No financial documents provided.'}

CURRENT INDIAN MARKET CONTEXT (February 2025):
- The Indian stock market has shown significant volatility in recent months
- Interest rates have been adjusted by the RBI to manage inflation
- Global economic tensions are affecting emerging markets including India
- Digital transformation and AI adoption are accelerating across sectors
- Regulatory changes are impacting financial markets and investment products

Based on this information:
1. Assess the user's investment psychology and risk appetite
2. Determine a risk score from 1-10 (where 1 is extremely conservative and 10 is highly aggressive)
3. Provide psychological insights into their financial behavior
4. Recommend specific actions tailored to Indian market conditions
5. Assess your confidence level in this analysis (confidenceScore between 0-1)
6. If your confidence is below 0.85, suggest specific follow-up questions that would help gather more valuable information

Respond in the following JSON format:
{
  "riskScore": number,
  "summary": "brief overview of their financial profile",
  "insights": [
    {
      "category": "Risk Tolerance",
      "text": "detailed insight about risk tolerance"
    },
    {
      "category": "Financial Habits",
      "text": "detailed insight about financial habits"
    },
    {
      "category": "Investment Approach",
      "text": "detailed insight about their approach to investments"
    },
    {
      "category": "Market Context Alignment",
      "text": "how their profile aligns with current Indian market conditions"
    }
  ],
  "psychologicalProfile": "detailed psychological assessment of financial behavior",
  "recommendedActions": [
    "specific action recommendation 1",
    "specific action recommendation 2",
    "specific action recommendation 3",
    "specific action recommendation 4",
    "specific action recommendation 5"
  ],
  "confidenceScore": number between 0 and 1,
  "suggestedFollowUps": [
    "follow-up question 1",
    "follow-up question 2",
    "follow-up question 3"
  ]
}

Only provide the JSON response without additional text.
`;
}

// Generate prompt for follow-up question analysis
function generateFollowUpAnalysisPrompt(
  originalData: VertexAIRequest,
  additionalAnswers: Record<string, string>,
  currentQuestion: string,
  userResponse: string
): string {
  return `
You are analyzing a user's investment psychology and risk appetite. You previously asked this follow-up question:

"${currentQuestion}"

The user responded:
"${userResponse}"

Given this new information and their previous questionnaire responses, reassess:
1. Whether this new information changes your understanding of their risk profile
2. Your confidence level in the assessment (between 0-1)
3. What additional questions would be most valuable to further clarify their financial psychology

Respond in the following JSON format:
{
  "confidenceScore": number between 0 and 1,
  "additionalQuestions": [
    "specific follow-up question 1",
    "specific follow-up question 2"
  ]
}

Only provide the JSON response without additional text.
`;
}

// Generate prompt for final analysis
function generateFinalAnalysisPrompt(data: VertexAIRequest): string {
  const { questionnaireAnswers, documentAnalysis, userInfo } = data;
  
  // Extract initial questionnaire answers and follow-up answers
  const initialQuestions = Object.entries(questionnaireAnswers)
    .filter(([key]) => !key.startsWith('followUp'))
    .map(([id, answer]) => `${id}: ${answer}`)
    .join('\n');
  
  const followUps = Object.entries(questionnaireAnswers)
    .filter(([key]) => key.startsWith('followUp'))
    .map(([id, answer]) => `${id}: ${answer}`)
    .join('\n');
  
  return `
You are an expert financial advisor and psychological profiler specialized in Indian markets. You need to create a comprehensive financial profile and investment recommendation for a user based on all available information.

USER INFORMATION:
${userInfo?.name ? `Name: ${userInfo.name}` : 'Name: Not provided'}
${userInfo?.email ? `Email: ${userInfo.email}` : 'Email: Not provided'}

INITIAL QUESTIONNAIRE RESPONSES:
${initialQuestions}

FOLLOW-UP RESPONSES:
${followUps}

DOCUMENT ANALYSIS:
${documentAnalysis ? 'User has uploaded financial documents for analysis.' : 'No financial documents provided.'}

CURRENT INDIAN MARKET CONTEXT (February 2025):
- The Indian stock market has shown significant volatility in recent months
- Interest rates have been adjusted by the RBI to manage inflation
- Global economic tensions are affecting emerging markets including India
- Digital transformation and AI adoption are accelerating across sectors
- Regulatory changes are impacting financial markets and investment products

Based on ALL this information, provide a COMPLETE and COMPREHENSIVE analysis:
1. Assess the user's investment psychology and risk appetite with high precision
2. Determine a risk score from 1-10 (where 1 is extremely conservative and 10 is highly aggressive)
3. Provide deep psychological insights into their financial behavior patterns
4. Recommend specific actions tailored to current Indian market conditions
5. Include specific investment vehicles appropriate for their profile (mutual funds, ETFs, etc.)
6. Address tax efficiency considerations relevant to Indian investors

Respond in the following JSON format:
{
  "riskScore": number,
  "summary": "comprehensive overview of their financial profile",
  "insights": [
    {
      "category": "Risk Tolerance",
      "text": "detailed insight about risk tolerance"
    },
    {
      "category": "Financial Habits",
      "text": "detailed insight about financial habits"
    },
    {
      "category": "Investment Approach",
      "text": "detailed insight about their approach to investments"
    },
    {
      "category": "Market Context Alignment",
      "text": "how their profile aligns with current Indian market conditions"
    },
    {
      "category": "Economic Outlook Consideration",
      "text": "how their strategy addresses current economic realities"
    }
  ],
  "psychologicalProfile": "comprehensive psychological assessment of financial decision-making patterns, biases, and emotional relationships with money",
  "recommendedActions": [
    "specific action recommendation 1",
    "specific action recommendation 2",
    "specific action recommendation 3",
    "specific action recommendation 4",
    "specific action recommendation 5"
  ]
}

Only provide the JSON response without additional text.
`;
}