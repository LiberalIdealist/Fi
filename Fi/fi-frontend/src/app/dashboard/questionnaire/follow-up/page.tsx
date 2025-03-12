"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/authContext';
import ProtectedRoute from '../../../../components/common/ProtectedRoute';
import FollowUpQuestions from '../../../../components/questionnaire/FollowUpQuestions';

// Create a client component that uses useSearchParams
function FollowUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get questions from URL parameters
    const questionsParam = searchParams.get('questions');
    
    if (questionsParam) {
      try {
        // Questions are passed as a JSON encoded and URI encoded array
        const decodedQuestions = JSON.parse(decodeURIComponent(questionsParam));
        if (Array.isArray(decodedQuestions)) {
          setQuestions(decodedQuestions);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Failed to parse questions from URL", e);
      }
    }

    // If we couldn't get questions from URL, check session storage
    const storedQuestions = sessionStorage.getItem('followUpQuestions');
    if (storedQuestions) {
      try {
        const parsedQuestions = JSON.parse(storedQuestions);
        setQuestions(parsedQuestions);
      } catch (e) {
        setError("Failed to load follow-up questions. Please return to the questionnaire.");
      }
    } else {
      setError("No follow-up questions found. Please complete the initial questionnaire first.");
    }
    
    setLoading(false);
  }, [searchParams]);

  const handleComplete = (profile: any) => {
    // Clear the stored questions after completion
    sessionStorage.removeItem('followUpQuestions');
    
    // Wait a moment before redirecting to show success message
    setTimeout(() => {
      router.push('/dashboard/analysis');
    }, 2000);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Follow-Up Questions</h1>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-6 rounded-lg text-center">
            <p className="font-bold mb-2">Error</p>
            <p>{error}</p>
            <button 
              onClick={() => router.push('/dashboard/questionnaire')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
            >
              Return to Questionnaire
            </button>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 text-yellow-300 p-6 rounded-lg text-center">
            <p className="font-bold mb-2">No Additional Questions</p>
            <p>We have all the information we need to create your profile.</p>
            <button 
              onClick={() => router.push('/dashboard/analysis')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
            >
              View Your Analysis
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="mb-6">
              <p className="text-gray-300">
                Based on your initial responses, we need some additional information to provide you with 
                the most accurate financial analysis and recommendations. Please answer these follow-up questions.
              </p>
            </div>
            
            <FollowUpQuestions 
              questions={questions} 
              onComplete={handleComplete} 
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

// Main page component with Suspense boundary
export default function FollowUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FollowUpContent />
    </Suspense>
  );
}