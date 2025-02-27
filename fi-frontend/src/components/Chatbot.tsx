'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RiSendPlaneFill, RiLoader4Line } from 'react-icons/ri';
import { formatAIResponse } from '@/utils/formatters';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  // Remove marketIndicators if not used
}

export default function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAnalysisRequest = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/financial-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          conversationId: conversationId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Set conversation ID if it's a new conversation
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
      
      // Format the AI response before displaying it
      const formattedResponse = formatAIResponse(data.response || "I couldn't find relevant information.");
      
      const assistantMessage: ChatMessage = {
        id: data.messageId || (Date.now() + 1).toString(),
        role: 'assistant',
        content: formattedResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Analysis request error:', error);
        setError('Failed to get analysis. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800/50 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Indian Financial Intelligence Assistant</h2>

      <div className="chat-container">
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
                className={msg.role === 'user' ? 'message-bubble-user' : 'message-bubble-ai'}
              >
                <p className="text-sm whitespace-pre-line break-words">
                  {msg.content}
                </p>
                <span className="text-xs text-gray-400 block mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center p-4">
            <RiLoader4Line className="animate-spin text-blue-400 mr-2" size={20} />
            <span className="text-blue-400">Analyzing your question...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAnalysisRequest()}
            placeholder="Ask about Indian markets or personal finance..."
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
    </div>
  );
}
