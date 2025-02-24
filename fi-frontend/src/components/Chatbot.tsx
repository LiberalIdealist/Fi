'use client';

import React, { useState } from 'react';
import { getMarketAnalysis } from '@/utils/api';
import { AnalysisType, MarketAnalysis, AnalysisRequest } from '@/types/analysis';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
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

    // Extract company name and ticker from input
    const [companyName, ticker] = input.split(' ');

    const request: AnalysisRequest = {
      company: companyName,
      type: 'Market',
      ticker: ticker
    };

    try {
      setLoading(true);
      setMessages(prev => [...prev, userMessage]);
      
      const analysisResult = await getMarketAnalysis(request);
      setAnalysis(analysisResult);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: analysisResult.analysis,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setInput('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-gray-800/50 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Market Analysis Assistant</h2>
      
      <div className="space-y-4">
        <div className="messages space-y-2">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-600/20 ml-auto' 
                  : 'bg-gray-700/50'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs text-gray-400">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalysisRequest()}
            placeholder="Enter company name and ticker (e.g., Reliance RELIANCE.NS)"
            className="flex-1 px-4 py-2 bg-gray-700 rounded-lg"
          />
        </div>

        <button
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          onClick={handleAnalysisRequest}
          disabled={loading || !input.trim()}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
            {error}
          </div>
        )}

        {analysis && (
          <div className="p-4 bg-gray-700/50 rounded-lg space-y-2">
            <h3 className="font-semibold">{analysis.company} - {analysis.type} Analysis</h3>
            <p className="text-gray-300 whitespace-pre-wrap">
              {analysis.summary}
            </p>
            <ul className="list-disc list-inside text-gray-300">
              {analysis.keyHighlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
            <div className="flex gap-4 text-sm text-gray-400">
              <span>Score: {Math.round(analysis.metrics.score)}%</span>
              <span>Confidence: {Math.round(analysis.metrics.confidence)}%</span>
              <span>Risk: {Math.round(analysis.metrics.risk)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
