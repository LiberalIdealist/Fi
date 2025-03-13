"use client";

import { useState, useEffect } from "react";
import { geminiService } from "../../services/geminiService";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { TbChartDonutFilled } from "react-icons/tb";
import { LuBrain } from "react-icons/lu";
import { CgDanger } from "react-icons/cg";

interface GeminiAnalysis {
  riskScore?: number;
  riskProfile?: string;
  psychologicalInsights?: string;
  financialInsights?: string;
  recommendations?: string | string[];
  insights?: string | string[];
}

const AIProfileSummary = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<GeminiAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        
        try {
          // Try the primary method first
          console.log('Trying primary analysis fetch method...');
          const data = await geminiService.getAnalysisResults(userId);
          setProfile(data);
          setError(null);
          setUsingFallback(false);
        } catch (primaryErr) {
          console.warn('Primary analysis fetch failed, trying fallback...', primaryErr);
          
          // Try the fallback method if available
          try {
            const fallbackData = await geminiService.getAnalysisForUser(userId);
            if (fallbackData) {
              console.log('Fallback analysis fetch succeeded');
              setProfile(fallbackData);
              setError(null);
              setUsingFallback(true);
            } else {
              // If fallback returned null or undefined
              throw new Error('No analysis data available');
            }
          } catch (fallbackErr: any) {
            console.error('Both analysis fetch methods failed:', fallbackErr);
            setError(fallbackErr.message || 'Failed to load analysis data');
            
            // Try to create a default profile as last resort
            setProfile({
              riskScore: 5,
              riskProfile: "Moderate (Default)",
              psychologicalInsights: "A balanced approach to investing is recommended based on available information.",
              financialInsights: "Consider establishing emergency funds before pursuing more aggressive investments.",
              recommendations: "Regular investment contributions are important for long-term financial growth."
            });
            setUsingFallback(true);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAnalysis();
    }
  }, [userId]);
  
  // Add a small indicator for when fallback is used
  const FallbackIndicator = () => {
    if (!usingFallback) return null;
    
    return (
      <div className="mt-1 text-xs text-amber-400 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Using local data (limited connectivity)
      </div>
    );
  };

  // Function to render risk score with colored indicator
  const renderRiskScore = (score?: number) => {
    if (!score) return null;
    
    let color;
    if (score <= 3) color = "bg-green-500";
    else if (score <= 7) color = "bg-yellow-500";
    else color = "bg-red-500";
    
    return (
      <div className="flex items-center">
        <span className="text-2xl font-bold text-gray-200">{score}</span>
        <div className={`w-4 h-4 rounded-full ml-2 ${color}`}></div>
        <span className="text-sm text-gray-400 ml-2">/ 10</span>
      </div>
    );
  };

  return (
    <div className="text-gray-200">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <AiOutlineLoading3Quarters className="animate-spin text-blue-400 text-3xl mb-3" />
          <p className="text-gray-400">Analyzing your financial profile...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-start">
          <CgDanger className="text-red-500 text-xl flex-shrink-0 mt-1 mr-3" />
          <div>
            <h3 className="font-semibold text-red-400">Analysis Error</h3>
            <p className="text-gray-300 mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-3 text-sm bg-red-800/50 hover:bg-red-800 px-4 py-1.5 rounded text-red-200"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : profile ? (
        <div className="space-y-6">
          {/* Header with Risk Score and Fallback Indicator */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-blue-400">Risk Analysis</h2>
              <p className="text-gray-400 mt-1">Based on your questionnaire responses</p>
              <FallbackIndicator />
            </div>
            <div className="mt-4 md:mt-0 bg-gray-800/80 rounded-lg px-4 py-3 border border-gray-700">
              <div className="text-xs uppercase text-gray-500 font-semibold mb-1">Risk Score</div>
              {renderRiskScore(profile.riskScore)}
            </div>
          </div>
          
          {/* Risk Profile */}
          <div className="rounded-lg bg-gray-800/40 border border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2 text-blue-300">
              <TbChartDonutFilled className="text-xl" />
              <h3 className="font-semibold">Risk Profile</h3>
            </div>
            <p className="text-lg font-medium text-gray-200">{profile.riskProfile || "Not available"}</p>
          </div>
          
          {/* Insights */}
          <div className="rounded-lg bg-gray-800/40 border border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3 text-purple-300">
              <LuBrain className="text-xl" />
              <h3 className="font-semibold">Key Insights</h3>
            </div>
            
            {profile.psychologicalInsights && (
              <div className="mb-3">
                <h4 className="text-sm text-gray-400 mb-1">Psychological</h4>
                <p className="text-gray-200">{profile.psychologicalInsights}</p>
              </div>
            )}
            
            {profile.financialInsights && (
              <div>
                <h4 className="text-sm text-gray-400 mb-1">Financial</h4>
                <p className="text-gray-200">{profile.financialInsights}</p>
              </div>
            )}
            
            {Array.isArray(profile.insights) && profile.insights.length > 0 && (
              <div className="mt-3 space-y-2">
                {profile.insights.map((insight, index) => (
                  <div key={index} className="bg-gray-700/30 p-3 rounded-md">
                    <p className="text-gray-200">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Recommendations */}
          <div className="rounded-lg bg-gray-800/40 border border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3 text-green-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <h3 className="font-semibold">Recommendations</h3>
            </div>
            
            {typeof profile.recommendations === 'string' ? (
              <div className="bg-gray-700/30 p-3 rounded-md">
                <p className="text-gray-200">{profile.recommendations}</p>
              </div>
            ) : Array.isArray(profile.recommendations) && profile.recommendations.length > 0 ? (
              <div className="space-y-2">
                {profile.recommendations.map((rec, index) => (
                  <div key={index} className="bg-gray-700/30 p-3 rounded-md">
                    <p className="text-gray-200">{rec}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No specific recommendations available</p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No analysis data available. Complete the questionnaire to get started.</p>
          <a 
            href="/dashboard/questionnaire" 
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
          >
            Take Questionnaire
          </a>
        </div>
      )}
    </div>
  );
};

export default AIProfileSummary;