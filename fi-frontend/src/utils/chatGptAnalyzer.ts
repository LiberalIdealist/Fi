import { QuestionnaireAnswers } from '@/types/shared';

interface AnalysisData {
  questionnaireAnswers?: QuestionnaireAnswers;
  documentText?: string;
  userInfo?: {
    name?: string | null;
    email?: string | null;
  };
  followUpAnswers?: Record<string, string>;
}

interface AnalysisResult {
  riskScore: number;
  summary: string;
  insights: Array<{ category: string; text: string }>;
  psychologicalProfile: string;
  recommendedActions: string[];
  suggestedFollowUps?: string[];
}

interface UserProfileData {
  questionnaireAnswers?: Record<string, string>;
  riskScore?: number;
  financialSummary?: string;
  insights?: Record<string, string>;
  userInfo?: {
    name?: string | null;
    email?: string | null;
  };
  documentAnalyses?: Array<{
    documentType: string;
    summary: string;
    createdAt: string;
  }>;
}

interface PortfolioRecommendation {
  fixedDeposits: {
    percentage: number;
    recommendations: Array<{
      type: string;
      term: string;
      expectedReturn: string;
      rationale: string;
    }>;
  };
  stocks: {
    percentage: number;
    recommendations: Array<{
      name: string;
      sector: string;
      rationale: string;
    }>;
  };
  mutualFunds: {
    percentage: number;
    debt: Array<{
      name: string;
      type: string;
      rationale: string;
    }>;
    hybrid: Array<{
      name: string;
      type: string;
      rationale: string;
    }>;
    equity: Array<{
      name: string;
      type: string;
      rationale: string;
    }>;
  };
  insurance: {
    health: {
      coverAmount: string;
      type: string;
      rationale: string;
    };
    life: {
      coverAmount: string;
      type: string;
      rationale: string;
    };
    term: {
      coverAmount: string;
      term: string;
      rationale: string;
    };
  };
}

interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface ChatGptResult {
  userProfile: string;
  portfolio: PortfolioRecommendation;
  swotAnalysis: SwotAnalysis;
}

export async function analyzeThroughChatGPT(data: AnalysisData): Promise<AnalysisResult> {
  try {
    // Format the data for ChatGPT
    const text = data.documentText || '';
    let summary = '';
    const summaryMatch = text.match(/summary:?([\s\S]*?)(?=(insights:|risk tolerance:|recommended actions:|follow-up questions:))/i);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim();
    }

    // Extract insights
    const insights = [];
    const categories = ['risk tolerance', 'financial habits', 'investment approach', 'psychological tendencies'];
    
    for (const category of categories) {
      const regex = new RegExp(`${category}:?([\\s\\S]*?)(?=(risk tolerance:|financial habits:|investment approach:|psychological tendencies:|psychological profile:|recommended actions:|follow-up questions:))|${category}:?([\\s\\S]*)`, 'i');
      const match = text.match(regex);
      if (match) {
        const content = (match[1] || match[3] || '').trim();
        if (content) {
          insights.push({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            text: content
          });
        }
      }
    }

    // Extract psychological profile
    let psychologicalProfile = '';
    const profileMatch = text.match(/psychological profile:?([\s\S]*?)(?=(insights:|risk tolerance:|recommended actions:|follow-up questions:))/i);
    if (profileMatch && profileMatch[1]) {
      psychologicalProfile = profileMatch[1].trim();
    }

    // Extract recommended actions
    let recommendedActions: string[] = [];
    const actionsMatch = text.match(/recommended actions:?([\s\S]*?)(?=(insights:|risk tolerance:|follow-up questions:))|recommended actions:?([\s\S]*)/i);
    if (actionsMatch) {
      const actionsText = (actionsMatch[1] || actionsMatch[3] || '').trim();
      recommendedActions = actionsText
        .split(/[\n\r]/)
        .map(line => line.replace(/^[0-9-.\s]*/, '').trim())
        .filter(line => line.length > 0);
    }

    // Extract follow-up questions if present
    let suggestedFollowUps: string[] | undefined = undefined;
    const followUpsMatch = text.match(/follow-up questions:?([\s\S]*)/i);
    if (followUpsMatch && followUpsMatch[1]) {
      const followUpsText = followUpsMatch[1].trim();
      suggestedFollowUps = followUpsText
        .split(/[\n\r]/)
        .map(line => line.replace(/^[0-9-.\s]*/, '').trim())
        .filter(line => line.length > 0 && line.includes('?'));
    }

    return {
      riskScore,
      summary,
      insights,
      psychologicalProfile,
      recommendedActions,
      suggestedFollowUps
    };
  } catch (error) {
    console.error('Error parsing ChatGPT response:', error);
    // Return a default structure with an error message
    return {
      riskScore: 5,
      summary: "Unable to generate summary due to parsing error",
      insights: [{
        category: "Error",
        text: "There was an error parsing the analysis response. Please try again."
      }],
      psychologicalProfile: "Profile unavailable due to processing error",
      recommendedActions: ["Contact support for assistance"]
    };
  }
}

export async function generatePortfolioWithChatGPT(data: UserProfileData): Promise<ChatGptResult> {
  try {
    // Call the ChatGPT API route
    const response = await fetch('/api/chatgpt-portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate portfolio with ChatGPT');
    }

    const responseData = await response.json();
    return responseData.analysis;
  } catch (error) {
    console.error('Error in ChatGPT portfolio generation:', error);
    throw error;
  }
}