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

export async function analyzeThroughChatGPT(data: AnalysisData): Promise<AnalysisResult> {
  try {
    // Format the data for ChatGPT
    const systemPrompt = `You are an expert financial analyst and behavioral psychologist. Analyze the user's financial data and questionnaire answers to create a comprehensive financial and psychological profile. Include:
1. A risk score from 1 to 10 (where 1 is most conservative and 10 is most aggressive)
2. A summary of their financial behavior and profile
3. Specific insights in these categories: Risk Tolerance, Financial Habits, Investment Approach, and Psychological Tendencies
4. A psychological profile report with explaination analyzing their relationship with money
5. 3-5 recommended actions they should take
${data.documentText ? '6. Analysis of financial documents they provided' : ''}

If there is insufficient information to provide a complete analysis, include 3-5 follow-up questions that would help you better understand their financial situation and psychology.`;

    // Create a prompt with all available data
    let prompt = 'Please analyze the following financial information:\n\n';

    if (data.questionnaireAnswers && Object.keys(data.questionnaireAnswers).length > 0) {
      prompt += '## Questionnaire Answers\n';
      Object.entries(data.questionnaireAnswers).forEach(([question, answer]) => {
        prompt += `- ${question}: ${answer}\n`;
      });
      prompt += '\n';
    }

    if (data.followUpAnswers && Object.keys(data.followUpAnswers).length > 0) {
      prompt += '## Follow-up Answers\n';
      Object.entries(data.followUpAnswers).forEach(([question, answer]) => {
        prompt += `- Question: ${question}\n  Answer: ${answer}\n`;
      });
      prompt += '\n';
    }

    if (data.documentText) {
      prompt += '## Document Content\n';
      prompt += data.documentText.substring(0, 5000) + '...\n\n';
    }

    if (data.userInfo) {
      prompt += '## User Info\n';
      if (data.userInfo.name) prompt += `- Name: ${data.userInfo.name}\n`;
      if (data.userInfo.email) prompt += `- Email: ${data.userInfo.email}\n`;
    }

    // Call the OpenAI API route
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemPrompt,
        options: {
          model: "gpt-4o",
          temperature: 0.7,
          maxTokens: 2500
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get analysis from ChatGPT');
    }

    const responseData = await response.json();
    const analysisText = responseData.text;

    // Parse the ChatGPT response into structured data
    return parseAnalysisResponse(analysisText);

  } catch (error) {
    console.error('Error in ChatGPT analysis:', error);
    throw error;
  }
}

// Helper function to extract structured data from ChatGPT's response
function parseAnalysisResponse(text: string): AnalysisResult {
  try {
    // Extract risk score
    const riskScoreMatch = text.match(/risk score[:\s]*([0-9]|10)/i);
    const riskScore = riskScoreMatch ? parseInt(riskScoreMatch[1]) : 5;

    // Extract summary
    let summary = '';
    const summaryMatch = text.match(/summary:?([\s\S]*?)(?=(insights:|psychological profile:|risk tolerance:|recommended actions:|follow-up questions:))/i);
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