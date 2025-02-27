"use client";

import React, { useState, useEffect } from "react";
import type { QuestionnaireAnswers } from "@/types/shared";
import { motion } from "framer-motion";

interface FinancialQuestionnaireProps {
  onSubmit: (answers: QuestionnaireAnswers) => Promise<void>;
  initialAnswers?: QuestionnaireAnswers;
}

interface MessageDisplayProps {
  message: string;
  type?: 'success' | 'error';
}

interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    options: string[];
  };
  value: string;
  onChange: (id: string, value: string) => void;
  isAnswered: boolean;
}

const FinancialQuestionnaire: React.FC<FinancialQuestionnaireProps> = ({ 
  onSubmit, 
  initialAnswers = {} 
}) => {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(initialAnswers);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  // These questions are critical for risk assessment and must not be changed
  const questions = [
    { id: "q1", text: "How do you react to market volatility?", options: ["I panic and sell", "I stay invested but worry", "I see it as an opportunity", "I invest more"] },
    { id: "q2", text: "What is your primary financial goal?", options: ["Wealth Preservation", "Steady Growth", "High Growth", "Speculative Gains"] },
    { id: "q3", text: "How comfortable are you with high-risk investments?", options: ["Not at all", "Somewhat", "Comfortable", "Very Comfortable"] },
    { id: "q4", text: "How long can you invest without needing the money?", options: ["Less than 1 year", "1-3 years", "3-5 years", "More than 5 years"] },
    { id: "q5", text: "How do you manage unexpected expenses?", options: ["Use savings", "Use credit card", "Take a loan", "Sell investments"] },
    { id: "q6", text: "What percentage of your income do you save monthly?", options: ["Less than 10%", "10-20%", "20-40%", "More than 40%"] },
    { id: "q7", text: "Do you have emergency savings?", options: ["No", "Less than 3 months", "3-6 months", "More than 6 months"] },
    { id: "q8", text: "How do you choose financial products?", options: ["Friend's advice", "Bank/Agent recommendations", "Research online", "Professional advisor"] },
    { id: "q12", text: "What is your primary source of investment information?", options: ["News & TV", "Online Blogs", "Financial Advisors", "Own Research"] },
    { id: "q13", text: "How do you feel about using AI for financial planning?", options: ["Uncomfortable", "Skeptical", "Neutral", "Excited"] },
    { id: "q14", text: "How frequently do you review your financial goals?", options: ["Never", "Annually", "Every 6 months", "Quarterly"] },
    { id: "q15", text: "Do you currently have any financial dependents?", options: ["None", "Parents", "Spouse/Kids", "Extended Family"] },
  ];

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    const missingAnswers = questions
      .filter(q => !answers[q.id])
      .map(q => q.text);
    if (missingAnswers.length > 0) {
      setMessage(`Please answer all questions: ${missingAnswers.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await onSubmit(answers);
      setMessage("Profile saved successfully!");
    } catch (error) {
      setMessage("Error saving profile.");
      console.error('Error submitting questionnaire:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const Progress: React.FC = () => {
    const answered = Object.keys(answers).length;
    const total = questions.length;
    const percentage = Math.round((answered / total) * 100);
    
    return (
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
        <div 
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    );
  };

  const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, type = 'success' }) => (
    <div 
      className={`mt-4 p-3 rounded ${
        type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
      }`}
      role="alert"
    >
      {message}
    </div>
  );

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Financial Risk & Behavior Questionnaire</h2>
      <Progress />
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        {questions.map((q) => (
          <div key={q.id} className="mb-4">
            <label className="text-gray-200" htmlFor={q.id}>{q.text}</label>
            <select
              id={q.id}
              name={q.id}
              aria-label={q.text}
              aria-required="true"
              aria-invalid={!answers[q.id]}
              className="w-full p-2 mt-1 bg-gray-800 text-white rounded"
              onChange={(e) => handleChange(q.id, e.target.value)}
              value={answers[q.id] || ""}
              required
            >
              <option value="">Select an option</option>
              {q.options.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
        <button 
          type="submit"
          className={`w-full py-2 rounded mt-4 text-white transition-colors duration-200 ${
            isLoading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-700'
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Submit Answers'}
        </button>
      </form>
      {message && <MessageDisplay message={message} type={message.includes('Error') ? 'error' : 'success'} />}
    </div>
  );
};

export default FinancialQuestionnaire;
