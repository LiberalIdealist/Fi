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
  marketIndicators: Array<{
    name: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
  }>;
}

export default function Chatbot({ marketIndicators }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketSummary, setMarketSummary] = useState<string | null>(null);

  const handleAnalysisRequest = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const request: AnalysisRequest = {
      query: input.trim(),
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

      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(15000) // 15 seconds timeout
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const analysisResult: MarketAnalysis = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: analysisResult.summary || analysisResult.content || 'Analysis completed, but no summary was generated.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setInput('');
      setError(null);
      if (analysisResult && analysisResult.summary) {
        setMarketSummary(analysisResult.summary);
      } else {
        setMarketSummary("Analysis completed, but no summary was generated.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(`Market analysis error: ${errorMessage}`);
      setMarketSummary("Error generating market analysis.");
    } finally {
      setLoading(false);
    }
  };

  const extractCompanyName = (query: string): string => {
    const companyKeywords = ['analysis', 'stock', 'company', 'about'];
    const companyNames = {
      'reliance.NS': 'Reliance Industries',
      'tcs.ns': 'Tata Consultancy Services',
      'infosys.ns': 'Infosys',
      'hdfc.ns': 'HDFC Bank',
      'airtel.ns': 'Bharti Airtel',
      'l&t.ns': 'Larsen & Toubro'
    };

    const lowerQuery = query.toLowerCase();

    for (const [keyword, fullName] of Object.entries(companyNames)) {
      if (lowerQuery.includes(keyword)) {
        return fullName;
      }
    }

    for (const keyword of companyKeywords) {
      if (lowerQuery.includes(keyword)) {
        return query;
      }
    }

    return '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800/50 rounded-lg shadow-lg border-gradient p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Indian Financial Intelligence Assistant</h2>

      <div className="h-64 overflow-y-auto mb-4 p-4 bg-gray-900/30 rounded-lg">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center py-10">
            <p>Ask any question about Indian markets or specific companies.</p>
            <p className="text-sm mt-1">Example: &quot;How are IT stocks performing in India?&quot; or &quot;Analyze Reliance Industries&quot;</p>
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
      </div>

      {marketSummary && (
        <div className="mt-4 bg-gray-800/70 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Market Analysis</h3>
          <div className="text-gray-200 whitespace-pre-wrap">
            {marketSummary}
          </div>
        </div>
      )}
    </div>
  );
}
