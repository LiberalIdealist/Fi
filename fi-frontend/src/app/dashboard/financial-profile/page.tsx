'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import PDFUploader from '@/components/PDFUploader';
import FinancialQuestionnaire from '@/components/FinancialQuestionnaire';
import FollowUpQuestions from '@/components/FollowUpQuestions';
import { RiLoader4Line } from 'react-icons/ri';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error' | 'analyzing';
type ProfileStage = 'initial' | 'document-upload' | 'questionnaire' | 'follow-up' | 'analysis' | 'complete';

interface AnalysisResult {
  id: string;
  userId: string;
  riskScore: number;
  summary: string;
  insights: {
    category: string;
    text: string;
  }[];
  psychologicalProfile: string;
  recommendedActions: string[];
  timestamp: string;
}

export default function FinancialProfilePage() {
  const { data: session } = useSession();
  const [profileStage, setProfileStage] = useState<ProfileStage>('initial');
  const [documentAnalysis, setDocumentAnalysis] = useState<any[]>([]);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, any>>({});
  const [finalAnalysis, setFinalAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Added missing state

  // Step 1: Document Upload and Analysis
  const handleDocumentProcessed = (docData: {
    documentId: string;
    documentType: 'bank' | 'credit' | 'demat' | 'tax' | 'other';
    fileName: string;
    analysisStatus?: 'pending' | 'complete' | 'error';
  }) => {
    setDocumentAnalysis(prev => [...prev, docData]);
  };

  // Step 2: Handle initial questionnaire completion
  const handleQuestionnaireComplete = (answers: Record<string, any>) => {
    setQuestionnaireAnswers(answers);
    // Generate follow-up questions based on answers
    setProfileStage('follow-up');
  };

  // Step 3: Handle follow-up questions completion  
  const handleFollowUpComplete = async (answers: Record<string, any>) => {
    setFollowUpAnswers(answers);
    setProfileStage('analysis');
    
    // Now generate the final analysis with all data
    await generateFinalAnalysis();
  };

  // Generate final analysis combining document analysis and questionnaire answers
  async function generateFinalAnalysis() {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Now only send questionnaire and follow-up data
      // Document analysis happens separately via PDFUploader
      const payload = {
        questionnaireAnswers,
        followUpAnswers
      };
      
      console.log('Sending data for analysis:', payload);
      
      const response = await fetch('/api/financial-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      // Get response details for better error handling
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response: ${response.status}`);
      }
      
      if (!response.ok) {
        console.error('API error details:', result);
        throw new Error(result.error || 'Failed to generate final analysis');
      }
      
      // Handle successful response
      setFinalAnalysis(result.analysis); // Fixed - was setAnalysisResult
      setProfileStage('complete');
      
      // Save the analysis data for future reference
      localStorage.setItem('financialAnalysis', JSON.stringify(result.analysis));
      
      // Clear analysis flag
      setIsAnalyzing(false);
      
      return result.analysis;
    } catch (error) {
      console.error('Error generating analysis:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsAnalyzing(false);
      return null;
    }
  }

  // Handle starting the financial profile process
  const startProfileProcess = () => {
    setProfileStage('document-upload');
  };

  // Progress to questionnaire after document upload
  const proceedToQuestionnaire = () => {
    setProfileStage('questionnaire');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Financial Profile</h1>
      <p className="text-gray-400">
        Build your comprehensive financial profile to receive personalized recommendations.
      </p>
      
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
        {/* Step 1: Initial screen */}
        {profileStage === 'initial' && (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-white mb-4">Create Your Financial Profile</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Upload your financial documents and answer a few questions to receive a comprehensive analysis of your finances.
            </p>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              onClick={startProfileProcess}
            >
              Start Process
            </button>
          </div>
        )}
        
        {/* Step 2: Document upload */}
        {profileStage === 'document-upload' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Upload Financial Documents</h2>
            <p className="text-gray-400 mb-6">
              Upload your bank statements, investment reports, and other financial documents for analysis.
            </p>
            
            <PDFUploader 
              onDocumentProcessed={handleDocumentProcessed}
            />
            
            {/* Allow skipping document upload */}
            <div className="mt-6 text-center">
              <button
                className="text-gray-400 hover:text-white text-sm"
                onClick={proceedToQuestionnaire}
              >
                Skip document upload and continue to questionnaire
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Questionnaire */}
        {profileStage === 'questionnaire' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Financial Questionnaire</h2>
            <p className="text-gray-400 mb-6">
              Please answer these questions about your financial situation.
            </p>
            
            <FinancialQuestionnaire
              documentInsights={documentAnalysis}
              onComplete={handleQuestionnaireComplete}
            />
          </div>
        )}
        
        {/* Step 4: Follow-up questions */}
        {profileStage === 'follow-up' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Additional Questions</h2>
            <p className="text-gray-400 mb-6">
              Based on your answers, we have a few more questions to better understand your financial situation.
            </p>
            
            <FollowUpQuestions
              initialAnswers={questionnaireAnswers}
              documentAnalysis={documentAnalysis}
              onComplete={handleFollowUpComplete}
            />
          </div>
        )}
        
        {/* Step 5: Analysis in progress */}
        {profileStage === 'analysis' && (
          <div className="text-center py-12">
            <RiLoader4Line className="animate-spin h-16 w-16 text-blue-500 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">Analyzing Your Financial Profile</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Our AI is processing your information to create a comprehensive financial profile.
              This usually takes 20-30 seconds.
            </p>
            
            <div className="max-w-sm mx-auto mt-8 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Processing documents</span>
                <span className="text-green-400 text-sm">Completed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Analyzing questionnaire</span>
                <span className="text-green-400 text-sm">Completed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Generating insights</span>
                <span className="text-blue-400 text-sm">Processing...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Creating recommendations</span>
                <span className="text-gray-500 text-sm">Waiting...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 6: Complete */}
        {profileStage === 'complete' && finalAnalysis && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Your Financial Profile</h2>
            <p className="text-gray-400 mb-6">
              Here is the comprehensive analysis of your financial situation.
            </p>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-2">Risk Score</h3>
              <p className="text-gray-300 mb-4">{finalAnalysis.riskScore}</p>
              
              <h3 className="text-lg font-bold text-white mb-2">Summary</h3>
              <p className="text-gray-300 mb-4">{finalAnalysis.summary}</p>
              
              <h3 className="text-lg font-bold text-white mb-2">Insights</h3>
              <ul className="list-disc list-inside text-gray-300 mb-4">
                {finalAnalysis.insights.map((insight, index) => (
                  <li key={index}>{insight.text}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-bold text-white mb-2">Psychological Profile</h3>
              <p className="text-gray-300 mb-4">{finalAnalysis.psychologicalProfile}</p>
              
              <h3 className="text-lg font-bold text-white mb-2">Recommended Actions</h3>
              <ul className="list-disc list-inside text-gray-300">
                {finalAnalysis.recommendedActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800/40 text-red-300 p-4 rounded-lg mt-6">
            <p>{error}</p>
          </div>
        )}
      </div>
      
      {/* Add loading indicator for analysis state */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <RiLoader4Line className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-white">Analyzing your financial data...</p>
          </div>
        </div>
      )}
    </div>
  );
}