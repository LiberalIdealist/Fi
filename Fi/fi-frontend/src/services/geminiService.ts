import api from '../utils/api';

export const geminiService = {
  // Submit initial questionnaire answers
  submitQuestionnaire: async (questionnaireData: any) => {
    try {
      console.log('Submitting questionnaire data:', questionnaireData);
      
      // First check backend health
      await api.get('/health')
        .then(() => console.log('Backend connection successful'))
        .catch(err => console.error('Backend health check failed:', err));
      
      // Add user ID to request if missing
      if (!questionnaireData.userId) {
        console.warn('No userId provided in questionnaire data');
        const userId = localStorage.getItem('fi_user_id'); 
        if (userId) {
          questionnaireData.userId = userId;
          console.log('Added userId from local storage:', userId);
        }
      }
      
      // Ensure the answers are correctly formatted
      const formattedData = {
        answers: questionnaireData.data,
        userId: questionnaireData.userId
      };

      // Then make the actual request
      const response = await api.post('/gemini/questionnaire', formattedData);
      return response.data;
    } catch (error: any) {
      console.error('Questionnaire submission error:', 
        error.response?.data || error.message || 'Unknown error');
      
      // Log the complete error for debugging
      console.error('Complete error details:', error);
      
      // Provide a user-friendly error message
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to submit questionnaire. Please try again.'
      );
    }
  },
  submitFollowUp: async (data: any, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post('/gemini/analysis', data, { headers });
    return response.data;
  },
  getAnalysisResults: async (userId: string) => {
    const response = await api.get(`/gemini/analysis/${userId}`);
    return response.data;
  },
  getAnalysisForUser: async (userId: string) => {
    try {
      // First try regular API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gemini/analysis-fallback?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('fi_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analysis: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getAnalysisForUser:', error);
      
      // Create fallback data in frontend as a last resort
      return {
        riskScore: 5,
        riskProfile: "Moderate (Default)",
        psychologicalInsights: "A balanced approach to investing is recommended.",
        financialInsights: "Consider building an emergency fund before pursuing aggressive investments.",
        recommendations: "Regular investment contributions are crucial for long-term financial growth.",
        fromClientFallback: true
      };
    }
  }
};