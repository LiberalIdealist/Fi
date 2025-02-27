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

export async function analyzeWithGemini(data: AnalysisData): Promise<AnalysisResult> {
  try {
    // Format the data for Gemini
    const prompt = formatPromptForGemini(data);

    // Call the Gemini API route
    const response = await fetch('/api/gemini-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        documentText: data.documentText || '',
        questionnaireData: data.questionnaireAnswers || {},
        followUpAnswers: data.followUpAnswers || {},
        userInfo: data.userInfo || {}
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze with Gemini');
    }

    const responseData = await response.json();
    return responseData.analysis;
  } catch (error) {
    console.error('Error in Gemini analysis:', error);
    throw error;
  }
}

// Helper function to format the prompt for Gemini
function formatPromptForGemini(data: AnalysisData): string {
  let prompt = 'Please analyze the following financial information and provide insights:\n\n';

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

  if (data.userInfo) {
    prompt += '## User Info\n';
    if (data.userInfo.name) prompt += `- Name: ${data.userInfo.name}\n`;
    if (data.userInfo.email) prompt += `- Email: ${data.userInfo.email}\n`;
    prompt += '\n';
  }

  return prompt;
}