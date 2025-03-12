"use client";

import { useAuth } from '../../../contexts/authContext';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import { Chatbot } from '../../../components/chat/Chatbot';

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">AI Financial Assistant</h1>
        
        <div className="mb-8">
          <p className="text-gray-300">
            Ask our AI assistant any questions about your finances, investments, or financial planning.
            The assistant has access to your profile data and document analysis to provide personalized responses.
          </p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <Chatbot />
        </div>
      </div>
    </ProtectedRoute>
  );
}