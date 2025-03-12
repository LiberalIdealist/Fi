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
      
      // Then make the actual request
      const response = await api.post('/gemini/questionnaire', questionnaireData);
      return response.data;
    } catch (error: any) {
      console.error('Questionnaire submission error:', 
        error.response?.data || error.message || 'Unknown error');
      
      // Rethrow with more context
      throw new Error(error.response?.data?.error || 
        'Failed to submit questionnaire. Please try again.');
    }
  },
  
  // Submit follow-up question responses
  submitFollowUp: async (data: any, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post('/models/chat/geminiAnalysis', data, { headers });
    return response.data;
  },
  
  // Get analysis results
  getAnalysisResults: async (userId: string) => {
    const response = await api.get(`/models/chat/analysisResults/${userId}`);
    return response.data;
  }
};