'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  RiArrowLeftLine, RiUpload2Line, RiFileTextLine,
  RiCheckLine, RiErrorWarningLine, RiLoader4Line
} from 'react-icons/ri';
import FinancialQuestionnaire from '@/components/FinancialQuestionnaire';
import AIProfileSummary from '@/components/AIProfileSummary';
import FollowUpQuestions from '@/components/FollowUpQuestions';
import type { QuestionnaireAnswers } from '@/types/shared';
import { analyzeThroughChatGPT } from '@/utils/chatGptAnalyzer';
import { extractTextFromPDF } from '@/utils/pdfExtractor';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error' | 'analyzing';
type ProfileStage = 'initial' | 'document-upload' | 'questionnaire' | 'analysis' | 'complete';

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
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [documents, setDocuments] = useState<string[]>([]);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<QuestionnaireAnswers>({});
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});
  const [documentText, setDocumentText] = useState<string>('');

  // Fetch user's financial profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.email) return;
      
      try {
        // Simulating API call to get profile data
        // Replace with actual API call
        setTimeout(() => {
          // For demo purposes, assume user has no profile yet
          setIsLoadingProfile(false);
          // Uncomment this to simulate a user with existing profile
          // setProfileStage('complete');
          // setDocuments(['financial_statement_2022.pdf']);
        }, 1000);
        
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load your financial profile');
        setIsLoadingProfile(false);
      }
    };
    
    fetchProfileData();
  }, [session]);
  
  // Handle document upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadStatus('uploading');
    setError(null);
    
    try {
      const files = Array.from(e.target.files);
      const pdfFiles = files.filter(file => file.type === 'application/pdf');
      
      // Add uploaded document names to state
      const newDocs = files.map(f => f.name);
      setDocuments(prev => [...prev, ...newDocs]);
      
      setUploadStatus('success');
      
      // If there are PDF files, extract their text for analysis
      if (pdfFiles.length > 0) {
        setUploadStatus('analyzing');
        
        try {
          // Extract text from PDFs
          const extractionPromises = pdfFiles.map(file => extractTextFromPDF(file));
          const extractedTexts = await Promise.all(extractionPromises);
          const combinedText = extractedTexts.join('\n\n');
          
          // Store the extracted text for analysis
          setDocumentText(combinedText);
          
          // If we have enough text for analysis (more than 500 chars)
          if (combinedText.length > 500) {
            // Try to generate analysis directly from documents
            setProfileStage('analysis');
            await generateAIAnalysis(true);
          } else {
            // If documents don't contain enough information, move to questionnaire
            setProfileStage('questionnaire');
          }
        } catch (error) {
          console.error('Error analyzing documents:', error);
          // If document analysis fails, fall back to questionnaire
          setProfileStage('questionnaire');
        }
      } else {
        // No PDFs to analyze, move to questionnaire
        setProfileStage('questionnaire');
      }
      
      setUploadStatus('idle');
    } catch (err) {
      console.error('Error uploading documents:', err);
      setUploadStatus('error');
      setError('Document upload failed. Please try again.');
    }
  };
  
  // Handle questionnaire submission
  const handleQuestionnaireSubmit = async (answers: QuestionnaireAnswers) => {
    try {
      setQuestionnaireAnswers(answers);
      
      // Process questionnaire answers
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Move to analysis stage
      setProfileStage('analysis');
      generateAIAnalysis(false);
      
      return Promise.resolve();
    } catch (err) {
      console.error('Error submitting questionnaire:', err);
      setError('Failed to submit questionnaire');
      return Promise.reject(err);
    }
  };
  
  // Generate AI analysis from documents and/or questionnaire
  const generateAIAnalysis = async (_fromDocsOnly: boolean) => {
    try {
      setError(null);
      
      // Prepare data for AI analysis
      const analysisData = {
        questionnaireAnswers: {
          ...questionnaireAnswers,
          ...followUpAnswers
        },
        documentText: documentText,
        userInfo: {
          name: session?.user?.name,
          email: session?.user?.email
        }
      };
      
      // Start with initial analysis using ChatGPT
      const result = await analyzeThroughChatGPT(analysisData);
      
      // If there are follow-up questions and we haven't shown them yet
      if (result.suggestedFollowUps && result.suggestedFollowUps.length > 0 && !showFollowUps) {
        setFollowUpQuestions(result.suggestedFollowUps);
        setShowFollowUps(true);
        return;
      }
      
      // If we've collected follow-up answers or there are none needed
      setAnalysisResult({
        id: 'analysis-' + Date.now(),
        userId: session?.user?.id || 'anonymous',
        riskScore: result.riskScore,
        summary: result.summary,
        insights: result.insights,
        psychologicalProfile: result.psychologicalProfile,
        recommendedActions: result.recommendedActions,
        timestamp: new Date().toISOString()
      });
      
      setProfileStage('complete');
    } catch (err) {
      console.error('Error generating AI analysis:', err);
      setError('Failed to generate your financial profile analysis. Please try again.');
    }
  };
  
  // Handle follow-up question answers
  const handleFollowUpAnswer = (question: string, answer: string) => {
    setFollowUpAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  // Prompt user to upload documents
  const promptUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Start the profiling process over
  const restartProcess = () => {
    setProfileStage('initial');
    setDocuments([]);
    setQuestionnaireAnswers({});
    setAnalysisResult(null);
  };
  
  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RiLoader4Line className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading your financial profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">
            <RiArrowLeftLine size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Financial Profile</h1>
        </div>
        
        {profileStage === 'complete' && (
          <button
            onClick={restartProcess}
            className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300"
          >
            Restart Analysis
          </button>
        )}
      </div>
      
      {/* Process Steps Indicator */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50 mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { label: 'Upload Documents', stage: 'document-upload' },
            { label: 'Profile Questionnaire', stage: 'questionnaire' },
            { label: 'AI Analysis', stage: 'analysis' },
            { label: 'Complete', stage: 'complete' }
          ].map((step, index) => (
            <React.Fragment key={step.stage}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  profileStage === step.stage 
                    ? 'bg-blue-600 text-white' 
                    : profileStage === 'complete' || 
                      ['document-upload', 'questionnaire', 'analysis', 'complete'].indexOf(profileStage) > 
                      ['document-upload', 'questionnaire', 'analysis', 'complete'].indexOf(step.stage as ProfileStage)
                      ? 'bg-green-600/80 text-white'
                      : 'bg-gray-800 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <span className={`text-xs mt-2 ${
                  profileStage === step.stage 
                    ? 'text-blue-400' 
                    : profileStage === 'complete' || 
                      ['document-upload', 'questionnaire', 'analysis', 'complete'].indexOf(profileStage) > 
                      ['document-upload', 'questionnaire', 'analysis', 'complete'].indexOf(step.stage as ProfileStage)
                      ? 'text-green-400'
                      : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {/* Connector Line (except after last item) */}
              {index < 3 && (
                <div className={`flex-1 h-1 mx-2 ${
                  profileStage === 'complete' || 
                  ['document-upload', 'questionnaire', 'analysis', 'complete'].indexOf(profileStage) > 
                  index + 1
                    ? 'bg-green-600/50'
                    : 'bg-gray-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Main content area - conditionally render based on stage */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
        {error && (
          <div className="bg-red-900/20 border border-red-800/40 text-red-300 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <RiErrorWarningLine size={20} />
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
        
        {/* Initial stage */}
        {profileStage === 'initial' && (
          <div className="text-center py-12 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-4">Create Your Financial Profile</h2>
            <p className="text-gray-400 mb-8">
              Let&apos;s create your personalized financial profile. We&apos;ll analyze your financial documents 
              and ask you some questions to understand your financial situation, goals, and risk tolerance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setProfileStage('document-upload')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                <RiUpload2Line size={20} />
                Start with Document Upload
              </button>
              <button
                onClick={() => setProfileStage('questionnaire')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-all"
              >
                Skip to Questionnaire
              </button>
            </div>
          </div>
        )}
        
        {/* Document upload stage */}
        {profileStage === 'document-upload' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-4">Upload Financial Documents</h2>
            <p className="text-gray-400 mb-6">
              Upload your financial statements, tax returns, or investment portfolios. 
              Our AI will analyze them to create a personalized financial profile.
            </p>
            
            {/* File upload area */}
            <div
              onClick={promptUpload}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                uploadStatus === 'uploading' || uploadStatus === 'analyzing'
                  ? 'bg-blue-900/20 border-blue-800/40'
                  : uploadStatus === 'success'
                  ? 'bg-green-900/20 border-green-800/40'
                  : uploadStatus === 'error'
                  ? 'bg-red-900/20 border-red-800/40'
                  : 'border-gray-700/50 hover:border-blue-700/70 hover:bg-gray-800/30'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                multiple
              />
              
              {uploadStatus === 'uploading' ? (
                <div className="text-center">
                  <RiLoader4Line className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-blue-300 font-medium">Uploading documents...</p>
                </div>
              ) : uploadStatus === 'analyzing' ? (
                <div className="text-center">
                  <RiLoader4Line className="animate-spin h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <p className="text-purple-300 font-medium">Analyzing your documents with AI...</p>
                  <p className="text-gray-400 text-sm mt-2">This may take a minute</p>
                </div>
              ) : uploadStatus === 'success' ? (
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <RiCheckLine className="h-6 w-6 text-green-400" />
                  </div>
                  <p className="text-green-300 font-medium">Documents uploaded successfully!</p>
                </div>
              ) : (
                <div className="text-center">
                  <RiUpload2Line className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-white font-medium">Drag & drop files or click to browse</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Supported formats: PDF, DOC, DOCX, XLS, XLSX
                  </p>
                </div>
              )}
            </div>
            
            {/* Documents list */}
            {documents.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-medium mb-2">Uploaded Documents</h3>
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-800/60 p-3 rounded-lg">
                      <RiFileTextLine className="text-blue-400" />
                      <span className="text-gray-300 text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setProfileStage('initial')}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300"
              >
                Back
              </button>
              
              <button
                onClick={() => setProfileStage('questionnaire')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:bg-gray-700 disabled:text-gray-400"
                disabled={uploadStatus === 'uploading' || uploadStatus === 'analyzing'}
              >
                {documents.length > 0 ? 'Continue to Questionnaire' : 'Skip Document Upload'}
              </button>
            </div>
          </div>
        )}
        
        {/* Questionnaire stage */}
        {profileStage === 'questionnaire' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Financial Profile Questionnaire</h2>
            <FinancialQuestionnaire 
              onSubmit={handleQuestionnaireSubmit} 
              initialAnswers={questionnaireAnswers}
            />
          </div>
        )}
        
        {/* Analysis stage */}
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
                <span className="text-gray-400 text-sm">Generating risk profile</span>
                <span className="text-blue-400 text-sm">Processing...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Creating recommendations</span>
                <span className="text-gray-500 text-sm">Waiting...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Complete stage - Show AI Profile Summary */}
        {profileStage === 'complete' && analysisResult && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Your Financial Profile</h2>
              <span className="text-xs text-gray-400">
                Generated on {new Date(analysisResult.timestamp).toLocaleDateString()}
              </span>
            </div>
            
            <AIProfileSummary 
              riskScore={analysisResult.riskScore}
              summary={analysisResult.summary}
              insights={analysisResult.insights}
              psychologicalProfile={analysisResult.psychologicalProfile}
              recommendedActions={analysisResult.recommendedActions}
            />
          </div>
        )}

        {/* Follow-up questions */}
        {showFollowUps && followUpQuestions.length > 0 && (
          <FollowUpQuestions
            questions={followUpQuestions}
            onAnswer={handleFollowUpAnswer}
            onComplete={() => {
              setShowFollowUps(false);
              generateAIAnalysis(false);
            }}
          />
        )}
      </div>
    </div>
  );
}