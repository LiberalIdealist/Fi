'use client';

import React, { useState } from 'react';
import { AnalysisRequest, MarketAnalysis } from '@/types/analysis';
import { RiSendPlaneFill, RiLoader4Line } from 'react-icons/ri';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  // Add marketIndicators prop to receive data from parent
  marketIndicators: Array<{
    name: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
  }>;
}

const Chatbot: React.FC<ChatbotProps> = ({ marketIndicators }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisRequest = async () => {
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    // Fix missing query property
    const request: AnalysisRequest = {
      query: input.trim(), // Add required query field
      company: extractCompanyName(input.trim()),
      type: 'Market',
      context: {
        marketIndicators: marketIndicators.map(indicator => ({
          name: indicator.name,
          value: indicator.value,
          change: indicator.change
        }))
      }
    };

    try {
      setLoading(true);
      setMessages(prev => [...prev, userMessage]);
      
      // Call the API
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        // Add timeout handling
        signal: AbortSignal.timeout(15000) // 15 seconds timeout
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const analysisResult = await response.json();
      setAnalysis(analysisResult);

      // Fix possibly undefined content
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        // Ensure content is always a string
        content: analysisResult.summary || analysisResult.content || 'Analysis completed, but no summary was generated.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setInput('');
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(`Market analysis error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract company name from query
  const extractCompanyName = (query: string): string => {
    // Simple detection of company names from input
    const companyKeywords = ['analysis', 'stock', 'company', 'about'];
    const companyNames = {
      'Reliance.NS': 'Reliance Industries',
      'tcs.ns': 'Tata Consultancy Services',
      'infosys.ns': 'Infosys',
      'hdfc.ns': 'HDFC Bank',
      'airtel.ns': 'Bharti Airtel',
      'l&t.ns': 'Larsen & Toubro'
    };

    const lowerQuery = query.toLowerCase();
    
    // Check if query contains a company name
    for (const [keyword, fullName] of Object.entries(companyNames)) {
      if (lowerQuery.includes(keyword)) {
        return fullName;
      }
    }
    
    // Check if query matches pattern "analysis of X" or "about X stock"
    for (const keyword of companyKeywords) {
      if (lowerQuery.includes(keyword)) {
        // Just return the query as-is - the backend will try to extract company
        return query;
      }
    }
    
    // If no company detected, it's a general market query
    return '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800/50 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-white">Indian Financial Intelligence Assistant</h2>
      
      <div className="h-64 overflow-y-auto mb-4 p-4 bg-gray-900/30 rounded-lg">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center py-10">
            <p>Ask any question about Indian markets or specific companies.</p>
            <p className="text-sm mt-1">Example: "How are IT stocks performing in India?" or "Analyze Reliance Industries"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-600/20 ml-auto max-w-[80%]' 
                    : 'bg-gray-700/50 max-w-[90%]'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
                <span className="text-xs text-gray-400 block mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {loading && (
          <div className="flex items-center justify-center p-4">
            <RiLoader4Line className="animate-spin text-blue-400 mr-2" size={20} />
            <span className="text-blue-400">Analyzing Indian markets...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAnalysisRequest()}
            placeholder="Ask about Indian markets or companies..."
            className="flex-1 px-4 py-3 bg-gray-700 rounded-lg text-white"
            disabled={loading}
          />
          <button
            className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            onClick={handleAnalysisRequest}
            disabled={loading || !input.trim()}
          >
            {loading ? <RiLoader4Line className="animate-spin" size={20} /> : <RiSendPlaneFill size={20} />}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg mt-4">
            {error}
          </div>
        )}

        {/* Show detailed analysis only if we have it and user isn't interacting */}
        {analysis && messages.length > 0 && !loading && (
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg text-white">
              {analysis.company ? `${analysis.company} Analysis` : 'Indian Market Analysis'}
            </h3>
            
            {/* Add null checks for all potentially undefined properties */}
            {analysis.keyHighlights && analysis.keyHighlights.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-md text-blue-400">Key Highlights</h4>
                <ul className="list-disc list-inside text-gray-300">
                  {analysis.keyHighlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysis.analysis && (
              <div className="space-y-2">
                <h4 className="font-semibold text-md text-blue-400">Detailed Analysis</h4>
                <div className="text-gray-300 space-y-2">
                  {analysis.analysis.technical && (
                    <p><span className="font-medium">Technical:</span> {analysis.analysis.technical}</p>
                  )}
                  {analysis.analysis.fundamental && (
                    <p><span className="font-medium">Fundamental:</span> {analysis.analysis.fundamental}</p>
                  )}
                  {analysis.analysis.risk && (
                    <p><span className="font-medium">Risk:</span> {analysis.analysis.risk}</p>
                  )}
                </div>
              </div>
            )}
            
            {analysis.metrics && (
              <div className="flex gap-4 text-sm text-gray-400">
                {typeof analysis.metrics.score !== 'undefined' && (
                  <span>Score: {Math.round(analysis.metrics.score * 100)}%</span>
                )}
                {typeof analysis.metrics.confidence !== 'undefined' && (
                  <span>Confidence: {Math.round(analysis.metrics.confidence * 100)}%</span>
                )}
                {typeof analysis.metrics.risk !== 'undefined' && (
                  <span>Risk: {Math.round(analysis.metrics.risk * 100)}%</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
