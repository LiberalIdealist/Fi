"use client";

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { geminiService } from '../../services/geminiService';

interface FollowUpQuestionsProps {
  questions: string[];
  onComplete: (profile: any) => void;
}

const FollowUpQuestions = ({ questions, onComplete }: FollowUpQuestionsProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, getIdToken } = useAuth();

  const handleInputChange = (question: string, value: string) => {
    // Create a question ID by taking the first 6 words and making a slug
    const questionId = question
      .split(' ')
      .slice(0, 6)
      .join(' ')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '_');
      
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setError(null);
    setSuccess(null);
    
    if (!user) {
      setError("Authentication required. Please login to submit your responses.");
      return;
    }
    
    // Make sure all questions are answered
    if (Object.keys(answers).length < questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }
    
    try {
      setIsLoading(true);
      const token = await getIdToken();
      
      // Using service instead of direct fetch
      const response = await geminiService.submitFollowUp({
        action: 'processFollowUp',
        userId: user.uid,
        data: answers
      }, token);
      
      setSuccess("Your financial profile has been created successfully!");
      
      // Pass the user profile to the parent component
      onComplete(response.userProfile);
      
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to submit follow-up responses");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto p-4">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Additional Questions</h2>
        <p className="text-gray-300">
          To provide you with the most accurate financial analysis, please answer these follow-up questions:
        </p>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-300 p-4 rounded-lg">
            {success}
          </div>
        )}
        
        {questions.map((question, index) => {
          const questionId = question
            .split(' ')
            .slice(0, 6)
            .join(' ')
            .toLowerCase()
            .replace(/[^a-z0-9 ]/g, '')
            .replace(/\s+/g, '_');
            
          return (
            <div key={index} className="border border-gray-700 rounded-lg p-4">
              <div className="p-4">
                <div className="mb-2">
                  <label className="block text-gray-200 mb-2">{question}</label>
                  <textarea
                    onChange={(e) => handleInputChange(question, e.target.value)}
                    value={answers[questionId] || ''}
                    placeholder="Your answer"
                    rows={3}
                    className="w-full p-3 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          );
        })}
        
        <button 
          type="submit" 
          className={`bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded w-full
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : 'Complete Financial Profile'}
        </button>
      </div>
    </form>
  );
};

export default FollowUpQuestions;