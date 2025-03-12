"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/authContext';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import FinancialQuestionnaire from '../../../components/questionnaire/FinancialQuestionnaire';
import FollowUpQuestions from '../../../components/questionnaire/FollowUpQuestions';

export default function QuestionnairePage() {
  const router = useRouter();
  const [step, setStep] = useState<'initial' | 'followUp' | 'complete'>('initial');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  
  const handleInitialSubmit = (initialAnswers: Record<string, string>, followUpQs?: string[]) => {
    setAnswers(initialAnswers);
    if (followUpQs && followUpQs.length > 0) {
      setFollowUpQuestions(followUpQs);
      setStep('followUp');
    } else {
      setStep('complete');
      // Wait a moment and then redirect to the analysis page
      setTimeout(() => {
        router.push('/dashboard/analysis');
      }, 2000);
    }
  };
  
  const handleFollowUpComplete = (profile: any) => {
    setStep('complete');
    // Wait a moment and then redirect to the analysis page
    setTimeout(() => {
      router.push('/dashboard/analysis');
    }, 2000);
  };
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Financial Questionnaire</h1>
        
        {step === 'initial' && (
          <div className="mb-8">
            <p className="text-gray-300 mb-6">
              Please answer the following questions so we can better understand your financial situation and goals.
              This will help us provide personalized advice and recommendations.
            </p>
            
            <FinancialQuestionnaire onSubmit={handleInitialSubmit} />
          </div>
        )}
        
        {step === 'followUp' && followUpQuestions.length > 0 && (
          <div className="mb-8">
            <p className="text-gray-300 mb-6">
              Based on your answers, we have a few follow-up questions to better understand your financial situation.
            </p>
            
            <FollowUpQuestions 
              questions={followUpQuestions} 
              onComplete={handleFollowUpComplete} 
            />
          </div>
        )}
        
        {step === 'complete' && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-300 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">Questionnaire Completed!</h3>
            <p className="mb-4">Thank you for completing the financial questionnaire.</p>
            <p>You will be redirected to your analysis results shortly...</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}