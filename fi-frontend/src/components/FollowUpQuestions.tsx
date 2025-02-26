"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RiArrowRightLine, RiQuestionAnswerLine } from 'react-icons/ri';

interface FollowUpQuestionsProps {
  questions: string[];
  onAnswer: (question: string, answer: string) => void;
  onComplete: () => void;
}

export default function FollowUpQuestions({ 
  questions, 
  onAnswer, 
  onComplete 
}: FollowUpQuestionsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState<{question: string, answer: string}[]>([]);
  
  const handleSubmit = () => {
    if (!answer.trim()) return;
    
    // Save this answer
    const currentQuestion = questions[currentQuestionIndex];
    onAnswer(currentQuestion, answer);
    
    // Track answered questions
    setAnsweredQuestions([
      ...answeredQuestions,
      { question: currentQuestion, answer }
    ]);
    
    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer('');
    } else {
      onComplete();
    }
  };
  
  return (
    <div className="bg-gray-900/50 p-6 rounded-xl border border-blue-800/30 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-blue-900/30">
          <RiQuestionAnswerLine size={20} className="text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-white">
          Additional Questions
          <span className="text-sm text-gray-400 font-normal ml-2">
            ({currentQuestionIndex + 1}/{questions.length})
          </span>
        </h3>
      </div>
      
      <div className="space-y-6">
        {/* Current question */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/50"
        >
          <p className="text-white mb-4">{questions[currentQuestionIndex]}</p>
          
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Type your answer here..."
          ></textarea>
          
          <button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className={`mt-3 px-4 py-2 rounded-lg flex items-center gap-2 text-white ${
              !answer.trim() 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <span>
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete'}
            </span>
            <RiArrowRightLine />
          </button>
        </motion.div>
        
        {/* Previously answered questions */}
        {answeredQuestions.length > 0 && (
          <div className="border-t border-gray-800 pt-4 mt-6">
            <h4 className="text-sm text-gray-400 mb-3">Previous Responses:</h4>
            
            <div className="space-y-3">
              {answeredQuestions.map((qa, idx) => (
                <div key={idx} className="bg-gray-800/30 p-3 rounded-lg">
                  <p className="text-sm text-blue-400 mb-1">{qa.question}</p>
                  <p className="text-sm text-gray-300">{qa.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 bg-blue-900/20 p-3 rounded-lg border border-blue-800/30">
        <p className="text-xs text-blue-300">
          <strong>Why these questions?</strong> Our AI needs additional information to better understand your financial psychology and provide more accurate recommendations tailored to your specific situation.
        </p>
      </div>
    </div>
  );
}