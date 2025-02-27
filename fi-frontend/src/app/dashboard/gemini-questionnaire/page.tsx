'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { RiArrowLeftLine, RiLoader4Line } from 'react-icons/ri';
import FinancialQuestionnaire from '@/components/FinancialQuestionnaire';
import FollowUpQuestions from '@/components/FollowUpQuestions';
import { QuestionnaireAnswers } from '@/types/shared';
import { useRouter } from 'next/navigation';

export default function GeminiQuestionnairePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<QuestionnaireAnswers>({});
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState('questionnaire'); // 'questionnaire', 'followup', 'complete'

  // Handle questionnaire submission
  const handleQuestionnaireSubmit = async (answers: QuestionnaireAnswers) => {
    try {
      setQuestionnaireAnswers(answers);
      setLoading(true);
      
      // Submit answers to API
      const response = await fetch('/api/gemini-questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process questionnaire');
      }
      
      const data = await response.json();
      
      // Check if there are follow-up questions
      if (data.followUpQuestions && data.followUpQuestions.length > 0) {
        setFollowUpQuestions(data.followUpQuestions);
        setStep('followup');
        setShowFollowUps(true);
      } else {
        // No follow-ups needed, move to profile page
        router.push('/dashboard/financial-profile');
      }
      
      return Promise.resolve();
    } catch (err) {
      console.error('Error submitting questionnaire:', err);
      setError('Failed to submit questionnaire');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle follow-up answers
  const handleFollowUpComplete = async () => {
    try {
      setLoading(true);
      
      // Submit follow-up answers
      const response = await fetch('/api/gemini-questionnaire/followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          initialAnswers: questionnaireAnswers,
          followUpAnswers 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process follow-up questions');
      }
      
      setStep('complete');
      
      // Redirect to profile page
      router.push('/dashboard/financial-profile');
    } catch (err) {
      console.error('Error submitting follow-up answers:', err);
      setError('Failed to submit follow-up answers');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle follow-up answer
  const handleFollowUpAnswer = (question: string, answer: string) => {
    setFollowUpAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-white">
          <RiArrowLeftLine size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Financial Questionnaire</h1>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/40 text-red-300 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <p>{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-sm text-red-400 mt-2 hover:text-red-300"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <RiLoader4Line className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Processing your responses...</p>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
        {step === 'questionnaire' && !loading && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Financial Profile Questionnaire</h2>
            <p className="text-gray-400 mb-6">
              Answer these questions to help our AI understand your financial situation and goals.
              This will help us provide personalized insights and recommendations.
            </p>
            <FinancialQuestionnaire 
              onSubmit={handleQuestionnaireSubmit} 
              initialAnswers={questionnaireAnswers}
            />
          </div>
        )}
        
        {step === 'followup' && !loading && showFollowUps && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Additional Questions</h2>
            <p className="text-gray-400 mb-6">
              Based on your responses, our AI has a few more questions to better understand your financial profile.
            </p>
            <FollowUpQuestions
              questions={followUpQuestions}
              onAnswer={handleFollowUpAnswer}
              onComplete={handleFollowUpComplete}
            />
          </div>
        )}
        
        {step === 'complete' && !loading && (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-4">Questionnaire Complete!</h2>
            <p className="text-gray-400 mb-6">
              Thank you for providing this information. Your financial profile is being generated.
            </p>
            <Link href="/dashboard/financial-profile" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
              View Your Financial Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}