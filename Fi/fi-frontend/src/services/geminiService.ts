import api from '../utils/api';

export const geminiService = {
  // Submit initial questionnaire answers
  submitQuestionnaire: async (data: any) => {
    const response = await api.post('/models/chat/geminiAnalysis', data);
    return response.data;
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