import api from '../utils/api';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export const chatService = {
  // Send a message to the chatbot
  sendMessage: async (message: string, sessionId?: string) => {
    const response = await api.post('/chat/chatGPTProfiling', {
      message,
      sessionId
    });
    return response.data;
  },
  
  // Get all chat sessions for the current user
  getSessions: async () => {
    const response = await api.get('/chat/sessions');
    return response.data;
  },
  
  // Get a specific chat session
  getSession: async (sessionId: string) => {
    const response = await api.get(`/chat/sessions/${sessionId}`);
    return response.data;
  },
  
  // Create a new chat session
  createSession: async (title?: string) => {
    const response = await api.post('/chat/sessions', { title });
    return response.data;
  },
  
  // Get personalized financial advice based on user profile
  getFinancialAdvice: async (query?: string) => {
    const response = await api.post('/chat/financial-advice', { query });
    return response.data;
  },
  
  // Get investment recommendations based on user profile
  getInvestmentRecommendations: async () => {
    const response = await api.get('/chat/investment-recommendations');
    return response.data;
  },
  
  // Delete a chat session
  deleteSession: async (sessionId: string) => {
    const response = await api.delete(`/chat/sessions/${sessionId}`);
    return response.data;
  },
  
  // Clear all messages in a chat session
  clearSession: async (sessionId: string) => {
    const response = await api.post(`/chat/sessions/${sessionId}/clear`);
    return response.data;
  }
};